import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PostItem {
	postId: string;
	title: string;
	body: string;
	createdAt: string;
	userId: string;
	userName?: string;
	authorAvatar?: string;
	tags?: string[];
	votes?: number;
}

export interface GetPostsArgs {
	page?: number;
	limit?: number;
	orderBy?: 'newest' | 'oldest' | 'votes';
	tag?: string;
	publishedDate?: string;
	since?: string;
	until?: string;
	q?: string;
}

export interface PostsResponse {
	posts: PostItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface InfinitePostsState {
	posts: PostItem[];
	total: number;
	currentPage: number;
	totalPages: number;
	hasMore: boolean;
	isLoading: boolean;
	isError: boolean;
}

export const postsApi = createApi({
	reducerPath: 'postsApi',
	baseQuery: fetchBaseQuery({ baseUrl: '', credentials: 'include' }),
	tagTypes: ['Posts'],
	endpoints: (builder: any) => ({
		getPosts: builder.query({
			query: (args: GetPostsArgs | Record<string, never> = {}) => {
				const params: Record<string, any> = {};
				Object.entries(args).forEach(([k, v]) => {
					if (v !== undefined && v !== null && v !== '')
						params[k] = v;
				});
				return { url: '/api/posts', params };
			},
			providesTags: (result: PostsResponse | undefined) =>
				result?.posts
					? [
							...result.posts.map((p: PostItem) => ({
								type: 'Posts' as const,
								id: p.postId,
							})),
							{ type: 'Posts' as const, id: 'LIST' },
						]
					: [{ type: 'Posts', id: 'LIST' }],
		}),
		addPost: builder.mutation({
			// Permite pasar viewArgs para la lista visible
			query: (
				args: (Partial<PostItem> & { tags?: string[] }) & {
					viewArgs?: GetPostsArgs;
				}
			) => {
				const { title, body, tags } = args;
				const form = new FormData();
				if (title) form.append('title', title);
				if (body) form.append('body', body);
				form.append('tags', JSON.stringify(tags || []));
				return {
					url: '/api/posts',
					method: 'POST',
					body: form,
				};
			},
			async onQueryStarted(
				newPost: (Partial<PostItem> & { tags?: string[] }) & {
					viewArgs?: GetPostsArgs;
				},
				ctx: {
					dispatch: any;
					queryFulfilled: Promise<{ data: PostItem }>;
				}
			) {
				const { dispatch, queryFulfilled } = ctx;
				const tempId = `temp-${crypto.randomUUID()}`;
				const patchResults: { undo: () => void }[] = [];
				const targetArgs: (GetPostsArgs | Record<string, never>)[] = [
					newPost.viewArgs ?? {},
				];
				for (const args of targetArgs) {
					const pr = dispatch(
						postsApi.util.updateQueryData(
							'getPosts',
							args,
							(draft: PostsResponse) => {
								const isNewest =
									!('orderBy' in args) ||
									args.orderBy === 'newest';
								const temp: PostItem = {
									postId: tempId,
									title: newPost.title || 'Nuevo Post',
									body: newPost.body || '',
									createdAt: new Date().toISOString(),
									userId: newPost.userId || 'me',
									userName: 'Tú',
									tags: newPost.tags || [],
									votes: 0,
								};
								if (isNewest) draft.posts.unshift(temp);
								else draft.posts.push(temp);
								draft.total += 1;
							}
						)
					);
					patchResults.push(pr as any);
				}
				try {
					const { data } = await queryFulfilled;
					for (const args of targetArgs) {
						dispatch(
							postsApi.util.updateQueryData(
								'getPosts',
								args,
								(draft: PostsResponse) => {
									const idx = draft.posts.findIndex(
										(p) => p.postId === tempId
									);
									if (idx !== -1)
										draft.posts[idx] = data as PostItem;
								}
							)
						);
					}
				} catch {
					patchResults.forEach((p) => p.undo && p.undo());
				}
			},
			invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
		}),
	}),
});

export const { useGetPostsQuery, useAddPostMutation } = postsApi;
