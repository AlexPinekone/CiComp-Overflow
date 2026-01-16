/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from 'next/server';
import { PostVoteController } from '@/controller/PostVoteController';
import { PostVoteService } from '@/service/PostVoteService';
import { VoteStatus } from '@/model/UserPostVote';
import { ErrorHandler } from '@/utils/ErrorHandler';

jest.mock('@/service/PostVoteService');
jest.mock('@/utils/ErrorHandler');

describe('PostVoteController', () => {
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

	describe('createPostVote', () => {
		it('should create vote successfully (201)', async () => {
			const mockVote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
			};

			(PostVoteService.createPostVote as jest.Mock).mockResolvedValue(
				mockVote
			);

			const req = new NextRequest('http://localhost/api/postVotes', {
				method: 'POST',
				body: JSON.stringify(mockVote),
			});

			const res = await PostVoteController.createPostVote(req);

			expect(res.status).toBe(201);
			expect(await res.json()).toEqual(mockVote);
			expect(PostVoteService.createPostVote).toHaveBeenCalledWith(
				mockVote
			);
		});

		it('should return 400 if userId is missing', async () => {
			const req = new NextRequest('http://localhost/api/postVotes', {
				method: 'POST',
				body: JSON.stringify({
					postId: 'post1',
					status: VoteStatus.UPVOTE,
				}),
			});

			const res = await PostVoteController.createPostVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required fields',
			});
		});

		it('should return 400 if postId is missing', async () => {
			const req = new NextRequest('http://localhost/api/postVotes', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					status: VoteStatus.UPVOTE,
				}),
			});

			const res = await PostVoteController.createPostVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required fields',
			});
		});

		it('should return 400 if status is missing', async () => {
			const req = new NextRequest('http://localhost/api/postVotes', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					postId: 'post1',
				}),
			});

			const res = await PostVoteController.createPostVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required fields',
			});
		});

		it('should return 400 if status is invalid', async () => {
			const req = new NextRequest('http://localhost/api/postVotes', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					postId: 'post1',
					status: 'INVALID_STATUS',
				}),
			});

			const res = await PostVoteController.createPostVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'Invalid vote status' });
		});

		it('should handle toggle (delete) scenario via service error', async () => {
			(PostVoteService.createPostVote as jest.Mock).mockRejectedValue(
				new Error(
					'Vote deleted successfully, no Vote object to return.'
				)
			);

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Vote toggled successfully' }),
					{ status: 200 }
				)
			);

			const req = new NextRequest('http://localhost/api/postVotes', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
				}),
			});

			const res = await PostVoteController.createPostVote(req);

			expect(PostVoteService.createPostVote).toHaveBeenCalled();
			expect(ErrorHandler.handle).toHaveBeenCalled();
		});

		it('should handle service errors (500)', async () => {
			(PostVoteService.createPostVote as jest.Mock).mockRejectedValue(
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

			const req = new NextRequest('http://localhost/api/postVotes', {
				method: 'POST',
				body: JSON.stringify({
					userId: 'user1',
					postId: 'post1',
					status: VoteStatus.DOWNVOTE,
				}),
			});

			const res = await PostVoteController.createPostVote(req);

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('changePostVote', () => {
		it('should change vote successfully (200)', async () => {
			const mockUpdatedVote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.DOWNVOTE,
			};

			(PostVoteService.changePostVote as jest.Mock).mockResolvedValue(
				mockUpdatedVote
			);

			const req = new NextRequest(
				'http://localhost/api/postVotes?userId=user1&postId=post1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: VoteStatus.DOWNVOTE }),
				}
			);

			const res = await PostVoteController.changePostVote(req);

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({
				message: 'Vote updated successfully',
			});
			expect(PostVoteService.changePostVote).toHaveBeenCalledWith(
				'user1',
				'post1',
				VoteStatus.DOWNVOTE
			);
		});

		it('should return 400 if userId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/postVotes?postId=post1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: VoteStatus.DOWNVOTE }),
				}
			);

			const res = await PostVoteController.changePostVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing userId or postId',
			});
		});

		it('should return 400 if postId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/postVotes?userId=user1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: VoteStatus.DOWNVOTE }),
				}
			);

			const res = await PostVoteController.changePostVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing userId or postId',
			});
		});

		it('should return 400 if newStatus is invalid', async () => {
			const req = new NextRequest(
				'http://localhost/api/postVotes?userId=user1&postId=post1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: 'INVALID' }),
				}
			);

			const res = await PostVoteController.changePostVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Invalid newStatus value',
			});
		});

		it('should return 404 if vote not found', async () => {
			(PostVoteService.changePostVote as jest.Mock).mockResolvedValue(
				null
			);

			const req = new NextRequest(
				'http://localhost/api/postVotes?userId=user1&postId=post1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: VoteStatus.DOWNVOTE }),
				}
			);

			const res = await PostVoteController.changePostVote(req);

			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({ error: 'Vote not found' });
		});

		it('should handle service errors (500)', async () => {
			(PostVoteService.changePostVote as jest.Mock).mockRejectedValue(
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
				'http://localhost/api/postVotes?userId=user1&postId=post1',
				{
					method: 'PUT',
					body: JSON.stringify({ newStatus: VoteStatus.DOWNVOTE }),
				}
			);

			const res = await PostVoteController.changePostVote(req);

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('deletePostVote', () => {
		it('should delete vote successfully (200)', async () => {
			(PostVoteService.deletePostVote as jest.Mock).mockResolvedValue(
				true
			);

			const req = new NextRequest(
				'http://localhost/api/postVotes?userId=user1&postId=post1',
				{
					method: 'DELETE',
				}
			);

			const res = await PostVoteController.deletePostVote(req);

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({
				message: 'Vote deleted successfully',
			});
			expect(PostVoteService.deletePostVote).toHaveBeenCalledWith(
				'user1',
				'post1'
			);
		});

		it('should return 400 if userId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/postVotes?postId=post1',
				{
					method: 'DELETE',
				}
			);

			const res = await PostVoteController.deletePostVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing userId or postId',
			});
		});

		it('should return 400 if postId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/postVotes?userId=user1',
				{
					method: 'DELETE',
				}
			);

			const res = await PostVoteController.deletePostVote(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing userId or postId',
			});
		});

		it('should return 404 if vote not found', async () => {
			(PostVoteService.deletePostVote as jest.Mock).mockResolvedValue(
				false
			);

			const req = new NextRequest(
				'http://localhost/api/postVotes?userId=user1&postId=post1',
				{
					method: 'DELETE',
				}
			);

			const res = await PostVoteController.deletePostVote(req);

			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({ error: 'Vote not found' });
		});

		it('should handle service errors (500)', async () => {
			(PostVoteService.deletePostVote as jest.Mock).mockRejectedValue(
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
				'http://localhost/api/postVotes?userId=user1&postId=post1',
				{
					method: 'DELETE',
				}
			);

			const res = await PostVoteController.deletePostVote(req);

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('getPostVotes', () => {
		it('should return votes for a post (200)', async () => {
			const mockVotes = [
				{
					userId: 'user1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
				},
				{
					userId: 'user2',
					postId: 'post1',
					status: VoteStatus.DOWNVOTE,
				},
			];

			(PostVoteService.getPostVotes as jest.Mock).mockResolvedValue(
				mockVotes
			);

			const req = new NextRequest(
				'http://localhost/api/postVotes?postId=post1',
				{
					method: 'GET',
				}
			);

			const res = await PostVoteController.getPostVotes(req);

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockVotes);
			expect(PostVoteService.getPostVotes).toHaveBeenCalledWith('post1');
		});

		it('should return 400 if postId is missing', async () => {
			const req = new NextRequest('http://localhost/api/postVotes', {
				method: 'GET',
			});

			const res = await PostVoteController.getPostVotes(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Post ID is required',
			});
		});

		it('should handle service errors (500)', async () => {
			(PostVoteService.getPostVotes as jest.Mock).mockRejectedValue(
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
				'http://localhost/api/postVotes?postId=post1',
				{
					method: 'GET',
				}
			);

			const res = await PostVoteController.getPostVotes(req);

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('getPostVoteById', () => {
		it('should return vote by postId and userId (200)', async () => {
			const mockVote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
			};

			(PostVoteService.getPostVotesById as jest.Mock).mockResolvedValue(
				mockVote
			);

			const req = new NextRequest(
				'http://localhost/api/postVotes/post1?userId=user1',
				{
					method: 'GET',
				}
			);

			const res = await PostVoteController.getPostVoteById(req, {
				id: 'post1',
			});

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockVote);
			expect(PostVoteService.getPostVotesById).toHaveBeenCalledWith(
				'post1',
				'user1'
			);
		});

		it('should return 400 if userId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/api/postVotes/post1',
				{
					method: 'GET',
				}
			);

			const res = await PostVoteController.getPostVoteById(req, {
				id: 'post1',
			});

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Post ID and User ID are required',
			});
		});

		it('should return 404 if vote not found', async () => {
			(PostVoteService.getPostVotesById as jest.Mock).mockResolvedValue(
				null
			);

			const req = new NextRequest(
				'http://localhost/api/postVotes/post1?userId=user1',
				{
					method: 'GET',
				}
			);

			const res = await PostVoteController.getPostVoteById(req, {
				id: 'post1',
			});

			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({ error: 'Vote not found' });
		});

		it('should handle service errors (500)', async () => {
			(PostVoteService.getPostVotesById as jest.Mock).mockRejectedValue(
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
				'http://localhost/api/postVotes/post1?userId=user1',
				{
					method: 'GET',
				}
			);

			const res = await PostVoteController.getPostVoteById(req, {
				id: 'post1',
			});

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('getAllVotesByPostId', () => {
		it('should return all votes for a post (200)', async () => {
			const mockVotes = [
				{
					userId: 'user1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
					softDelete: false,
				},
				{
					userId: 'user2',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
					softDelete: false,
				},
			];

			(
				PostVoteService.getAllVotesByPostId as jest.Mock
			).mockResolvedValue(mockVotes);

			const res = await PostVoteController.getAllVotesByPostId('post1');

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockVotes);
			expect(PostVoteService.getAllVotesByPostId).toHaveBeenCalledWith(
				'post1'
			);
		});

		it('should handle service errors (500)', async () => {
			(
				PostVoteService.getAllVotesByPostId as jest.Mock
			).mockRejectedValue(new Error('Database error'));

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Internal server error' }),
					{
						status: 500,
					}
				)
			);

			const res = await PostVoteController.getAllVotesByPostId('post1');

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('countLastMonthVotes', () => {
		it('should return vote count (200)', async () => {
			(
				PostVoteService.countLastMonthVotes as jest.Mock
			).mockResolvedValue(42);

			const res = await PostVoteController.countLastMonthVotes();

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({ count: 42 });
			expect(PostVoteService.countLastMonthVotes).toHaveBeenCalled();
		});

		it('should handle service errors (500)', async () => {
			(
				PostVoteService.countLastMonthVotes as jest.Mock
			).mockRejectedValue(new Error('Database error'));

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Internal server error' }),
					{
						status: 500,
					}
				)
			);

			const res = await PostVoteController.countLastMonthVotes();

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});
});
