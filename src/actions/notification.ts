'use server';

import { z } from 'zod';
import axios from 'axios';
import { getCurrentSessionFromCookies, getFetchHeaders } from '@/lib/session';

const schemaNotification = z.object({
	userId: z.string({
		invalid_type_error: 'ID de usuario inválido',
	}),
	type: z.enum(['ANSWER', 'EDIT', 'LIKE', 'DELETE', 'REQUEST'], {
		invalid_type_error: 'Tipo de notificación inválido',
	}),
	referenceId: z.string({
		invalid_type_error: 'ID de referencia inválido',
	}),
	status: z.enum(['UNREAD', 'READ'], {
		invalid_type_error: 'Estado de notificación inválido',
	}),
});

export async function createNotification(data: {
	userId: string;
	type: 'ANSWER' | 'EDIT' | 'LIKE' | 'DELETE' | 'REQUEST';
	referenceId: string;
	createdByUserId: string;
}) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	const validated = schemaNotification.safeParse({
		...data,
		status: 'UNREAD',
	});
	if (!validated.success) {
		return { errors: validated.error.flatten().fieldErrors };
	}

	try {
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`,
			{
				...data,
				status: 'UNREAD',
			},
			{ headers }
		);

		if (response.status !== 201) {
			return { errors: { general: ['Error al crear la notificación'] } };
		}

		return { success: 'Notificación creada correctamente' };
	} catch {
		return {
			errors: { general: ['Error al crear la notificación'] },
		};
	}
}

export async function getNotificationsByUserId(userId: string) {
	const session = await getCurrentSessionFromCookies();
	//console.log('Session token:', session);

	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/notifications?userId=${userId}`,
			{ headers }
		);

		if (response.status !== 200) {
			return {
				errors: { general: ['Error al obtener las notificaciones'] },
			};
		}

		return { notifications: response.data };
	} catch {
		return {
			errors: { general: ['Error al obtener las notificaciones'] },
		};
	}
}

export async function markNotificationAsRead(notificationId: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.put(
			`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`,
			{ id: notificationId },
			{ headers }
		);

		if (response.status !== 200) {
			// Para verificar si la respuesta no es 200
			return {
				errors: { general: ['Error al actualizar la notificación'] },
			};
		}

		return { success: 'Notificación marcada como leída' };
	} catch {
		// Detalles del error
		return {
			errors: { general: ['Error al actualizar la notificación'] },
		};
	}
}

export async function deleteNotification(notificationId: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`,
			{ headers }
		);

		if (response.status !== 204) {
			return {
				errors: { general: ['Error al eliminar la notificación'] },
			};
		}

		return { success: 'Notificación eliminada correctamente' };
	} catch {
		return {
			errors: { general: ['Error al eliminar la notificación'] },
		};
	}
}

export async function deleteAllNotificationsByUserId(userId: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/user/${userId}`,
			{ headers }
		);

		if (response.status !== 204) {
			return {
				errors: { general: ['Error al eliminar las notificaciones'] },
			};
		}

		return { success: 'Todas las notificaciones eliminadas correctamente' };
	} catch {
		return {
			errors: {
				general: ['Error al eliminar las notificaciones del usuario'],
			},
		};
	}
}
