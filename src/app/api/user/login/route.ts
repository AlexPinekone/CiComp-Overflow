import { encrypt } from '@/lib/session';
import { UserService } from '@/service/UserService';
import { SessionDAO } from '@/dao/SessionDAO';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { RedisCache } from '@/lib/redis';

export async function POST(request: Request) {
	const { mail, password } = await request.json();
	const redis = await RedisCache.getInstance();
	if (await redis.exists(`user:${mail}`)) {
		let loginTries = Number((await redis.get(`user:${mail}`)) ?? 0);
		console.log({ loginTries });
		if (loginTries >= 5) {
			return NextResponse.json(
				{ error: 'Demasiados intentos de inicio de sesión' },
				{ status: 429 }
			);
		}
		loginTries++;
		await redis.set(`user:${mail}`, `${loginTries}`, 300); // Expira en 5 minutos
	} else {
		await redis.set(`user:${mail}`, '1', 300); // Expira en 5 minutos
	}
	const result = await UserService.getUserByMail({ mail });

	if (!result || !result.account) {
		return NextResponse.json(
			{ error: 'Credenciales inválidas' },
			{ status: 401 }
		);
	}

	const { account, user, profile } = result;

	const isValid = account.password
		? await bcrypt.compare(password, account.password)
		: false;

	if (!isValid) {
		return NextResponse.json(
			{ error: 'Credenciales inválidas' },
			{ status: 401 }
		);
	}

	// Crear o actualizar sesión
	await SessionDAO.upsertSession({
		userId: user.userId,
		sessionStatus: 'ACTIVE',
	});

	// Generar JWT
	const token = await encrypt({
		userId: user.userId,
		role: user.role,
		userName: profile.userName,
	});

	await redis.del(`user:${mail}`);
	// Devolver el token al cliente
	return NextResponse.json(
		{ message: 'Login successful', token },
		{
			headers: {
				'Set-Cookie': `session=Bearer ${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
			},
		}
	);
}

// ! This endpoint is for development purposes only. Remove before deploying to production.
export async function GET(request: NextRequest) {
	// Simulated credential verification
	const user = {
		userId: process.env.USER_EXAMPLE_ID,
		mail: process.env.USER_EXAMPLE_EMAIL,
		password: process.env.USER_EXAMPLE_PASSWORD
			? await bcrypt.hash(process.env.USER_EXAMPLE_PASSWORD, 10)
			: '',
		role: 'ADMIN',
	};

	const isValid = user.password
		? await bcrypt.compare(
				process.env.USER_EXAMPLE_PASSWORD as string,
				user.password
			)
		: false;

	if (!isValid) {
		return NextResponse.json(
			{ error: 'Credenciales inválidas' },
			{ status: 401 }
		);
	}

	// Generate JWT
	const token =
		'Bearer ' + (await encrypt({ userId: user.userId, role: user.role }));
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	const sessionCookies = (await cookies()).set('session', token, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: 'lax',
		path: '/',
	});
	// Return the token to the client
	const redirectUrl = new URL('/', request.nextUrl.origin);

	return NextResponse.redirect(redirectUrl.toString(), {
		headers: { 'Set-Cookie': sessionCookies.toString() },
	});
}
