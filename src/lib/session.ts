import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SECRET_KEY;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
	try {
		const token = session?.split(' ')[1];
		if (!token) throw new Error('Token not provided');
		const { payload } = await jwtVerify(token, encodedKey, {
			algorithms: ['HS256'],
		});
		return payload;
	} catch {
		return null;
	}
}

export async function getCurrentSessionFromCookies() {
	const session = (await cookies()).get('Authorization')?.value;
	if (session) {
		return session;
	}
	return null;
}

export const headers = {
	'Content-Type': 'application/json',
	'x-api-key': process.env.API_KEY || '',
	'x-secret-key': process.env.SECRET_KEY || '',
};

export const getFetchHeaders = (extraHeaders = {}) => {
	return {
		...headers,
		...extraHeaders,
	};
};

export const getUserIdFromSessionClient = async () => {
	const session = await getCurrentSessionFromCookies();
	if (session === null) return null;
	const payload = await decrypt(session);
	return payload?.userId;
};
