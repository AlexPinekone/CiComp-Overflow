import { NextRequest, NextResponse } from 'next/server';
import { decrypt, getCurrentSessionFromCookies } from './lib/session';
import { UserRole } from './constants/session';

export async function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;
	const authToken =
		req.headers.get('Authorization') || req.headers.get('authorization');
	const apiKey = req.headers.get('x-api-key');
	const secretKey = req.headers.get('x-secret-key');
	let payload;

	if (authToken) {
		payload = await decrypt(authToken); // Verifica el token JWT
	} else {
		const session = await getCurrentSessionFromCookies();
		if (session) {
			payload = await decrypt(session);
		}
		if (path === '/login' && payload) {
			return NextResponse.redirect(new URL('/', req.url));
		}
		if (path.startsWith('/admin')) {
			if (!payload) {
				return new NextResponse('Forbidden', { status: 403 });
			}
			// Get admin id from the last part of the path
			const adminId = path.split('/').at(-1);
			// Verify that the admin id is the same as the one in the session

			if (payload.userId !== adminId || payload.role !== 'ADMIN') {
				return new NextResponse('Forbidden', { status: 403 });
			}
			return NextResponse.next();
		}

		if (path.startsWith('/profile')) {
			if (!payload) {
				return new NextResponse('Forbidden', { status: 403 });
			}
			// Get user id from the last part of the path
			const userId = path.split('/').at(-1);
			// Verify that the user id is the same as the one in the session

			if (payload.role === UserRole.USER && payload.userId !== userId) {
				return new NextResponse('Forbidden', { status: 403 });
			}
			return NextResponse.next();
		}
	}

	if (path.startsWith('/api')) {
		// Permitir libremente los GET de posts
		if (req.method === 'GET' && path.startsWith('/api/posts')) {
			return NextResponse.next();
		}

		// Permitir crear/actualizar posts para usuarios autenticados (sesión válida)
		if (payload && path.startsWith('/api/posts') && req.method !== 'GET') {
			return NextResponse.next();
		}

		if (
			path === '/api/user/login' ||
			path === '/api/user/signup' ||
			(payload && path === `/api/user/${payload.userId}/logout`)
		) {
			return NextResponse.next();
		}

		// Permitir comentarios para usuarios autenticados sin API keys
		if (
			payload &&
			((path.startsWith('/api/posts/') && path.includes('/comments')) ||
				path.startsWith('/api/comments/'))
		) {
			return NextResponse.next();
		}

		if (payload && path.startsWith('/api/profiles')) {
			return NextResponse.next();
		}

		if (
			apiKey === process.env.API_KEY &&
			secretKey === process.env.SECRET_KEY
		) {
			const response = NextResponse.next();
			response.headers.set('Cache-Control', 'no-store');
			response.headers.set('Access-Control-Allow-Origin', '*');
			response.headers.set(
				'Access-Control-Allow-Methods',
				'GET, POST, PUT, DELETE, OPTIONS'
			);
			return response;
		} else {
			return new NextResponse('Forbidden', { status: 403 });
		}
	}
}

export const config = {
	matcher: ['/api/:path*', '/admin/:path*', '/profile/:path*', '/login'],
};
