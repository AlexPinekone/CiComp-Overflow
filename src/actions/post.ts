'use server';
import { z } from 'zod';
import axios from 'axios';
import {
	getCurrentSessionFromCookies,
	getFetchHeaders,
	decrypt,
} from '@/lib/session';
import {
	replaceForbiddenWords,
	containsForbiddenWords,
} from '@/utils/validateContent';
import { getUserIdFromSession } from './user';
import { deleteAllCommentsByPostId } from './comment';
import Database from '@/database/Database';
import { createNotification } from './notification';
import { ReadonlyURLSearchParams } from 'next/navigation';

const pool = Database.getInstance();

const schemaNewPost = z.object({
	title: z
		.string({
			invalid_type_error: 'Título inválido',
		})
		.min(5, {
			message: 'El título debe tener al menos 5 caracteres',
		}),
	body: z
		.string({
			invalid_type_error: 'Cuerpo inválido',
		})
		.min(10, {
			message: 'El cuerpo debe tener al menos 10 caracteres',
		}),
	tags: z
		.array(z.string())
		.max(7, {
			message: 'Solo puedes seleccionar hasta 7 etiquetas',
		})
		.refine((tags) => new Set(tags).size === tags.length, {
			message: 'Las etiquetas deben ser únicas',
		}),
	userId: z.string({
		invalid_type_error: 'userId inválido',
	}),
});

const schemaUpdatePost = z.object({
	postId: z.string({
		invalid_type_error: 'ID inválido',
	}),
	title: z
		.string({
			invalid_type_error: 'Título inválido',
		})
		.min(5, {
			message: 'El título debe tener al menos 5 caracteres',
		}),
	body: z
		.string({
			invalid_type_error: 'Cuerpo inválido',
		})
		.min(10, {
			message: 'El cuerpo debe tener al menos 10 caracteres',
		}),
	tags: z.array(z.string()).max(7, {
		message: 'Solo puedes seleccionar hasta 7 etiquetas',
	}),

	status: z
		.enum(['PUBLISHED', 'ARCHIVED', 'published', 'archived'])
		.default('PUBLISHED')
		.optional(),
});

export async function createPost(formData: FormData, tags: string[]) {
	const session = await getCurrentSessionFromCookies();
	const userId = await getUserIdFromSession();
	const headers = getFetchHeaders({
		Authorization: session,
		'Content-Type': 'multipart/form-data',
	});
	const title = formData.get('title');
	const body = formData.get('body');
	const image = formData.getAll('image');

	if (userId) {
		formData.append('userId', userId);
	}

	formData.append('tags', JSON.stringify(tags ?? []));

	const validatedFields = schemaNewPost.safeParse({
		title,
		body,
		tags,
		userId,
	});
	if (!validatedFields.success) {
		return { errors: validatedFields.error.flatten().fieldErrors };
	}

	const sanitizedTitle = replaceForbiddenWords(String(title));
	const sanitizedBody = replaceForbiddenWords(String(body));

	formData.set('title', sanitizedTitle);
	formData.set('body', sanitizedBody);

	try {
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts`,
			formData,
			{
				headers,
			}
		);
		if (response.status !== 201) {
			return { errors: { general: ['Error al crear el post'] } };
		}
		return { success: 'Post creado correctamente' };
	} catch {
		return {
			errors: { general: ['Error al guardar en la base de datos'] },
		};
	}
}

export async function getAllPosts({
	searchParams,
}: {
	searchParams?: ReadonlyURLSearchParams;
}) {
	const cleanedParams = Array.from(searchParams?.values() || [])
		.filter(([, value]) => value !== null && value !== '')
		.map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
		.join('&');
	const queryString = cleanedParams ? `?${cleanedParams}` : '';

	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});
	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts`.concat(
				queryString ?? ''
			),
			{
				headers,
			}
		);
		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener los posts'] } };
		}
		return { posts: response.data };
	} catch {
		return { errors: { general: ['Error al obtener los posts'] } };
	}
}

export async function getPostById(id: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});
	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
			{
				headers,
			}
		);
		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener el post'] } };
		}

		const post = response.data;

		let userVote = 0;
		let voteCount = 0;

		// Obtener userId desde la sesión (si existe)
		const payload = await decrypt(session ?? undefined);
		const userId = payload?.userId;

		// Obtener voto del usuario
		if (userId) {
			try {
				const userVoteRes = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/api/postVotes/${id}?userId=${userId}`,
					{ headers }
				);
				userVote =
					userVoteRes.data.status === 'UPVOTE'
						? 1
						: userVoteRes.data.status === 'DOWNVOTE'
							? -1
							: 0;
			} catch {
				userVote = 0;
			}
		}

		try {
			const voteRes = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/api/postVotes/${id}`,
				{ headers }
			);
			const votes = voteRes.data;
			voteCount = votes.reduce((acc: number, vote: any) => {
				if (vote.status === 'UPVOTE') return acc + 1;
				if (vote.status === 'DOWNVOTE') return acc - 1;
				return acc;
			}, 0);
		} catch {
			voteCount = 0;
		}

		return { post, userVote, voteCount };
	} catch {
		return { errors: { general: ['Error al obtener el post'] } };
	}
}

export async function getUserPostsById(id: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});
	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/user/${id}/posts`,
			{
				headers,
			}
		);
		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener los posts'] } };
		}
		return { posts: response.data };
	} catch {
		return { errors: { general: ['Error al obtener los posts'] } };
	}
}

export async function getUserPostsByIdPaginated(
	id: string,
	orderBy: 'newest' | 'oldest',
	page = 1,
	limit = 5
) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/user/${id}/posts?orderBy=${orderBy}&page=${page}&limit=${limit}`,
			{ headers }
		);

		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener los posts'] } };
		}

		return {
			posts: response.data.posts,
			total: response.data.total,
			page: response.data.page,
			limit: response.data.limit,
			totalPages: response.data.totalPages,
		};
	} catch {
		return { errors: { general: ['Error al obtener los posts'] } };
	}
}

