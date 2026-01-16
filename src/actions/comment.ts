// lib/validators/comment.ts
'use server';
import { z } from 'zod';
import axios from 'axios';
import {
	decrypt,
	getCurrentSessionFromCookies,
	getFetchHeaders,
} from '@/lib/session';
import { replaceForbiddenWords } from '@/utils/validateContent';
import Database from '@/database/Database';

const pool = Database.getInstance();

const schemaNewComment = z.object({
	body: z
		.string()
		.min(1, { message: 'El comentario no puede estar vacío.' })
		.max(500, {
			message: 'El comentario no puede superar 500 caracteres.',
		}),
});
const schemaUpdateComment = z.object({
	commentId: z.string({
		invalid_type_error: 'ID inválido',
	}),
	body: z
		.string({
			invalid_type_error: 'Cuerpo inválido',
		})
		.min(1, {
			message: 'El cuerpo debe tener al menos 1 caracter',
		}),
});

export async function createComment(formData: FormData, postId: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});
	const body = formData.get('body');
	const validatedFields = schemaNewComment.safeParse({ body });

	if (!validatedFields.success) {
		return { errors: validatedFields.error.flatten().fieldErrors };
	}

	const sanitizedBody = replaceForbiddenWords(String(body));
	// Obtener el userId real del usuario autenticado
	const payload = await decrypt(session ?? undefined);
	const userId = payload?.userId;

	try {
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments`,
			{
				body: sanitizedBody,
				userId,
			},
			{
				headers,
			}
		);

		if (response.status !== 201) {
			return { errors: { general: ['Error al crear el comentario'] } };
		}

		const postAuthorId = await pool.query(
			'SELECT "userId" FROM "Posts" WHERE "postId" = $1',
			[postId]
		);

		const postAuthor = postAuthorId.rows[0]?.userId;

		return {
			success: 'Comentario creado correctamente',
			comment: response.data,
			postAuthorId: postAuthor,
		};
	} catch {
		return { errors: { general: ['Error al guardar el comentario'] } };
	}
}

export async function getAllComments(
	postId: string,
	sortBy: string | 'date',
	order: string | 'desc'
) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments`,
			{
				headers,
				params: {
					sortBy,
					order,
				},
			}
		);

		if (response.status !== 200) {
			return {
				errors: { general: ['Error al obtener los comentarios'] },
			};
		}

		let comments = response.data;

		const payload = await decrypt(session ?? undefined);
		const userId = payload?.userId;

		if (userId) {
			const promises = comments.map(async (comment: any) => {
				try {
					const voteRes = await axios.get(
						`${process.env.NEXT_PUBLIC_API_URL}/api/commentVote/${comment.commentId}`,
						{
							params: {
								postId,
								userId,
							},
							headers,
						}
					);

					comment.userVote =
						voteRes.data.status === 'UPVOTE'
							? 1
							: voteRes.data.status === 'DOWNVOTE'
								? -1
								: 0;
				} catch {
					comment.userVote = 0;
				}
				return comment;
			});

			comments = await Promise.all(promises);
		} else {
			comments = comments.map((comment: any) => ({
				...comment,
				userVote: 0,
			}));
		}

		return { comments };
	} catch {
		return { errors: { general: ['Error al obtener los comentarios'] } };
	}
}

export async function updateCommentById(formData: FormData, commentId: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});
	const body = formData.get('body');
	const validatedFields = schemaUpdateComment.safeParse({ body, commentId });

	if (!validatedFields.success) {
		return { errors: validatedFields.error.flatten().fieldErrors };
	}

	// ✨ Reemplazar palabras prohibidas antes de enviar al backend
	const sanitizedBody = replaceForbiddenWords(String(body));

	try {
		const response = await axios.put(
			`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
			{
				body: sanitizedBody,
			},
			{
				headers,
			}
		);

		if (response.status !== 200) {
			return {
				errors: { general: ['Error al actualizar el comentario'] },
			};
		}

		return { success: 'Comentario actualizado correctamente' };
	} catch (e) {
		console.error(e);
		return { errors: { general: ['Error al actualizar el comentario'] } };
	}
}

export async function deleteCommentById(id: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	try {
		const commentResult = await pool.query(
			'SELECT "userId" FROM "Comments" WHERE "commentId" = $1',
			[id]
		);

		const commentAuthorId = commentResult.rows[0]?.userId;

		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${id}`,
			{ headers }
		);

		if (response.status !== 200) {
			return {
				errors: { general: ['Error al eliminar el comentario'] },
			};
		}

		return {
			success: 'Comentario eliminado correctamente',
			commentAuthorId,
		};
	} catch {
		return {
			errors: { general: ['Error al eliminar el comentario'] },
		};
	}
}

export async function deleteAllCommentsByPostId(id: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	try {
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comments`,
			{ headers }
		);

		if (response.status !== 204) {
			return {
				errors: { general: ['Error al borrar los comentarios'] },
			};
		}

		return { success: 'Comentarios eliminados correctamente' };
	} catch {
		return {
			errors: { general: ['Error al eliminar los comentarios'] },
		};
	}
}

export async function voteOnComment(
	commentId: string,
	postId: string,
	userId: string,
	status: 'UPVOTE' | 'DOWNVOTE'
) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/commentVote/${commentId}`,
			{ commentId, postId, userId, status },
			{ headers }
		);
		return response.data;
	} catch (error: any) {
		console.error('Error al enviar el voto:', error.message);
		return { error: 'Error al votar' };
	}
}

export async function getCommentsCountLastMonth() {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/comments/count`,
			{ headers }
		);

		if (response.status !== 200) {
			return { errors: { general: ['Error al contar los comentarios'] } };
		}

		return { count: response.data.count };
	} catch {
		return { errors: { general: ['Error al contar los comentarios'] } };
	}
}

export async function getPostIdByCommentId(commentId: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
			{ headers }
		);

		if (response.status !== 200) {
			return null;
		}

		return response.data.postId;
	} catch {
		return null;
	}
}
