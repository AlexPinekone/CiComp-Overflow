import { PostVoteDAO } from '@/dao/PostVoteDAO';
import { Vote, VoteStatus } from '@/model/UserPostVote';

export class PostVoteService {
	static async createPostVote(vote: Vote): Promise<Vote> {
		const existingVote = await PostVoteDAO.getPostVotesById(
			vote.postId,
			vote.userId
		);

		if (
			existingVote &&
			!existingVote.softDelete &&
			existingVote.status === vote.status
		) {
			const deleted = await PostVoteDAO.deletePostVote(
				vote.userId,
				vote.postId
			);
			if (deleted) {
				throw new Error(
					'Vote deleted successfully, no Vote object to return.'
				);
			}
			throw new Error('Failed to delete the vote.');
		}

		if (existingVote) {
			const updated = await this.changePostVote(
				vote.userId,
				vote.postId,
				vote.status
			);
			if (!updated) {
				throw new Error('Error actualizando el voto');
			}
			return updated;
		}

		return PostVoteDAO.createPostVote(vote);
	}

	static async deletePostVote(
		userId: string,
		postId: string
	): Promise<boolean> {
		const existingVote = await PostVoteDAO.getPostVotesById(postId, userId);
		if (!existingVote) {
			throw new Error('No se encontró el voto para eliminar.');
		}

		return PostVoteDAO.deletePostVote(userId, postId);
	}

	static async changePostVote(
		userId: string,
		postId: string,
		newStatus: VoteStatus
	): Promise<Vote | null> {
		const updatedVote = await PostVoteDAO.updatePostVoteStatus(
			userId,
			postId,
			newStatus
		);
		return updatedVote;
	}

	static async getPostVotes(postId: string): Promise<Vote[]> {
		return PostVoteDAO.getPostVotes(postId);
	}

	static async getPostVotesById(
		postId: string,
		userId: string
	): Promise<Vote | null> {
		return PostVoteDAO.getPostVotesById(postId, userId);
	}

	static async getAllVotesByPostId(postId: string): Promise<Vote[]> {
		const allVotes = await PostVoteDAO.getAllVotesByPostId(postId);
		return allVotes.filter((v) => !v.softDelete);
	}

	static async countLastMonthVotes(): Promise<number> {
		return await PostVoteDAO.countLastMonthVotes();
	}
}
