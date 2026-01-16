'use server';
import { z } from 'zod';
import axios from 'axios';
import { getCurrentSessionFromCookies, getFetchHeaders } from '@/lib/session';

// Schema de validación para crear una nueva solicitud
const schemaNewRequest = z.object({
	title: z
		.string({
			invalid_type_error: 'Título inválido',
		})
		.min(5, {
			message: 'El título debe tener al menos 5 caracteres',
		})
		.optional(),
	body: z
		.string({
			invalid_type_error: 'Cuerpo inválido',
		})
		.min(10, {
			message: 'El cuerpo debe tener al menos 10 caracteres',
		})
		.optional(),
	type: z
		.enum(['post', 'comment', 'user', 'general'], {
			invalid_type_error: 'Tipo de solicitud inválido',
		})
		.optional(),
	status: z.enum(['PENDING', 'APPROVED', 'REJECTED'], {
		invalid_type_error: 'Tipo de solicitud inválido',
	}),
	//El solicitante
	userId: z.string(),
	referencePostId: z.string().optional(),
	referenceCommentId: z.string().optional(),
	referenceUserId: z.string().optional(),
});

// Schema de validación para actualizar el estado de una solicitud
const schemaUpdateRequest = z.object({
	requestId: z.string({
		invalid_type_error: 'ID inválido',
	}),
	status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

export async function createRequest(formData: FormData) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	const userId = formData.get('userId');
	const title = formData.get('title');
	const body = formData.get('body');
	const type = formData.get('type');
	const referencePostId = formData.get('referencePostId') || undefined;
	const referenceCommentId = formData.get('referenceCommentId') || undefined;
	const referenceUserId = formData.get('referenceUserId') || undefined;
	const status = 'PENDING';

	const validatedFields = schemaNewRequest.safeParse({
		userId,
		title,
		body,
		type,
		status,
		referencePostId,
		referenceCommentId,
		referenceUserId,
	});

	if (!validatedFields.success) {
		return { errors: validatedFields.error.flatten().fieldErrors };
	}

	try {
		// Hacer la solicitud POST para crear una nueva solicitud
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
			{
				userId,
				title,
				body,
				type,
				status,
				referencePostId,
				referenceCommentId,
				referenceUserId,
			},
			{
				headers,
			}
		);
		if (response.status !== 201) {
			return { errors: { general: ['Error al crear la solicitud'] } };
		}
		return { success: 'Solicitud creada correctamente' };
	} catch {
		return {
			errors: { general: ['Error al guardar en la base de datos'] },
		};
	}
}

export async function getAllRequests() {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
			{
				headers,
			}
		);
		if (response.status !== 200) {
			return {
				errors: { general: ['Error al obtener las solicitudes'] },
			};
		}
		return { requests: response.data };
	} catch {
		return { errors: { general: ['Error al obtener las solicitudes'] } };
	}
}

export async function getRequestsPaginated(type: string, page = 1, limit = 10) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
			{
				headers,
				params: { type, page, limit },
			}
		);
		if (response.status !== 200) {
			return {
				errors: { general: ['Error al obtener las solicitudes'] },
			};
		}

		const {
			requests,
			total,
			page: currentPage,
			limit: currentLimit,
		} = response.data;

		return {
			requests,
			total,
			page: currentPage,
			limit: currentLimit,
			totalPages: Math.ceil(total / limit),
		};
	} catch {
		return { errors: { general: ['Error al obtener las solicitudes'] } };
	}
}

export async function getRequestById(id: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${id}`,
			{
				headers,
			}
		);
		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener la solicitud'] } };
		}
		return { request: response.data };
	} catch {
		return { errors: { general: ['Error al obtener la solicitud'] } };
	}
}

export async function updateRequestStatus(
	formData: FormData,
	requestId: string
) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	const status = formData.get('status');

	const validatedFields = schemaUpdateRequest.safeParse({
		requestId,
		status,
	});

	if (!validatedFields.success) {
		return { errors: validatedFields.error.flatten().fieldErrors };
	}

	try {
		const response = await axios.put(
			`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}`,
			{
				status,
			},
			{
				headers,
			}
		);
		if (response.status !== 200) {
			return {
				errors: {
					general: ['Error al actualizar el estado de la solicitud'],
				},
			};
		}
		return { success: 'Estado de la solicitud actualizado correctamente' };
	} catch {
		return {
			errors: {
				general: [
					'Error al actualizar la solicitud en la base de datos',
				],
			},
		};
	}
}

export async function deleteRequest(requestId: string, status: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});
	try {
		// Hacer la solicitud DELETE para eliminar la solicitud
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
			{
				headers,
				data: {
					requestId,
					status,
				},
			}
		);
		if (response.status !== 204) {
			return { errors: { general: ['Error al eliminar la solicitud'] } };
		}
		return { success: 'Solicitud eliminada correctamente' };
	} catch {
		return {
			errors: {
				general: ['Error al eliminar la solicitud de la base de datos'],
			},
		};
	}
}

export async function getTotalRequestsCount() {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/requests/count`,
			{ headers }
		);

		if (response.status !== 200) {
			return { errors: { general: ['Error al contar las requests'] } };
		}

		return { count: response.data.count };
	} catch {
		return { errors: { general: ['Error al contar las requests'] } };
	}
}
