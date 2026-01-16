import { PostVoteService } from '@/service/PostVoteService';
import { PostVoteDAO } from '@/dao/PostVoteDAO';
import { Vote, VoteStatus } from '@/model/UserPostVote';

jest.mock('@/dao/PostVoteDAO');

describe('PostVoteService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('createPostVote', () => {
		const mockVote: Vote = {
			userId: 'user1',
			postId: 'post1',
			status: VoteStatus.UPVOTE,
		};

		it('should create new vote when no existing vote', async () => {
			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(null);
			(PostVoteDAO.createPostVote as jest.Mock).mockResolvedValue({
				...mockVote,
				createdAt: new Date(),
			});

			const result = await PostVoteService.createPostVote(mockVote);

			expect(PostVoteDAO.getPostVotesById).toHaveBeenCalledWith(
				'post1',
				'user1'
			);
			expect(PostVoteDAO.createPostVote).toHaveBeenCalledWith(mockVote);
			expect(result.status).toBe(VoteStatus.UPVOTE);
		});

		it('should delete vote when voting same status (toggle)', async () => {
			const existingVote: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(
				existingVote
			);
			(PostVoteDAO.deletePostVote as jest.Mock).mockResolvedValue(true);

			await expect(
				PostVoteService.createPostVote(mockVote)
			).rejects.toThrow('Vote deleted successfully');

			expect(PostVoteDAO.deletePostVote).toHaveBeenCalledWith(
				'user1',
				'post1'
			);
		});

		it('should throw error if toggle delete fails', async () => {
			const existingVote: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(
				existingVote
			);
			(PostVoteDAO.deletePostVote as jest.Mock).mockResolvedValue(false);

			await expect(
				PostVoteService.createPostVote(mockVote)
			).rejects.toThrow('Failed to delete the vote');
		});

		it('should change vote from UPVOTE to DOWNVOTE', async () => {
			const existingUpvote: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			const downvoteRequest: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.DOWNVOTE,
			};

			const updatedVote: Vote = {
				...downvoteRequest,
				createdAt: new Date(),
			};

			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(
				existingUpvote
			);
			(PostVoteDAO.updatePostVoteStatus as jest.Mock).mockResolvedValue(
				updatedVote
			);

			const result =
				await PostVoteService.createPostVote(downvoteRequest);

			expect(PostVoteDAO.updatePostVoteStatus).toHaveBeenCalledWith(
				'user1',
				'post1',
				VoteStatus.DOWNVOTE
			);
			expect(result.status).toBe(VoteStatus.DOWNVOTE);
		});

		it('should change vote from DOWNVOTE to UPVOTE', async () => {
			const existingDownvote: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.DOWNVOTE,
				softDelete: false,
			};

			const upvoteRequest: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
			};

			const updatedVote: Vote = {
				...upvoteRequest,
				createdAt: new Date(),
			};

			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(
				existingDownvote
			);
			(PostVoteDAO.updatePostVoteStatus as jest.Mock).mockResolvedValue(
				updatedVote
			);

			const result = await PostVoteService.createPostVote(upvoteRequest);

			expect(PostVoteDAO.updatePostVoteStatus).toHaveBeenCalledWith(
				'user1',
				'post1',
				VoteStatus.UPVOTE
			);
			expect(result.status).toBe(VoteStatus.UPVOTE);
		});

		it('should throw error if vote update fails', async () => {
			const existingVote: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			const downvoteRequest: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.DOWNVOTE,
			};

			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(
				existingVote
			);
			(PostVoteDAO.updatePostVoteStatus as jest.Mock).mockResolvedValue(
				null
			);

			await expect(
				PostVoteService.createPostVote(downvoteRequest)
			).rejects.toThrow('Error actualizando el voto');
		});

		it('should handle soft deleted votes by updating them', async () => {
			const softDeletedVote: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: true,
			};

			const updatedVote: Vote = {
				...mockVote,
				softDelete: false,
				createdAt: new Date(),
			};

			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(
				softDeletedVote
			);
			(PostVoteDAO.updatePostVoteStatus as jest.Mock).mockResolvedValue(
				updatedVote
			);

			const result = await PostVoteService.createPostVote(mockVote);

			expect(result.softDelete).toBe(false);
			expect(result.status).toBe(VoteStatus.UPVOTE);
		});
	});

	describe('deletePostVote', () => {
		it('should delete vote successfully', async () => {
			const mockVote: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(
				mockVote
			);
			(PostVoteDAO.deletePostVote as jest.Mock).mockResolvedValue(true);

			const result = await PostVoteService.deletePostVote(
				'user1',
				'post1'
			);

			expect(PostVoteDAO.getPostVotesById).toHaveBeenCalledWith(
				'post1',
				'user1'
			);
			expect(PostVoteDAO.deletePostVote).toHaveBeenCalledWith(
				'user1',
				'post1'
			);
			expect(result).toBe(true);
		});

		it('should throw error when vote not found', async () => {
			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(null);

			await expect(
				PostVoteService.deletePostVote('user1', 'post1')
			).rejects.toThrow('No se encontró el voto para eliminar.');

			expect(PostVoteDAO.deletePostVote).not.toHaveBeenCalled();
		});
	});

	describe('changePostVote', () => {
		it('should change vote status successfully', async () => {
			const updatedVote: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.DOWNVOTE,
				createdAt: new Date(),
			};

			(PostVoteDAO.updatePostVoteStatus as jest.Mock).mockResolvedValue(
				updatedVote
			);

			const result = await PostVoteService.changePostVote(
				'user1',
				'post1',
				VoteStatus.DOWNVOTE
			);

			expect(PostVoteDAO.updatePostVoteStatus).toHaveBeenCalledWith(
				'user1',
				'post1',
				VoteStatus.DOWNVOTE
			);
			expect(result?.status).toBe(VoteStatus.DOWNVOTE);
		});

		it('should return null when update fails', async () => {
			(PostVoteDAO.updatePostVoteStatus as jest.Mock).mockResolvedValue(
				null
			);

			const result = await PostVoteService.changePostVote(
				'user1',
				'post1',
				VoteStatus.UPVOTE
			);

			expect(result).toBeNull();
		});
	});

	describe('getPostVotes', () => {
		it('should return all votes for a post', async () => {
			const mockVotes: Vote[] = [
				{
					userId: 'user1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
					softDelete: false,
				},
				{
					userId: 'user2',
					postId: 'post1',
					status: VoteStatus.DOWNVOTE,
					softDelete: false,
				},
				{
					userId: 'user3',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
					softDelete: false,
				},
			];

			(PostVoteDAO.getPostVotes as jest.Mock).mockResolvedValue(
				mockVotes
			);

			const result = await PostVoteService.getPostVotes('post1');

			expect(PostVoteDAO.getPostVotes).toHaveBeenCalledWith('post1');
			expect(result).toHaveLength(3);
			expect(result).toEqual(mockVotes);
		});

		it('should return empty array when no votes', async () => {
			(PostVoteDAO.getPostVotes as jest.Mock).mockResolvedValue([]);

			const result = await PostVoteService.getPostVotes('post1');

			expect(result).toEqual([]);
		});
	});

	describe('getPostVotesById', () => {
		it('should return specific user vote for a post', async () => {
			const mockVote: Vote = {
				userId: 'user1',
				postId: 'post1',
				status: VoteStatus.UPVOTE,
				softDelete: false,
			};

			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(
				mockVote
			);

			const result = await PostVoteService.getPostVotesById(
				'post1',
				'user1'
			);

			expect(PostVoteDAO.getPostVotesById).toHaveBeenCalledWith(
				'post1',
				'user1'
			);
			expect(result).toEqual(mockVote);
			expect(result?.status).toBe(VoteStatus.UPVOTE);
		});

		it('should return null when user has not voted', async () => {
			(PostVoteDAO.getPostVotesById as jest.Mock).mockResolvedValue(null);

			const result = await PostVoteService.getPostVotesById(
				'post1',
				'user1'
			);

			expect(result).toBeNull();
		});
	});

	describe('getAllVotesByPostId', () => {
		it('should return all votes excluding soft deleted', async () => {
			const mockVotes: Vote[] = [
				{
					userId: 'user1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
					softDelete: false,
				},
				{
					userId: 'user2',
					postId: 'post1',
					status: VoteStatus.DOWNVOTE,
					softDelete: true,
				},
				{
					userId: 'user3',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
					softDelete: false,
				},
			];

			(PostVoteDAO.getAllVotesByPostId as jest.Mock).mockResolvedValue(
				mockVotes
			);

			const result = await PostVoteService.getAllVotesByPostId('post1');

			expect(PostVoteDAO.getAllVotesByPostId).toHaveBeenCalledWith(
				'post1'
			);
			expect(result).toHaveLength(2);
			expect(result.every((v) => !v.softDelete)).toBe(true);
		});

		it('should return empty array when all votes are soft deleted', async () => {
			const mockVotes: Vote[] = [
				{
					userId: 'user1',
					postId: 'post1',
					status: VoteStatus.UPVOTE,
					softDelete: true,
				},
			];

			(PostVoteDAO.getAllVotesByPostId as jest.Mock).mockResolvedValue(
				mockVotes
			);

			const result = await PostVoteService.getAllVotesByPostId('post1');

			expect(result).toEqual([]);
		});

		it('should calculate vote score correctly', async () => {
			const mockVotes: Vote[] = [
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
				{
					userId: 'user3',
					postId: 'post1',
					status: VoteStatus.DOWNVOTE,
					softDelete: false,
				},
			];

			(PostVoteDAO.getAllVotesByPostId as jest.Mock).mockResolvedValue(
				mockVotes
			);

			const result = await PostVoteService.getAllVotesByPostId('post1');

			// Score = 2 upvotes - 1 downvote = +1
			const upvotes = result.filter(
				(v) => v.status === VoteStatus.UPVOTE
			).length;
			const downvotes = result.filter(
				(v) => v.status === VoteStatus.DOWNVOTE
			).length;
			const score = upvotes - downvotes;

			expect(score).toBe(1);
		});
	});

	describe('countLastMonthVotes', () => {
		it('should return count of votes from last month', async () => {
			(PostVoteDAO.countLastMonthVotes as jest.Mock).mockResolvedValue(
				42
			);

			const result = await PostVoteService.countLastMonthVotes();

			expect(PostVoteDAO.countLastMonthVotes).toHaveBeenCalled();
			expect(result).toBe(42);
		});

		it('should return 0 when no votes in last month', async () => {
			(PostVoteDAO.countLastMonthVotes as jest.Mock).mockResolvedValue(0);

			const result = await PostVoteService.countLastMonthVotes();

			expect(result).toBe(0);
		});
	});
});
