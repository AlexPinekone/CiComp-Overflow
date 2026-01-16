import { CommentService } from '@/service/CommentService';
import { CommentDAO } from '@/dao/CommentDAO';
import { Comment } from '@/model/Comment';

jest.mock('@/dao/CommentDAO');

describe('CommentService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getCommentsByPost', () => {
		const mockComments = [
			{
				commentId: '1',
				body: 'First comment',
				postId: 'post1',
				userId: 'user1',
				createdAt: new Date('2024-01-15'),
				votes: JSON.stringify([
					{ userId: 'u1', status: 'UPVOTE', softDelete: false },
					{ userId: 'u2', status: 'UPVOTE', softDelete: false },
				]),
			},
			{
				commentId: '2',
				body: 'Second comment',
				postId: 'post1',
				userId: 'user2',
				createdAt: new Date('2024-01-10'),
				votes: JSON.stringify([
					{ userId: 'u3', status: 'DOWNVOTE', softDelete: false },
				]),
			},
			{
				commentId: '3',
				body: 'Third comment',
				postId: 'post1',
				userId: 'user3',
				createdAt: new Date('2024-01-20'),
				votes: JSON.stringify([]),
			},
		];

		it('should return comments sorted by date desc (default)', async () => {
			(CommentDAO.getCommentsByPostId as jest.Mock).mockResolvedValue([
				...mockComments,
			]);

			const result = await CommentService.getCommentsByPost('post1');

			expect(CommentDAO.getCommentsByPostId).toHaveBeenCalledWith(
				'post1'
			);
			expect(result).toHaveLength(3);
			expect(result[0].commentId).toBe('3');
			expect(result[1].commentId).toBe('1');
			expect(result[2].commentId).toBe('2');
		});

		it('should return comments sorted by date asc', async () => {
			(CommentDAO.getCommentsByPostId as jest.Mock).mockResolvedValue([
				...mockComments,
			]);

			const result = await CommentService.getCommentsByPost(
				'post1',
				'date',
				'asc'
			);

			expect(result[0].commentId).toBe('2');
			expect(result[1].commentId).toBe('1');
			expect(result[2].commentId).toBe('3');
		});

		it('should return comments sorted by votes desc', async () => {
			(CommentDAO.getCommentsByPostId as jest.Mock).mockResolvedValue([
				...mockComments,
			]);

			const result = await CommentService.getCommentsByPost(
				'post1',
				'votes',
				'desc'
			);

			expect(result[0].commentId).toBe('1');
			expect(result[1].commentId).toBe('3');
			expect(result[2].commentId).toBe('2');
		});

		it('should return comments sorted by votes asc', async () => {
			(CommentDAO.getCommentsByPostId as jest.Mock).mockResolvedValue([
				...mockComments,
			]);

			const result = await CommentService.getCommentsByPost(
				'post1',
				'votes',
				'asc'
			);

			expect(result[0].commentId).toBe('2');
			expect(result[1].commentId).toBe('3');
			expect(result[2].commentId).toBe('1');
		});

		it('should parse votes from string to array', async () => {
			const commentsWithStringVotes = [
				{
					commentId: '1',
					body: 'Comment',
					postId: 'post1',
					userId: 'user1',
					createdAt: new Date(),
					votes: '[{"userId":"u1","status":"UPVOTE","softDelete":false}]',
				},
			];

			(CommentDAO.getCommentsByPostId as jest.Mock).mockResolvedValue(
				commentsWithStringVotes
			);

			const result = await CommentService.getCommentsByPost('post1');

			expect(Array.isArray(result[0].votes)).toBe(true);
			expect(result[0].votes).toHaveLength(1);
		});

		it('should handle invalid JSON votes gracefully', async () => {
			const commentsWithInvalidVotes = [
				{
					commentId: '1',
					body: 'Comment',
					postId: 'post1',
					userId: 'user1',
					createdAt: new Date(),
					votes: 'invalid json',
				},
			];

			(CommentDAO.getCommentsByPostId as jest.Mock).mockResolvedValue(
				commentsWithInvalidVotes
			);

			const result = await CommentService.getCommentsByPost('post1');

			expect(result[0].votes).toEqual([]);
		});

		it('should handle non-array votes', async () => {
			const commentsWithNonArrayVotes = [
				{
					commentId: '1',
					body: 'Comment',
					postId: 'post1',
					userId: 'user1',
					createdAt: new Date(),
					votes: { invalid: 'object' },
				},
			];

			(CommentDAO.getCommentsByPostId as jest.Mock).mockResolvedValue(
				commentsWithNonArrayVotes
			);

			const result = await CommentService.getCommentsByPost('post1');

			expect(result[0].votes).toEqual([]);
		});

		it('should return empty array when no comments', async () => {
			(CommentDAO.getCommentsByPostId as jest.Mock).mockResolvedValue([]);

			const result = await CommentService.getCommentsByPost('post1');

			expect(result).toEqual([]);
		});

		it('should ignore soft deleted votes in score calculation', async () => {
			const commentsWithDeletedVotes = [
				{
					commentId: '1',
					body: 'Comment',
					postId: 'post1',
					userId: 'user1',
					createdAt: new Date(),
					votes: JSON.stringify([
						{ userId: 'u1', status: 'UPVOTE', softDelete: false },
						{ userId: 'u2', status: 'UPVOTE', softDelete: true },
						{ userId: 'u3', status: 'DOWNVOTE', softDelete: false },
					]),
				},
			];

			(CommentDAO.getCommentsByPostId as jest.Mock).mockResolvedValue(
				commentsWithDeletedVotes
			);

			const result = await CommentService.getCommentsByPost(
				'post1',
				'votes',
				'desc'
			);

			expect(result).toHaveLength(1);
		});
	});

	describe('getCommentById', () => {
		it('should return comment when found', async () => {
			const mockComment: Comment = {
				commentId: '1',
				body: 'Test comment',
				postId: 'post1',
			};

			(CommentDAO.getCommentById as jest.Mock).mockResolvedValue(
				mockComment
			);

			const result = await CommentService.getCommentById('1');

			expect(CommentDAO.getCommentById).toHaveBeenCalledWith('1');
			expect(result).toEqual(mockComment);
		});

		it('should return null when comment not found', async () => {
			(CommentDAO.getCommentById as jest.Mock).mockResolvedValue(null);

			const result = await CommentService.getCommentById('nonexistent');

			expect(result).toBeNull();
		});
	});

	describe('createComment', () => {
		it('should create comment successfully', async () => {
			const commentData = {
				body: 'New comment',
				postId: 'post1',
				userId: 'user1',
			};

			const mockCreatedComment: Comment = {
				commentId: '1',
				...commentData,
				createdAt: new Date(),
			};

			(CommentDAO.createComment as jest.Mock).mockResolvedValue(
				mockCreatedComment
			);

			const result = await CommentService.createComment(commentData);

			expect(CommentDAO.createComment).toHaveBeenCalledWith(commentData);
			expect(result).toEqual(mockCreatedComment);
			expect(result.commentId).toBeDefined();
		});

		it('should create comment with all fields', async () => {
			const commentData = {
				body: 'Detailed comment',
				postId: 'post1',
				userId: 'user1',
			};

			(CommentDAO.createComment as jest.Mock).mockResolvedValue({
				commentId: '1',
				...commentData,
			});

			const result = await CommentService.createComment(commentData);

			expect(result.body).toBe(commentData.body);
			expect(result.postId).toBe(commentData.postId);
			expect(result).toHaveProperty('userId', commentData.userId);
		});
	});

	describe('updateComment', () => {
		it('should update comment successfully', async () => {
			const commentData: Comment = {
				commentId: '1',
				body: 'Updated comment',
				postId: 'post1',
			};

			const mockUpdatedComment = {
				...commentData,
				updatedAt: new Date(),
			};

			(CommentDAO.updateComment as jest.Mock).mockResolvedValue(
				mockUpdatedComment
			);

			const result = await CommentService.updateComment(commentData);

			expect(CommentDAO.updateComment).toHaveBeenCalledWith(commentData);
			expect(result.body).toBe('Updated comment');
		});

		it('should preserve commentId when updating', async () => {
			const commentData: Comment = {
				commentId: '1',
				body: 'Updated',
				postId: 'post1',
			};

			(CommentDAO.updateComment as jest.Mock).mockResolvedValue(
				commentData
			);

			const result = await CommentService.updateComment(commentData);

			expect(result.commentId).toBe('1');
		});
	});

	describe('deleteComment', () => {
		it('should delete comment successfully', async () => {
			const mockDeleteResult = { userId: 'user1' };

			(CommentDAO.deleteComment as jest.Mock).mockResolvedValue(
				mockDeleteResult
			);

			const result = await CommentService.deleteComment('1');

			expect(CommentDAO.deleteComment).toHaveBeenCalledWith('1');
			expect(result).toEqual(mockDeleteResult);
		});

		it('should propagate error when comment not found', async () => {
			(CommentDAO.deleteComment as jest.Mock).mockRejectedValue(
				new Error('Comment not found')
			);

			await expect(
				CommentService.deleteComment('nonexistent')
			).rejects.toThrow('Comment not found');
		});
	});

	describe('deleteAllComments', () => {
		it('should delete all comments for a post', async () => {
			(CommentDAO.deleteAllComments as jest.Mock).mockResolvedValue(
				undefined
			);

			await CommentService.deleteAllComments('post1');

			expect(CommentDAO.deleteAllComments).toHaveBeenCalledWith('post1');
		});

		it('should handle deletion of post with no comments', async () => {
			(CommentDAO.deleteAllComments as jest.Mock).mockResolvedValue(
				undefined
			);

			await expect(
				CommentService.deleteAllComments('emptyPost')
			).resolves.not.toThrow();
		});
	});

	describe('countLastMonthComments', () => {
		it('should return count of last month comments', async () => {
			(CommentDAO.countLastMonthComments as jest.Mock).mockResolvedValue(
				42
			);

			const result = await CommentService.countLastMonthComments();

			expect(CommentDAO.countLastMonthComments).toHaveBeenCalled();
			expect(result).toBe(42);
		});

		it('should return 0 when no comments in last month', async () => {
			(CommentDAO.countLastMonthComments as jest.Mock).mockResolvedValue(
				0
			);

			const result = await CommentService.countLastMonthComments();

			expect(result).toBe(0);
		});
	});
});
