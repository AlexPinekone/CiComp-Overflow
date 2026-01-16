// Mock de módulos problemáticos ANTES de imports
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('next/headers', () => ({
	cookies: jest.fn(),
}));
jest.mock('@/lib/session', () => ({
	decrypt: jest.fn(),
	getCurrentSessionFromCookies: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { CommentController } from '@/controller/CommentController';
import { CommentService } from '@/service/CommentService';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { decrypt, getCurrentSessionFromCookies } from '@/lib/session';

jest.mock('@/service/CommentService');
jest.mock('@/utils/ErrorHandler');
jest.mock('@/lib/session');

describe('CommentController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getCommentsByPostId', () => {
		it('should return comments with default sorting', async () => {
			const mockComments = [
				{ commentId: '1', body: 'Comment 1', postId: 'post1' },
				{ commentId: '2', body: 'Comment 2', postId: 'post1' },
			];

			(CommentService.getCommentsByPost as jest.Mock).mockResolvedValue(
				mockComments
			);

			const req = new NextRequest('http://localhost/api/comments');
			const res = await CommentController.getCommentsByPostId(
				req,
				'post1'
			);

			expect(CommentService.getCommentsByPost).toHaveBeenCalledWith(
				'post1',
				'date',
				'desc'
			);
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockComments);
		});

		it('should return comments with custom sorting', async () => {
			const mockComments = [
				{ commentId: '1', body: 'Popular comment', votes: 10 },
			];

			(CommentService.getCommentsByPost as jest.Mock).mockResolvedValue(
				mockComments
			);

			const req = new NextRequest(
				'http://localhost/api/comments?sortBy=votes&order=asc'
			);
			const res = await CommentController.getCommentsByPostId(
				req,
				'post1'
			);

			expect(CommentService.getCommentsByPost).toHaveBeenCalledWith(
				'post1',
				'votes',
				'asc'
			);
			expect(res.status).toBe(200);
		});

		it('should return 400 when postId is missing', async () => {
			const req = new NextRequest('http://localhost/api/comments');
			const res = await CommentController.getCommentsByPostId(req, '');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Post ID is required',
			});
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Database error');
			(CommentService.getCommentsByPost as jest.Mock).mockRejectedValue(
				error
			);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const req = new NextRequest('http://localhost/api/comments');
			const res = await CommentController.getCommentsByPostId(
				req,
				'post1'
			);

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('getCommentById', () => {
		it('should return comment when found', async () => {
			const mockComment = {
				commentId: '1',
				body: 'Test comment',
				postId: 'post1',
			};

			(CommentService.getCommentById as jest.Mock).mockResolvedValue(
				mockComment
			);

			const req = new NextRequest('http://localhost/api/comments/1');
			const res = await CommentController.getCommentById(req, '1');

			expect(CommentService.getCommentById).toHaveBeenCalledWith('1');
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockComment);
		});

		it('should return 400 when id is missing', async () => {
			const req = new NextRequest('http://localhost/api/comments');
			const res = await CommentController.getCommentById(req, '');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Comment ID is required',
			});
		});

		it('should return 404 when comment not found', async () => {
			(CommentService.getCommentById as jest.Mock).mockResolvedValue(
				null
			);

			const req = new NextRequest('http://localhost/api/comments/999');
			const res = await CommentController.getCommentById(req, '999');

			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({ error: 'Comment not found' });
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Database error');
			(CommentService.getCommentById as jest.Mock).mockRejectedValue(
				error
			);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const req = new NextRequest('http://localhost/api/comments/1');
			const res = await CommentController.getCommentById(req, '1');

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('createComment', () => {
		it('should create comment successfully with Authorization header', async () => {
			const mockComment = {
				commentId: '1',
				body: 'New comment',
				postId: 'post1',
				userId: 'user1',
			};

			(decrypt as jest.Mock).mockResolvedValue({ userId: 'user1' });
			(CommentService.createComment as jest.Mock).mockResolvedValue(
				mockComment
			);

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer token123',
				},
				body: JSON.stringify({ body: 'New comment' }),
			});

			const res = await CommentController.createComment(req, 'post1');

			expect(decrypt).toHaveBeenCalledWith('Bearer token123');
			expect(CommentService.createComment).toHaveBeenCalledWith({
				body: 'New comment',
				postId: 'post1',
				userId: 'user1',
			});
			expect(res.status).toBe(201);
			expect(await res.json()).toEqual(mockComment);
		});

		it('should create comment using cookie session when no Authorization header', async () => {
			const mockComment = {
				commentId: '1',
				body: 'New comment',
				postId: 'post1',
			};

			// Primera llamada a decrypt (header) retorna null
			// Segunda llamada (cookie) retorna userId
			(decrypt as jest.Mock)
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce({ userId: 'user1' });
			(getCurrentSessionFromCookies as jest.Mock).mockResolvedValue(
				'cookie-session'
			);
			(CommentService.createComment as jest.Mock).mockResolvedValue(
				mockComment
			);

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ body: 'New comment' }),
			});

			const res = await CommentController.createComment(req, 'post1');

			expect(getCurrentSessionFromCookies).toHaveBeenCalled();
			expect(decrypt).toHaveBeenCalledTimes(2);
			expect(res.status).toBe(201);
		});

		it('should return 400 when body is empty', async () => {
			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ body: '   ' }),
			});

			const res = await CommentController.createComment(req, 'post1');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Body and postId are required',
			});
		});

		it('should return 400 when postId is missing', async () => {
			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ body: 'Comment' }),
			});

			const res = await CommentController.createComment(req, '');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Body and postId are required',
			});
		});

		it('should return 401 when user is not authenticated', async () => {
			(decrypt as jest.Mock).mockResolvedValue(null);
			(getCurrentSessionFromCookies as jest.Mock).mockResolvedValue(null);

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ body: 'Comment' }),
			});

			const res = await CommentController.createComment(req, 'post1');

			expect(res.status).toBe(401);
			expect(await res.json()).toEqual({ error: 'Unauthorized' });
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Create error');
			(decrypt as jest.Mock).mockResolvedValue({ userId: 'user1' });
			(CommentService.createComment as jest.Mock).mockRejectedValue(
				error
			);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer token',
				},
				body: JSON.stringify({ body: 'Comment' }),
			});

			const res = await CommentController.createComment(req, 'post1');

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('updateComment', () => {
		it('should update comment successfully', async () => {
			const mockUpdatedComment = {
				commentId: '1',
				body: 'Updated comment',
				postId: 'post1',
			};

			(CommentService.updateComment as jest.Mock).mockResolvedValue(
				mockUpdatedComment
			);

			const req = new NextRequest('http://localhost/api/comments/1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ body: 'Updated comment' }),
			});

			const res = await CommentController.updateComment(req, '1');

			expect(CommentService.updateComment).toHaveBeenCalledWith({
				commentId: '1',
				body: 'Updated comment',
			});
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockUpdatedComment);
		});

		it('should return 400 when id is missing', async () => {
			const req = new NextRequest('http://localhost/api/comments', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ body: 'Updated' }),
			});

			const res = await CommentController.updateComment(req, '');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Comment ID is required',
			});
		});

		it('should return 400 when body is empty', async () => {
			const req = new NextRequest('http://localhost/api/comments/1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ body: '  ' }),
			});

			const res = await CommentController.updateComment(req, '1');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'Body is required' });
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Update error');
			(CommentService.updateComment as jest.Mock).mockRejectedValue(
				error
			);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const req = new NextRequest('http://localhost/api/comments/1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ body: 'Updated' }),
			});

			const res = await CommentController.updateComment(req, '1');

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('deleteComment', () => {
		it('should delete comment successfully', async () => {
			(CommentService.deleteComment as jest.Mock).mockResolvedValue({
				userId: 'user1',
			});

			const req = new NextRequest('http://localhost/api/comments/1', {
				method: 'DELETE',
			});

			const res = await CommentController.deleteComment(req, '1');

			expect(CommentService.deleteComment).toHaveBeenCalledWith('1');
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({
				success: true,
				commentAuthorId: 'user1',
			});
		});

		it('should return 400 when commentId is missing', async () => {
			const req = new NextRequest('http://localhost/api/comments', {
				method: 'DELETE',
			});

			const res = await CommentController.deleteComment(req, '');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Comment ID is required',
			});
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Delete error');
			(CommentService.deleteComment as jest.Mock).mockRejectedValue(
				error
			);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const req = new NextRequest('http://localhost/api/comments/1', {
				method: 'DELETE',
			});

			const res = await CommentController.deleteComment(req, '1');

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('deleteAllComment', () => {
		it('should delete all comments for a post', async () => {
			(CommentService.deleteAllComments as jest.Mock).mockResolvedValue(
				undefined
			);

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'DELETE',
			});

			const res = await CommentController.deleteAllComment(req, 'post1');

			expect(CommentService.deleteAllComments).toHaveBeenCalledWith(
				'post1'
			);
			expect(res.status).toBe(204);
		});

		it('should return 400 when postId is missing', async () => {
			const req = new NextRequest('http://localhost/api/comments', {
				method: 'DELETE',
			});

			const res = await CommentController.deleteAllComment(req, '');

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'Post ID is required' });
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Delete all error');
			(CommentService.deleteAllComments as jest.Mock).mockRejectedValue(
				error
			);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const req = new NextRequest('http://localhost/api/comments', {
				method: 'DELETE',
			});

			const res = await CommentController.deleteAllComment(req, 'post1');

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('countLastMonthComments', () => {
		it('should return count of comments from last month', async () => {
			(
				CommentService.countLastMonthComments as jest.Mock
			).mockResolvedValue(25);

			const res = await CommentController.countLastMonthComments();

			expect(CommentService.countLastMonthComments).toHaveBeenCalled();
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({ count: 25 });
		});

		it('should handle errors with ErrorHandler', async () => {
			const error = new Error('Count error');
			(
				CommentService.countLastMonthComments as jest.Mock
			).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(JSON.stringify({ error: 'Internal error' }), {
					status: 500,
				})
			);

			const res = await CommentController.countLastMonthComments();

			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});
});
