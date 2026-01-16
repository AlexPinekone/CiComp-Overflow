import { CommentVoteService } from '@/service/CommentVoteService';
import { CommentVoteDAO } from '@/dao/CommentVoteDAO';
import { Vote } from '@/model/UserCommentVote';
import { VoteStatus } from '@/model/UserPostVote';

jest.mock('@/dao/CommentVoteDAO');

describe('CommentVoteService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('createCommentVote', () => {
		const mockVote: Vote = {
			userId: 'user1',
			commentId: 'comment1',
			postId: 'post1',
			status: VoteStatus.UPVOTE,
		};

		it('should create new vote when no existing vote', async () => {
			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				null
			);
			(CommentVoteDAO.createCommentVote as jest.Mock).mockResolvedValue({
				...mockVote,
				createdAt: new Date(),
			});

			const result = await CommentVoteService.createCommentVote(mockVote);

			expect(CommentVoteDAO.getCommentVoteById).toHaveBeenCalledWith(
				'comment1',
				'post1',
				'user1'
			);
			expect(CommentVoteDAO.createCommentVote).toHaveBeenCalledWith(
				mockVote
			);
			expect(result.status).toBe(VoteStatus.UPVOTE);
		});

		it('should return soft deleted vote when voting same status (toggle)', async () => {
			const existingVote: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				existingVote
			);
			(CommentVoteDAO.deleteCommentVote as jest.Mock).mockResolvedValue(
				true
			);

			const result = await CommentVoteService.createCommentVote(mockVote);

			expect(CommentVoteDAO.deleteCommentVote).toHaveBeenCalledWith(
				'user1',
				'comment1'
			);
			expect(result.softDelete).toBe(true);
			expect(result.status).toBe(VoteStatus.UPVOTE);
		});

		it('should throw error if toggle delete fails', async () => {
			const existingVote: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				existingVote
			);
			(CommentVoteDAO.deleteCommentVote as jest.Mock).mockResolvedValue(
				false
			);

			await expect(
				CommentVoteService.createCommentVote(mockVote)
			).rejects.toThrow('Failed to delete vote');
		});

		it('should change vote from UPVOTE to DOWNVOTE', async () => {
			const existingUpvote: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
				createdAt: new Date('2024-01-01'),
			};

			const downvoteRequest: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.DOWNVOTE,
			};

			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				existingUpvote
			);
			(CommentVoteDAO.changeCommentVote as jest.Mock).mockResolvedValue(
				true
			);

			const result =
				await CommentVoteService.createCommentVote(downvoteRequest);

			expect(CommentVoteDAO.changeCommentVote).toHaveBeenCalledWith(
				'user1',
				'comment1',
				VoteStatus.DOWNVOTE
			);
			expect(result.status).toBe(VoteStatus.DOWNVOTE);
			expect(result.softDelete).toBe(false);
		});

		it('should change vote from DOWNVOTE to UPVOTE', async () => {
			const existingDownvote: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.DOWNVOTE,
				softDelete: false,
				createdAt: new Date('2024-01-01'),
			};

			const upvoteRequest: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
			};

			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				existingDownvote
			);
			(CommentVoteDAO.changeCommentVote as jest.Mock).mockResolvedValue(
				true
			);

			const result =
				await CommentVoteService.createCommentVote(upvoteRequest);

			expect(CommentVoteDAO.changeCommentVote).toHaveBeenCalledWith(
				'user1',
				'comment1',
				VoteStatus.UPVOTE
			);
			expect(result.status).toBe(VoteStatus.UPVOTE);
		});

		it('should preserve createdAt when updating existing vote', async () => {
			const originalDate = new Date('2024-01-01');
			const existingVote: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
				createdAt: originalDate,
			};

			const downvoteRequest: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.DOWNVOTE,
			};

			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				existingVote
			);
			(CommentVoteDAO.changeCommentVote as jest.Mock).mockResolvedValue(
				true
			);

			const result =
				await CommentVoteService.createCommentVote(downvoteRequest);

			expect(result.createdAt).toEqual(originalDate);
		});

		it('should not update soft deleted votes', async () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const softDeletedVote: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: true,
			};

			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				null
			);
			(CommentVoteDAO.createCommentVote as jest.Mock).mockResolvedValue({
				...mockVote,
				createdAt: new Date(),
			});

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const result = await CommentVoteService.createCommentVote(mockVote);

			expect(CommentVoteDAO.createCommentVote).toHaveBeenCalledWith(
				mockVote
			);
			expect(CommentVoteDAO.changeCommentVote).not.toHaveBeenCalled();
		});
	});

	describe('deleteCommentVote', () => {
		it('should delete vote successfully', async () => {
			const mockVote: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				mockVote
			);
			(CommentVoteDAO.deleteCommentVote as jest.Mock).mockResolvedValue(
				true
			);

			const result = await CommentVoteService.deleteCommentVote(
				'user1',
				'comment1'
			);

			expect(CommentVoteDAO.getCommentVoteById).toHaveBeenCalledWith(
				'comment1',
				'',
				'user1'
			);
			expect(CommentVoteDAO.deleteCommentVote).toHaveBeenCalledWith(
				'user1',
				'comment1'
			);
			expect(result).toBe(true);
		});

		it('should throw error when vote not found', async () => {
			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				null
			);

			await expect(
				CommentVoteService.deleteCommentVote('user1', 'comment1')
			).rejects.toThrow('No se encontró el voto para eliminar.');

			expect(CommentVoteDAO.deleteCommentVote).not.toHaveBeenCalled();
		});
	});

	describe('changeCommentVote', () => {
		it('should change vote status successfully', async () => {
			const mockVote: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				mockVote
			);
			(CommentVoteDAO.changeCommentVote as jest.Mock).mockResolvedValue(
				true
			);

			const result = await CommentVoteService.changeCommentVote(
				'user1',
				'comment1',
				VoteStatus.DOWNVOTE
			);

			expect(CommentVoteDAO.getCommentVoteById).toHaveBeenCalledWith(
				'comment1',
				'',
				'user1'
			);
			expect(CommentVoteDAO.changeCommentVote).toHaveBeenCalledWith(
				'user1',
				'comment1',
				VoteStatus.DOWNVOTE
			);
			expect(result).toBe(true);
		});

		it('should throw error when vote not found', async () => {
			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				null
			);

			await expect(
				CommentVoteService.changeCommentVote(
					'user1',
					'comment1',
					VoteStatus.DOWNVOTE
				)
			).rejects.toThrow('No se encontró el voto para cambiar.');

			expect(CommentVoteDAO.changeCommentVote).not.toHaveBeenCalled();
		});
	});

	describe('getCommentVotes', () => {
		it('should return all votes for a comment', async () => {
			const mockVotes: Vote[] = [
				{
					userId: 'user1',
					commentId: 'comment1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
					softDelete: false,
				},
				{
					userId: 'user2',
					commentId: 'comment1',
					postId: 'post1',
					status: VoteStatus.DOWNVOTE,
					softDelete: false,
				},
			];

			(CommentVoteDAO.getCommentVotes as jest.Mock).mockResolvedValue(
				mockVotes
			);

			const result = await CommentVoteService.getCommentVotes('comment1');

			expect(CommentVoteDAO.getCommentVotes).toHaveBeenCalledWith(
				'comment1'
			);
			expect(result).toHaveLength(2);
			expect(result).toEqual(mockVotes);
		});

		it('should return empty array when no votes', async () => {
			(CommentVoteDAO.getCommentVotes as jest.Mock).mockResolvedValue([]);

			const result = await CommentVoteService.getCommentVotes('comment1');

			expect(result).toEqual([]);
		});
	});

	describe('getCommentVoteById', () => {
		it('should return specific user vote for a comment', async () => {
			const mockVote: Vote = {
				userId: 'user1',
				commentId: 'comment1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				mockVote
			);

			const result = await CommentVoteService.getCommentVoteById(
				'comment1',
				'post1',
				'user1'
			);

			expect(CommentVoteDAO.getCommentVoteById).toHaveBeenCalledWith(
				'comment1',
				'post1',
				'user1'
			);
			expect(result).toEqual(mockVote);
			expect(result?.status).toBe(VoteStatus.UPVOTE);
		});

		it('should return null when user has not voted', async () => {
			(CommentVoteDAO.getCommentVoteById as jest.Mock).mockResolvedValue(
				null
			);

			const result = await CommentVoteService.getCommentVoteById(
				'comment1',
				'post1',
				'user1'
			);

			expect(result).toBeNull();
		});
	});
});
