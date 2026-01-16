/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from 'next/server';
import { CommentVoteController } from '@/controller/CommentVoteController';
import { CommentVoteService } from '@/service/CommentVoteService';
import { VoteStatus } from '@/model/UserPostVote';
import { ErrorHandler } from '@/utils/ErrorHandler';

jest.mock('@/service/CommentVoteService');
jest.mock('@/utils/ErrorHandler');

describe('CommentVoteController', () => {
	const originalConsoleError = console.error;

	beforeAll(() => {
		console.error = jest.fn();
	});

	afterAll(() => {
		console.error = originalConsoleError;
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('createCommentVote', () => {
		it('should create vote successfully (201)', async () => {
			const mockVote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
			};

			(
				CommentVoteService.createCommentVote as jest.Mock
			).mockResolvedValue(mockVote);

			const req = new NextRequest('http://localhost/api/commentVote', {
				method: 'POST',
				body: JSON.stringify(mockVote),
			});

			const res = await CommentVoteController.createCommentVote(req);

			expect(res.status).toBe(201);
			expect(await res.json()).toEqual(mockVote);
			expect(CommentVoteService.createCommentVote).toHaveBeenCalledWith(
				mockVote
			);
		});

		it('should return 400 if userId is missing', async () => {
			const req = new NextRequest('http://localhost/api/commentVote', {
				method: 'POST',
				body: JSON.stringify({
					commentId: 'comment1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
				}),
			});

			const res = await CommentVoteController.createCommentVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required fields',
			});
		});

		it('should return 400 if commentId is missing', async () => {
			const req = new NextRequest('http://localhost/api/commentVote', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
				}),
			});

			const res = await CommentVoteController.createCommentVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required fields',
			});
		});

		it('should return 400 if postId is missing', async () => {
			const req = new NextRequest('http://localhost/api/commentVote', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					commentId: 'comment1',
					status: VoteStatus.UPVOTE,
				}),
			});

			const res = await CommentVoteController.createCommentVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required fields',
			});
		});

		it('should return 400 if status is missing', async () => {
			const req = new NextRequest('http://localhost/api/commentVote', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					commentId: 'comment1',
					postId: 'post1',
				}),
			});

			const res = await CommentVoteController.createCommentVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required fields',
			});
		});

		it('should return 400 if status is invalid', async () => {
			const req = new NextRequest('http://localhost/api/commentVote', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					commentId: 'comment1',
					postId: 'post1',
					status: 'INVALID_STATUS',
				}),
			});

			const res = await CommentVoteController.createCommentVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'Invalid vote status' });
		});

		it('should handle toggle (returns object with softDelete: true)', async () => {
			const mockToggledVote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: true,
				createdAt: new Date(),
			};

			(
				CommentVoteService.createCommentVote as jest.Mock
			).mockResolvedValue(mockToggledVote);

			const req = new NextRequest('http://localhost/api/commentVote', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					commentId: 'comment1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
				}),
			});

			const res = await CommentVoteController.createCommentVote(req);

			expect(res.status).toBe(201);
			const responseData = await res.json();
			expect(responseData.softDelete).toBe(true);
			expect(CommentVoteService.createCommentVote).toHaveBeenCalled();
		});

		it('should handle vote change (returns object with preserved createdAt)', async () => {
			const originalDate = new Date('2024-01-01');
			const mockChangedVote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.DOWNVOTE,
				softDelete: false,
				createdAt: originalDate,
			};

			(
				CommentVoteService.createCommentVote as jest.Mock
			).mockResolvedValue(mockChangedVote);

			const req = new NextRequest('http://localhost/api/commentVote', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					commentId: 'comment1',
					postId: 'post1',
					status: VoteStatus.DOWNVOTE,
				}),
			});

			const res = await CommentVoteController.createCommentVote(req);

			expect(res.status).toBe(201);
			const responseData = await res.json();
			expect(responseData.softDelete).toBe(false);
			expect(responseData.createdAt).toBe(originalDate.toISOString());
		});

		it('should handle service errors (500)', async () => {
			(
				CommentVoteService.createCommentVote as jest.Mock
			).mockRejectedValue(new Error('Database error'));

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Internal server error' }),
					{
						status: 500,
					}
				)
			);

			const req = new NextRequest('http://localhost/api/commentVote', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					commentId: 'comment1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
				}),
			});

			const res = await CommentVoteController.createCommentVote(req);

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('changeCommentVote', () => {
		it('should change vote successfully (200)', async () => {
			(
				CommentVoteService.changeCommentVote as jest.Mock
			).mockResolvedValue(true);

			const req = new NextRequest(
				'http://localhost/api/commentVote?userId=user1&commentId=comment1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: VoteStatus.DOWNVOTE }),
				}
			);

			const res = await CommentVoteController.changeCommentVote(req);

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({
				message: 'Vote updated successfully',
			});
			expect(CommentVoteService.changeCommentVote).toHaveBeenCalledWith(
				'user1',
				'comment1',
				VoteStatus.DOWNVOTE
			);
		});

		it('should return 400 if userId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/commentVote?commentId=comment1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: VoteStatus.DOWNVOTE }),
				}
			);

			const res = await CommentVoteController.changeCommentVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing userId or commentId',
			});
		});

		it('should return 400 if commentId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/commentVote?userId=user1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: VoteStatus.DOWNVOTE }),
				}
			);

			const res = await CommentVoteController.changeCommentVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing userId or commentId',
			});
		});

		it('should return 400 if newStatus is invalid', async () => {
			const req = new NextRequest(
				'http://localhost/api/commentVote?userId=user1&commentId=comment1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: 'INVALID' }),
				}
			);

			const res = await CommentVoteController.changeCommentVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Invalid newStatus value',
			});
		});

		it('should return 404 if vote not found', async () => {
			(
				CommentVoteService.changeCommentVote as jest.Mock
			).mockResolvedValue(false);

			const req = new NextRequest(
				'http://localhost/api/commentVote?userId=user1&commentId=comment1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: VoteStatus.DOWNVOTE }),
				}
			);

			const res = await CommentVoteController.changeCommentVote(req);

			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({ error: 'Vote not found' });
		});

		it('should handle service errors (500)', async () => {
			(
				CommentVoteService.changeCommentVote as jest.Mock
			).mockRejectedValue(new Error('Database error'));

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Internal server error' }),
					{
						status: 500,
					}
				)
			);

			const req = new NextRequest(
				'http://localhost/api/commentVote?userId=user1&commentId=comment1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: VoteStatus.DOWNVOTE }),
				}
			);

			const res = await CommentVoteController.changeCommentVote(req);

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('deleteCommentVote', () => {
		it('should delete vote successfully (200)', async () => {
			(
				CommentVoteService.deleteCommentVote as jest.Mock
			).mockResolvedValue(true);

			const req = new NextRequest(
				'http://localhost/api/commentVote?userId=user1&commentId=comment1',
				{
					method: 'DELETE',
				}
			);

			const res = await CommentVoteController.deleteCommentVote(req);

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({
				message: 'Vote deleted successfully',
			});
			expect(CommentVoteService.deleteCommentVote).toHaveBeenCalledWith(
				'user1',
				'comment1'
			);
		});

		it('should return 400 if userId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/commentVote?commentId=comment1',
				{
					method: 'DELETE',
				}
			);

			const res = await CommentVoteController.deleteCommentVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing userId or commentId',
			});
		});

		it('should return 400 if commentId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/commentVote?userId=user1',
				{
					method: 'DELETE',
				}
			);

			const res = await CommentVoteController.deleteCommentVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing userId or commentId',
			});
		});

		it('should return 404 if vote not found', async () => {
			(
				CommentVoteService.deleteCommentVote as jest.Mock
			).mockResolvedValue(false);

			const req = new NextRequest(
				'http://localhost/api/commentVote?userId=user1&commentId=comment1',
				{
					method: 'DELETE',
				}
			);

			const res = await CommentVoteController.deleteCommentVote(req);

			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({ error: 'Vote not found' });
		});

		it('should handle service errors (500)', async () => {
			(
				CommentVoteService.deleteCommentVote as jest.Mock
			).mockRejectedValue(new Error('Database error'));

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Internal server error' }),
					{
						status: 500,
					}
				)
			);

			const req = new NextRequest(
				'http://localhost/api/commentVote?userId=user1&commentId=comment1',
				{
					method: 'DELETE',
				}
			);

			const res = await CommentVoteController.deleteCommentVote(req);

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('getCommentVotes', () => {
		it('should return votes for a comment (200)', async () => {
			const mockVotes = [
				{
					userId: 'user1',
					commentId: 'comment1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
				},
				{
					userId: 'user2',
					commentId: 'comment1',
					postId: 'post1',
					status: VoteStatus.DOWNVOTE,
				},
			];

			(CommentVoteService.getCommentVotes as jest.Mock).mockResolvedValue(
				mockVotes
			);

			const req = new NextRequest(
				'http://localhost/api/commentVote?commentId=comment1',
				{
					method: 'GET',
				}
			);

			const res = await CommentVoteController.getCommentVotes(req);

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockVotes);
			expect(CommentVoteService.getCommentVotes).toHaveBeenCalledWith(
				'comment1'
			);
		});

		it('should return 400 if commentId is missing', async () => {
			const req = new NextRequest('http://localhost/api/commentVote', {
				method: 'GET',
			});

			const res = await CommentVoteController.getCommentVotes(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Comment ID is required',
			});
		});

		it('should handle service errors (500)', async () => {
			(CommentVoteService.getCommentVotes as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Internal server error' }),
					{
						status: 500,
					}
				)
			);

			const req = new NextRequest(
				'http://localhost/api/commentVote?commentId=comment1',
				{
					method: 'GET',
				}
			);

			const res = await CommentVoteController.getCommentVotes(req);

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('getCommentVoteById', () => {
		it('should return vote by commentId, postId and userId (200)', async () => {
			const mockVote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
			};

			(
				CommentVoteService.getCommentVoteById as jest.Mock
			).mockResolvedValue(mockVote);

			const req = new NextRequest(
				'http://localhost/api/commentVote/comment1?postId=post1&userId=user1',
				{
					method: 'GET',
				}
			);

			const res = await CommentVoteController.getCommentVoteById(req, {
				id: 'comment1',
			});

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockVote);
			expect(CommentVoteService.getCommentVoteById).toHaveBeenCalledWith(
				'comment1',
				'post1',
				'user1'
			);
		});

		it('should return 400 if postId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/commentVote/comment1?userId=user1',
				{
					method: 'GET',
				}
			);

			const res = await CommentVoteController.getCommentVoteById(req, {
				id: 'comment1',
			});

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required parameters',
			});
		});

		it('should return 400 if userId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/commentVote/comment1?postId=post1',
				{
					method: 'GET',
				}
			);

			const res = await CommentVoteController.getCommentVoteById(req, {
				id: 'comment1',
			});

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required parameters',
			});
		});

		it('should return 404 if vote not found', async () => {
			(
				CommentVoteService.getCommentVoteById as jest.Mock
			).mockResolvedValue(null);

			const req = new NextRequest(
				'http://localhost/api/commentVote/comment1?postId=post1&userId=user1',
				{
					method: 'GET',
				}
			);

			const res = await CommentVoteController.getCommentVoteById(req, {
				id: 'comment1',
			});

			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({ error: 'Vote not found' });
		});

		it('should handle service errors (500)', async () => {
			(
				CommentVoteService.getCommentVoteById as jest.Mock
			).mockRejectedValue(new Error('Database error'));

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Internal server error' }),
					{
						status: 500,
					}
				)
			);

			const req = new NextRequest(
				'http://localhost/api/commentVote/comment1?postId=post1&userId=user1',
				{
					method: 'GET',
				}
			);

			const res = await CommentVoteController.getCommentVoteById(req, {
				id: 'comment1',
			});

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});
});