export async function updatePost(
	formData: FormData,
	tags: string[],
	postId?: string
) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
		'Content-Type': 'multipart/form-data',
	});
	const title = formData.get('title');
	const body = formData.get('body');

	const filterTags = tags.filter(Boolean);

	const validatedFields = schemaUpdatePost.safeParse({
		title,
		body,
		tags: filterTags,
		postId,
	});

	if (!validatedFields.success) {
		return { errors: validatedFields.error.flatten().fieldErrors };
	}

	const sanitizedTitle = replaceForbiddenWords(String(title));
	const sanitizedBody = replaceForbiddenWords(String(body));

	formData.set('title', sanitizedTitle);
	formData.set('body', sanitizedBody);

	formData.append('tags', JSON.stringify(filterTags ?? []));
	try {
		const { PostService } = await import('@/service/PostService');

		const userId = await getUserIdFromSession();
		const postData = {
			postId,
			title: sanitizedTitle,
			body: sanitizedBody,
			userId,
			status: formData.get('status') || 'PUBLISHED',
			tags: filterTags,
			image: formData.get('image'),
		};

		await PostService.updatePost(postData);
		return { success: 'Post actualizado correctamente' };
	} catch (error) {
		console.error('Error updating post:', error);
		return {
			errors: { general: ['Error al guardar en la base de datos'] },
		};
	}
}

export async function getTotalPostsCount() {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts/count`,
			{ headers }
		);

		if (response.status !== 200) {
			return { errors: { general: ['Error al contar los posts'] } };
		}

		return { count: response.data.count };
	} catch {
		return { errors: { general: ['Error al contar los posts'] } };
	}
}

export async function getPostsCountLastMonth() {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts/count-last-month`,
			{ headers }
		);

		if (response.status !== 200) {
			return {
				errors: {
					general: ['Error al contar los posts del último mes'],
				},
			};
		}

		return { count: response.data.count };
	} catch {
		return {
			errors: { general: ['Error al contar los posts del último mes'] },
		};
	}
}

export async function getAllPostsOrdered(
	orderBy: 'newest' | 'oldest' | 'votes'
) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});
	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts?orderBy=${orderBy}`,
			{
				headers,
			}
		);
		if (response.status !== 200) {
			return { errors: { general: ['Error al obtener los posts'] } };
		}
		return { posts: response.data };
	} catch {
		return { errors: { general: ['Error al obtener los posts'] } };
	}
}

export async function searchPosts(
	query: string,
	orderBy: 'newest' | 'oldest',
	page = 1,
	limit = 10
) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts/search?q=${query}&orderBy=${orderBy}&page=${page}&limit=${limit}`,
			{ headers }
		);

		if (response.status !== 200) {
			return { errors: { general: ['Error al buscar los posts'] } };
		}

		return {
			posts: response.data.posts,
			total: response.data.total,
			page: response.data.page,
			limit: response.data.limit,
			totalPages: Math.ceil(response.data.total / limit),
		};
	} catch {
		return { errors: { general: ['Error al buscar los posts'] } };
	}
}

export async function searchPostsByVotes(query: string, page = 1, limit = 10) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts/search/votes?q=${query}&page=${page}&limit=${limit}`,
			{ headers }
		);

		if (response.status !== 200) {
			return {
				errors: { general: ['Error al buscar los posts por votos'] },
			};
		}

		return {
			posts: response.data.posts,
			total: response.data.total,
			page: response.data.page,
			limit: response.data.limit,
			totalPages: Math.ceil(response.data.total / limit),
		};
	} catch {
		return { errors: { general: ['Error al buscar los posts por votos'] } };
	}
}

export async function voteOnPost(
	postId: string,
	userId: string,
	status: 'UPVOTE' | 'DOWNVOTE'
) {
	try {
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/api/postVotes/${postId}`,
			{
				postId,
				userId,
				status,
			},
			{
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': process.env.API_KEY || '',
					'x-secret-key': process.env.SECRET_KEY || '',
				},
			}
		);

		const result = await pool.query(
			'SELECT "userId" FROM "Posts" WHERE "postId" = $1',
			[postId]
		);

		const postAuthorId = result.rows[0]?.userId;

		return {
			success: true,
			vote: response.data,
			postAuthorId,
		};
	} catch (error: any) {
		console.error('Error al enviar el voto:', error.message);
		return { error: 'Error al votar jeje' };
	}
}

export async function deletePost(id: string) {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const postResult = await pool.query(
			'SELECT "userId", "title" FROM "Posts" WHERE "postId" = $1',
			[id]
		);

		const postAuthorId = postResult.rows[0]?.userId;

		const result = await deleteAllCommentsByPostId(id);
		if (!result.success) {
			return {
				errors: {
					general: ['Error al eliminar los comentarios del post'],
				},
			};
		}

		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
			{ headers }
		);

		if (response.status !== 200) {
			return { errors: { general: ['Error al eliminar el post'] } };
		}

		return {
			success: 'Post eliminado correctamente',
			postAuthorId,
		};
	} catch (error) {
		console.error('Error al eliminar post:', error);
		return {
			errors: {
				general: ['Error al eliminar el post de la base de datos'],
			},
		};
	}
}

export async function getPostVotesCountLastMonth() {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({ Authorization: session });

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/postVotes/count`,
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
