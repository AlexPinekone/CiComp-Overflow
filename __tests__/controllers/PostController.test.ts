jest.mock('server-only', () => ({}), { virtual: true });

jest.mock('next/headers', () => ({
	cookies: jest.fn(),
}));

jest.mock('@/lib/session', () => ({
	decrypt: jest.fn(),
	getCurrentSessionFromCookies: jest.fn(),
}));

jest.mock(
	'@/lib/redis',
	() => {
		const mockRedisInstance = {
			get: jest.fn(),
			set: jest.fn(),
			del: jest.fn(),
			keys: jest.fn().mockResolvedValue([]),
			buildKey: jest.fn((...args) => args.join(':')),
			invalidatePattern: jest.fn(),
			exists: jest.fn().mockResolvedValue(false),
			getJSON: jest.fn(),
			setJSON: jest.fn(),
		};

		return {
			RedisCache: {
				getInstance: jest.fn().mockResolvedValue(mockRedisInstance),
			},
			redis: mockRedisInstance,
			getRedisClient: jest.fn(),
		};
	},
	{ virtual: true }
);

import { NextRequest } from 'next/server';
import { PostController } from '@/controller/PostController';
import { PostService } from '@/service/PostService';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { decrypt } from '@/lib/session';

jest.mock('@/service/PostService');
jest.mock('@/utils/ErrorHandler');

