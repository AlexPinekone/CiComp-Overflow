'use server';
import { UserRole } from '@/constants/session';
import {
	decrypt,
	getCurrentSessionFromCookies,
	getFetchHeaders,
} from '@/lib/session';
import axios from 'axios';

export async function getUserIdFromSession() {
	try {
		const session = await getCurrentSessionFromCookies();
		const headers = getFetchHeaders({
			Authorization: session,
		});
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/user/session`,
			{
				method: 'GET',
				headers,
			}
		);
		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener el usuario'] } };
		}

		const data = await response.json();
		return data.userId;
	} catch (error) {
		console.error('Error al obtener el userId', error);
		return { errors: { general: ['Error al obtener el usuario'] } };
	}
}

export async function getUserRoleFromSession() {
	try {
		// Obtener el ID del usuario desde la sesión
		const userId = await getUserIdFromSession();

		if (userId.errors) {
			return userId; // Si hubo un error al obtener el userId
		}

		// Obtener el rol del usuario usando su ID
		const role = await getUserRoleFromId(userId);

		if (role.errors) {
			return role; // Si hubo un error al obtener el rol
		}

		return role; // El rol del usuario
	} catch (error) {
		return { errors: { general: ['Error al obtener el rol del usuario'] } };
	}
}

export async function getUserNameFromid(userId: string | null) {
	if (!userId) {
		return { errors: { general: ['No se proporcionó un ID de usuario'] } };
	}

	try {
		const session = await getCurrentSessionFromCookies();
		const headers = getFetchHeaders({
			Authorization: session,
		});

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/user/session`, // Asume que tienes un endpoint para obtener el perfil de un usuario por su ID
			{
				method: 'GET',
				headers,
			}
		);

		if (response.status !== 200) {
			return {
				errors: { general: ['Error al obtener el perfil del usuario'] },
			};
		}

		const data = await response.json();
		return data.name; // Asume que la respuesta JSON contiene 'userName'
	} catch (error) {
		console.error('Error al obtener el userName', error);
		return {
			errors: { general: ['Error al obtener el nombre del usuario'] },
		};
	}
}

export async function getUserRoleFromId(id: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/user/session`,
			{
				headers,
			}
		);
		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener el usuario'] } };
		}
		return response.data?.role;
	} catch (error) {
		return { errors: { general: ['Error al obtener el usuario'] } };
	}
}

// Obtener el usuario completo basado en su ID
export async function getUserFromId(id?: string) {
	try {
		const session = await getCurrentSessionFromCookies();
		const headers = getFetchHeaders({
			Authorization: session,
		});
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`,
			{
				headers,
			}
		);
		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener el usuario'] } };
		}
		return response.data; // Retorna los datos completos del usuario
	} catch (error) {
		return { errors: { general: ['Error al obtener el usuario'] } };
	}
}

export async function getUserFromSession() {
	try {
		const session = await getCurrentSessionFromCookies();
		const headers = getFetchHeaders({
			Authorization: session,
		});
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/user/session`,
			{
				headers,
			}
		);
		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener el usuario'] } };
		}
		return response.data;
	} catch (error) {
		return { errors: { general: ['Error al obtener el usuario'] } };
	}
}

export async function getUserProfileDataBySessionOrId(userId?: string) {
	try {
		const session = await getCurrentSessionFromCookies();
		const { role } = session && (await decrypt(session));
		const headers = getFetchHeaders({
			Authorization: session,
		});
		let uri = `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`;
		if (userId && role === UserRole.ADMIN) {
			uri += `?id=${userId}`;
		}
		const response = await axios.get(uri, {
			headers,
		});
		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener el usuario'] } };
		}
		return response.data;
	} catch {
		return { errors: { general: ['Error al obtener el usuario'] } };
	}
}

export async function getActiveUsersLastMonth() {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/user/count`,
			{ headers }
		);

		if (response.status !== 200) {
			return {
				errors: { general: ['Error al contar los usuarios activos'] },
			};
		}

		return { count: response.data.count };
	} catch {
		return {
			errors: { general: ['Error al contar los usuarios activos'] },
		};
	}
}
