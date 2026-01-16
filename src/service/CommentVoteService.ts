import { CommentVoteDAO } from '@/dao/CommentVoteDAO';
import { Vote } from '@/model/UserCommentVote';
import { VoteStatus } from '@/model/UserPostVote';

export class CommentVoteService {
	static async createCommentVote(vote: Vote): Promise<Vote> {
		const existingVote = await CommentVoteDAO.getCommentVoteById(
			vote.commentId,
			vote.postId || '',
			vote.userId
		);

		if (
			existingVote &&
			!existingVote.softDelete &&
			existingVote.status === vote.status
		) {
			const deleted = await CommentVoteDAO.deleteCommentVote(
				vote.userId,
				vote.commentId
			);

			if (deleted) {
				return {
					...vote,
					status: vote.status,
					softDelete: true,
					createdAt: new Date(),
				};
			}

			throw new Error('Failed to delete vote');
		}

		// Si ya existía y era diferente, se actualiza
		if (existingVote && !existingVote.softDelete) {
			await CommentVoteDAO.changeCommentVote(
				vote.userId,
				vote.commentId,
				vote.status
			);

			return {
				...vote,
				createdAt: existingVote.createdAt,
				softDelete: false,
			};
		}

		// Si no existía, se crea
		return await CommentVoteDAO.createCommentVote(vote);
	}

	static async deleteCommentVote(
		userId: string,
		commentId: string
	): Promise<boolean> {
		const existingVote = await CommentVoteDAO.getCommentVoteById(
			commentId,
			'',
			userId
		);
		if (!existingVote) {
			throw new Error('No se encontró el voto para eliminar.');
		}

		return CommentVoteDAO.deleteCommentVote(userId, commentId);
	}

	static async changeCommentVote(
		userId: string,
		commentId: string,
		newStatus: VoteStatus
	): Promise<boolean> {
		const existingVote = await CommentVoteDAO.getCommentVoteById(
			commentId,
			'',
			userId
		);
		if (!existingVote) {
			throw new Error('No se encontró el voto para cambiar.');
		}
		return CommentVoteDAO.changeCommentVote(userId, commentId, newStatus);
	}

	static async getCommentVotes(commentId: string): Promise<Vote[]> {
		return CommentVoteDAO.getCommentVotes(commentId);
	}

	static async getCommentVoteById(
		commentId: string,
		postId: string,
		userId: string
	) {
		return CommentVoteDAO.getCommentVoteById(commentId, postId, userId);
	}
}