describe('PostController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAllPosts', () => {
		it('should return posts with default ordering', async () => {
			const mockPosts = [
				{ postId: '1', title: 'Post 1', body: 'Body 1' },
				{ postId: '2', title: 'Post 2', body: 'Body 2' },
			];

			(PostService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

			const req = new NextRequest('http://localhost/api/posts');
			const res = await PostController.getAllPosts(req);

			expect(PostService.getAllPosts).toHaveBeenCalledWith({
				orderBy: 'newest',
				publishedDate: null,
				tag: null,
				page: 1,
				limit: 10,
			});
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockPosts);
		});

		it('should return posts with custom orderBy parameter', async () => {
			const mockPosts = [{ postId: '1', title: 'Popular Post' }];

			(PostService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

			const req = new NextRequest(
				'http://localhost/api/posts?orderBy=votes'
			);
			const res = await PostController.getAllPosts(req);

			expect(PostService.getAllPosts).toHaveBeenCalledWith({
				orderBy: 'votes',
				publishedDate: null,
				tag: null,
				page: 1,
				limit: 10,
			});
			expect(res.status).toBe(200);
		});

		it('should filter posts by tag', async () => {
			const mockPosts = [
				{
					postId: '1',
					title: 'Post',
					tags: ['Algoritmos y Complejidad'],
				},
			];

			(PostService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

			const req = new NextRequest(
				'http://localhost/api/posts?tag=Algoritmos y Complejidad'
			);
			const res = await PostController.getAllPosts(req);

			expect(PostService.getAllPosts).toHaveBeenCalledWith({
				orderBy: 'newest',
				publishedDate: null,
				tag: 'Algoritmos y Complejidad',
				page: 1,
				limit: 10,
			});
			expect(res.status).toBe(200);
		});

		it('should filter posts by publishedDate', async () => {
			const mockPosts = [{ postId: '1', title: 'Recent Post' }];

			(PostService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

			const req = new NextRequest(
				'http://localhost/api/posts?publishedDate=week'
			);
			const res = await PostController.getAllPosts(req);

			expect(PostService.getAllPosts).toHaveBeenCalledWith({
				orderBy: 'newest',
				publishedDate: 'week',
				tag: null,
				page: 1,
				limit: 10,
			});
			expect(res.status).toBe(200);
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Database error');
			(PostService.getAllPosts as jest.Mock).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const req = new NextRequest('http://localhost/api/posts');
			const res = await PostController.getAllPosts(req);

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('getPostById', () => {
		it('should return post when found', async () => {
			const mockPost = {
				postId: '1',
				title: 'Test Post',
				body: 'Test Body',
			};

			(PostService.getPostById as jest.Mock).mockResolvedValue(mockPost);

			const res = await PostController.getPostById('1');

			expect(PostService.getPostById).toHaveBeenCalledWith('1');
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockPost);
		});

		it('should return 400 when id is missing', async () => {
			const res = await PostController.getPostById('');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'Invalid post ID' });
		});

		it('should return 404 when post not found', async () => {
			(PostService.getPostById as jest.Mock).mockResolvedValue(null);

			const res = await PostController.getPostById('999');

			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({ error: 'Post not found' });
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Database error');
			(PostService.getPostById as jest.Mock).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const res = await PostController.getPostById('1');

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('createPost', () => {
		it('should create post successfully', async () => {
			(decrypt as jest.Mock).mockResolvedValue({ userId: 'user1' });

			const mockPost = {
				postId: '1',
				title: 'New Post',
				body: 'New Body',
				userId: 'user1',
				tags: ['Bases de Datos'],
			};

			(PostService.createPost as jest.Mock).mockResolvedValue(mockPost);

			const formData = new FormData();
			formData.append('title', 'New Post');
			formData.append('body', 'New Body');
			formData.append('userId', 'user1');
			formData.append('tags', JSON.stringify(['Bases de Datos']));

			const req = new NextRequest('http://localhost/api/posts', {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: 'Bearer fake-token',
				},
			});

			const res = await PostController.createPost(req);

			expect(res.status).toBe(201);
			expect(PostService.createPost).toHaveBeenCalledWith({
				title: 'New Post',
				body: 'New Body',
				userId: 'user1',
				tags: ['Bases de Datos'],
				image: undefined,
			});
		});

		it('should return 400 when title is missing', async () => {
			(decrypt as jest.Mock).mockResolvedValue({ userId: 'user1' });

			const formData = new FormData();
			formData.append('body', 'Body only');

			const req = new NextRequest('http://localhost/api/posts', {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: 'Bearer fake-token',
				},
			});

			const res = await PostController.createPost(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required fields',
			});
		});

		it('should return 400 when body is missing', async () => {
			(decrypt as jest.Mock).mockResolvedValue({ userId: 'user1' });

			const formData = new FormData();
			formData.append('title', 'Title only');

			const req = new NextRequest('http://localhost/api/posts', {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: 'Bearer fake-token',
				},
			});

			const res = await PostController.createPost(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required fields',
			});
		});

		it('should handle errors with ErrorHandler', async () => {
			(decrypt as jest.Mock).mockResolvedValue({ userId: 'user1' });

			const error = new Error('Create error');
			(PostService.createPost as jest.Mock).mockRejectedValue(error);

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Internal server error' }),
					{ status: 500 }
				)
			);

			const formData = new FormData();
			formData.append('title', 'Test');
			formData.append('body', 'Test');
			formData.append('userId', 'user1');
			formData.append('tags', JSON.stringify([]));

			const req = new NextRequest('http://localhost/api/posts', {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: 'Bearer fake-token',
				},
			});

			const res = await PostController.createPost(req);

			expect(PostService.createPost).toHaveBeenCalled();
			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('updatePost', () => {
		it('should update post successfully', async () => {
			(decrypt as jest.Mock).mockResolvedValue({ userId: 'user1' });

			const mockPost = {
				postId: '1',
				title: 'Updated Post',
				body: 'Updated Body',
				userId: 'user1',
				tags: ['Herramientas de Software'],
				status: 'published',
			};

			(PostService.updatePost as jest.Mock).mockResolvedValue(mockPost);

			const formData = new FormData();
			formData.append('title', 'Updated Post');
			formData.append('body', 'Updated Body');
			formData.append('userId', 'user1');
			formData.append(
				'tags',
				JSON.stringify(['Herramientas de Software'])
			);
			formData.append('status', 'published');

			const req = new NextRequest('http://localhost/api/posts/1', {
				method: 'PUT',
				body: formData,
				headers: {
					Authorization: 'Bearer fake-token',
				},
			});

			const res = await PostController.updatePost(req, '1');

			expect(res.status).toBe(200);
			expect(PostService.updatePost).toHaveBeenCalledWith({
				postId: '1',
				title: 'Updated Post',
				body: 'Updated Body',
				userId: 'user1',
				tags: ['Herramientas de Software'],
				status: 'published',
				image: undefined,
			});
		});

		it('should return 400 when id is missing', async () => {
			const formData = new FormData();
			formData.append('title', 'Title');

			const req = new NextRequest('http://localhost/api/posts', {
				method: 'PUT',
				body: formData,
			});

			const res = await PostController.updatePost(req, '');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'Invalid post ID' });
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Update error');
			(PostService.updatePost as jest.Mock).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const formData = new FormData();
			formData.append('title', 'Title');
			formData.append('body', 'Body');
			formData.append('userId', 'user1');
			formData.append('tags', '[]');
			formData.append('status', 'draft');

			const req = new NextRequest('http://localhost/api/posts/1', {
				method: 'PUT',
				body: formData,
			});

			const res = await PostController.updatePost(req, '1');

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('deletePost', () => {
		it('should delete post successfully', async () => {
			(PostService.deletePost as jest.Mock).mockResolvedValue({
				userId: 'user1',
			});

			const req = new NextRequest('http://localhost/api/posts/1', {
				method: 'DELETE',
			});

			const res = await PostController.deletePost(req, '1');

			expect(PostService.deletePost).toHaveBeenCalledWith('1');
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({
				success: true,
				postAuthorId: 'user1',
			});
		});

		it('should return 400 when postId is missing', async () => {
			const req = new NextRequest('http://localhost/api/posts', {
				method: 'DELETE',
			});

			const res = await PostController.deletePost(req, '');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'Invalid post ID' });
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Delete error');
			(PostService.deletePost as jest.Mock).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const req = new NextRequest('http://localhost/api/posts/1', {
				method: 'DELETE',
			});

			const res = await PostController.deletePost(req, '1');

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('countAllPosts', () => {
		it('should return total count of posts', async () => {
			(PostService.countAllPosts as jest.Mock).mockResolvedValue(42);

			const res = await PostController.countAllPosts();

			expect(PostService.countAllPosts).toHaveBeenCalled();
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({ count: 42 });
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Count error');
			(PostService.countAllPosts as jest.Mock).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const res = await PostController.countAllPosts();

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('countPostsLastMonth', () => {
		it('should return count of posts from last month', async () => {
			(PostService.countPostsLastMonth as jest.Mock).mockResolvedValue(
				15
			);

			const res = await PostController.countPostsLastMonth();

			expect(PostService.countPostsLastMonth).toHaveBeenCalled();
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({ count: 15 });
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Count error');
			(PostService.countPostsLastMonth as jest.Mock).mockRejectedValue(
				error
			);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const res = await PostController.countPostsLastMonth();

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('searchPosts', () => {
		it('should search posts with pagination', async () => {
			const mockResult = {
				posts: [{ postId: '1', title: 'Result' }],
				total: 1,
				page: 1,
				limit: 10,
			};

			(PostService.searchPosts as jest.Mock).mockResolvedValue(
				mockResult
			);

			const res = await PostController.searchPosts(
				'test',
				'newest',
				1,
				10
			);

			expect(PostService.searchPosts).toHaveBeenCalledWith(
				'test',
				'newest',
				1,
				10
			);
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockResult);
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Search error');
			(PostService.searchPosts as jest.Mock).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const res = await PostController.searchPosts(
				'test',
				'newest',
				1,
				10
			);

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('searchPostsByVotes', () => {
		it('should search posts ordered by votes', async () => {
			const mockResult = {
				posts: [{ postId: '1', title: 'Popular' }],
				total: 1,
				page: 1,
				limit: 10,
			};

			(PostService.searchPostsByVotes as jest.Mock).mockResolvedValue(
				mockResult
			);

			const res = await PostController.searchPostsByVotes('test', 1, 10);

			expect(PostService.searchPostsByVotes).toHaveBeenCalledWith(
				'test',
				1,
				10
			);
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockResult);
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Search error');
			(PostService.searchPostsByVotes as jest.Mock).mockRejectedValue(
				error
			);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const res = await PostController.searchPostsByVotes('test', 1, 10);

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});
});
