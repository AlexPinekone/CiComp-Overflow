import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Comment {
	commentId: string;
	postId: string;
	authorName: string;
	authorAvatar: string;
	body: string;
	createdAt: string;
	votes: any[];
	userVote?: number;
	userId?: string;
}

export const commentsApi = createApi({
	reducerPath: 'commentsApi',
	baseQuery: fetchBaseQuery({
		// rutas relativas a /api
		baseUrl: '',
		credentials: 'include',
	}),
	tagTypes: ['Comments'],
	endpoints: (builder: any) => ({
		// GET por defecto sortBy=&order=
		getCommentsByPost: builder.query({
			query: ({
				postId,
				sortBy = 'date',
				order = 'desc',
			}: {
				postId: string;
				sortBy?: string;
				order?: string;
			}) => ({
				url: `/api/posts/${postId}/comments`,
				params: { sortBy, order },
			}),
			providesTags: (
				result: any[] | undefined,
				_e: unknown,
				{ postId }: { postId: string }
			) =>
				result
					? [
							...result.map((c: any) => ({
								type: 'Comments' as const,
								id: c.commentId,
							})),
							{ type: 'Comments' as const, id: `POST-${postId}` },
						]
					: [{ type: 'Comments' as const, id: `POST-${postId}` }],
		}),

		// POST
		addComment: builder.mutation({
			query: ({ postId, body }: { postId: string; body: string }) => ({
				url: `/api/posts/${postId}/comments`,
				method: 'POST',
				body: { body },
			}),
			// Permitir pasar los parámetros de sort
			async onQueryStarted(
				{
					postId,
					body,
					sortBy = 'date',
					order = 'desc',
				}: {
					postId: string;
					body: string;
					sortBy?: string;
					order?: string;
				},
				{ dispatch, queryFulfilled }: any
			) {
				// 1) Insertar los parámetros actuales
				const tempId = `temp-${crypto.randomUUID()}`;
				const patchResult = dispatch(
					commentsApi.util.updateQueryData(
						'getCommentsByPost',
						{ postId, sortBy, order },
						(draft: any[]) => {
							// Si el sort es por date desc, el nuevo debería ir arriba; en otros casos podemos empujarlo y dejar al refetch ordenar
							if (sortBy === 'date' && order === 'desc') {
								draft.unshift({
									commentId: tempId,
									postId,
									authorName: 'Tú',
									authorAvatar: '',
									body,
									createdAt: new Date().toISOString(),
									votes: 0,
									userVote: 0,
								});
							} else {
								// Añadir al final y será reordenado tras invalidation/refetch si procede
								draft.push({
									commentId: tempId,
									postId,
									authorName: 'Tú',
									authorAvatar: '',
									body,
									createdAt: new Date().toISOString(),
									votes: 0,
									userVote: 0,
								});
							}
						}
					)
				);

				try {
					// 2) Esperar la respuesta real
					const { data: serverComment } = await queryFulfilled;
					dispatch(
						commentsApi.util.updateQueryData(
							'getCommentsByPost',
							{ postId, sortBy, order },
							(draft: any[]) => {
								const idx = draft.findIndex(
									(c: any) => c.commentId === tempId
								);
								if (idx !== -1)
									draft[idx] = serverComment as any;
							}
						)
					);
				} catch {
					// rollback
					patchResult.undo();
				}
			},
			invalidatesTags: (
				_res: unknown,
				_err: unknown,
				{ postId }: { postId: string }
			) => [{ type: 'Comments', id: `POST-${postId}` }],
		}),

		// DELETE
		deleteComment: builder.mutation({
			query: ({ commentId }: { commentId: string }) => ({
				url: `/api/comments/${commentId}`,
				method: 'DELETE',
			}),
			async onQueryStarted(
				{
					postId,
					commentId,
					sortBy = 'date',
					order = 'desc',
				}: {
					postId: string;
					commentId: string;
					sortBy?: string;
					order?: string;
				},
				{ dispatch, queryFulfilled }: any
			) {
				// 1) quitar optimistamente de la lista filtrada
				const patchResult = dispatch(
					commentsApi.util.updateQueryData(
						'getCommentsByPost',
						{ postId, sortBy, order },
						(draft: any[]) => {
							const idx = draft.findIndex(
								(c: any) => c.commentId === commentId
							);
							if (idx !== -1) draft.splice(idx, 1);
						}
					)
				);

				try {
					await queryFulfilled;
				} catch {
					patchResult.undo();
				}
			},
			invalidatesTags: (
				_res: unknown,
				_err: unknown,
				{ postId }: { postId: string }
			) => [{ type: 'Comments', id: `POST-${postId}` }],
		}),
	}),
});

export const {
	useGetCommentsByPostQuery,
	useAddCommentMutation,
	useDeleteCommentMutation,
} = commentsApi;
