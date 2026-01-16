import { CommentDAO } from '@/dao/CommentDAO';
import { Comment } from '@/model/Comment';

export class CommentService {
	static async getCommentsByPost(
		postId: string,
		sortBy: string = 'date',
		order: string = 'desc'
	) {
		const comments = await CommentDAO.getCommentsByPostId(postId);

		// Procesar votos
		for (const comment of comments) {
			if (typeof comment.votes === 'string') {
				try {
					comment.votes = JSON.parse(comment.votes);
				} catch {
					comment.votes = [];
				}
			} else if (!Array.isArray(comment.votes)) {
				comment.votes = [];
			}
		}

		// Aplicar ordenamiento
		if (sortBy === 'votes') {
			comments.sort((a: any, b: any) => {
				const votesA = CommentService.calculateVoteScore(a.votes);
				const votesB = CommentService.calculateVoteScore(b.votes);
				return order === 'asc' ? votesA - votesB : votesB - votesA;
			});
		} else if (sortBy === 'date') {
			comments.sort((a: any, b: any) => {
				const timeA = new Date(a.createdAt).getTime();
				const timeB = new Date(b.createdAt).getTime();
				return order === 'asc' ? timeA - timeB : timeB - timeA;
			});
		}

		return comments;
	}

	static async getCommentById(id: string) {
		return await CommentDAO.getCommentById(id);
	}

	static async createComment(commentData: Comment & { userId: string }) {
		return await CommentDAO.createComment(commentData);
	}

	static async updateComment(commentData: Comment) {
		return await CommentDAO.updateComment(commentData);
	}

	static async deleteComment(commentId: string) {
		return await CommentDAO.deleteComment(commentId);
	}

	static async deleteAllComments(postId: string) {
		return await CommentDAO.deleteAllComments(postId);
	}

	static async countLastMonthComments(): Promise<number> {
		return await CommentDAO.countLastMonthComments();
	}

	private static calculateVoteScore(votes: any[]): number {
		return votes.reduce((acc: number, v: any) => {
			if (v.softDelete) return acc;
			if (v.status === 'UPVOTE') return acc + 1;
			if (v.status === 'DOWNVOTE') return acc - 1;
			return acc;
		}, 0);
	}
}
