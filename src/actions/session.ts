'use server';

import { getFetchHeaders } from '@/lib/session';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserService } from '@/service/UserService';

export async function loginUser(formData: FormData) {
	const mail = formData.get('mail');
	const password = formData.get('password');
	const headers = getFetchHeaders();
	//let result: { message: string };

	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/user/login`,
			{
				method: 'POST',
				headers,
				body: JSON.stringify({
					mail,
					password,
				}),
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.error || 'Error al iniciar sesión. Intenta de nuevo.'
			);
		}

		const { token } = data;

		const userData = await UserService.getUserByMail({ mail });
		if (!userData) {
			throw new Error('Error al obtener datos del usuario');
		}
		const { profile } = userData;

		//Verificar si está baneado
		if (profile.status === 'BANNED') {
			throw new Error('Tu cuenta ha sido baneada.');
		}

		(await cookies()).set('Authorization', `Bearer ${token}`, {
			httpOnly: true,
			// En desarrollo, permitir HTTP para que el navegador envíe la cookie
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 604800, // 7 días
		});

		//result = { message: 'Login successful' };

		revalidateTag('user_session');
	} catch (error: any) {
		console.error('Error al iniciar sesión', error);
		return {
			error: error.message || 'Error desconocido. Intenta de nuevo.',
		};
	}
	redirect('/');
	//return result;
}
