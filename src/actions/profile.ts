'use server';

import { z } from 'zod';
import { getCurrentSessionFromCookies, getFetchHeaders } from '@/lib/session';
import axios from 'axios';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const schemaProfile = z.object({
	userName: z
		.string({ invalid_type_error: 'Nombre de usuario inválido' })
		.min(4, { message: 'El usuario debe tener al menos 4 caracteres' }),
	description: z.string().optional(),
	photo: z
		.any()
		.refine((file) => file.size < MAX_FILE_SIZE, 'Max size is 5MB.')
		.nullable()
		.optional(),
});

export async function updateProfile(formData: FormData, id?: string) {
	const session = await getCurrentSessionFromCookies();

	// Construir headers solo con Authorization
	const headers = new Headers();
	if (session) headers.set('Authorization', session);

	// Construir body multipart
	const body = new FormData();
	body.append('userName', formData.get('userName') as string);
	if (formData.get('description')) {
		body.append('description', formData.get('description') as string);
	}
	if (formData.get('photo')) {
		body.append('photo', formData.get('photo') as Blob);
	}
	if (id) {
		body.append('userId', id);
	}

	// Enviar con fetch para permitir boundary automático
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/profiles`,
		{
			method: 'PUT',
			headers, // solo Authorization
			body, // FormData
		}
	);

	if (response.status !== 200) {
		const err = await response.json().catch(() => ({}));
		return {
			errors: { general: [err.error || 'Error al actualizar el perfil'] },
		};
	}
	return { success: 'Perfil actualizado correctamente' };
}

export async function getProfileById(id: string) {
	try {
		const session = await getCurrentSessionFromCookies();
		const headers = getFetchHeaders({ Authorization: session });

		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${id}`,
			{ headers }
		);

		if (response.status !== 200) {
			return { errors: { general: ['Perfil no encontrado'] } };
		}

		return response.data;
	} catch (error) {
		return { errors: { general: ['Error al obtener el perfil'] } };
	}
}

export async function registerProfile(userId: string) {
	try {
		const session = await getCurrentSessionFromCookies();
		const headers = getFetchHeaders({ Authorization: session });

		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/profiles`,
			{ userId },
			{ headers }
		);

		if (response.status !== 201) {
			return { errors: { general: ['No se pudo registrar el perfil'] } };
		}

		return response.data;
	} catch (error) {
		return { errors: { general: ['Error al registrar el perfil'] } };
	}
}

export async function updateProfileStatus(id: string, newStatus: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	try {
		const response = await axios.put(
			`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${id}/status`,
			{ status: newStatus },
			{
				headers,
			}
		);

		if (response.status !== 200) {
			return {
				errors: { general: ['Error al actualizar el perfil'] },
			};
		}

		return { success: 'Perfil actualizado correctamente' };
	} catch (e) {
		console.error(e);
		return { errors: { general: ['Error al actualizar el perfil'] } };
	}
}
