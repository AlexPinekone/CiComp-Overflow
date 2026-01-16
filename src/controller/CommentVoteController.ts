import { NextRequest, NextResponse } from 'next/server';
import { CommentVoteService } from '@/service/CommentVoteService';
import { VoteStatus } from '@/model/UserPostVote';
import { ErrorHandler } from '@/utils/ErrorHandler';

export class CommentVoteController {
	static async createCommentVote(req: NextRequest) {
		try {
			const { userId, commentId, postId, status } = await req.json();

			if (!userId || !commentId || !postId || !status) {
				return NextResponse.json(
					{ error: 'Missing required fields' },
					{ status: 400 }
				);
			}

			if (![VoteStatus.UPVOTE, VoteStatus.DOWNVOTE].includes(status)) {
				return NextResponse.json(
					{ error: 'Invalid vote status' },
					{ status: 400 }
				);
			}

			const newVote = await CommentVoteService.createCommentVote({
				userId,
				commentId,
				postId,
				status,
			});

			return NextResponse.json(newVote, { status: 201 });
		} catch (error) {
			console.error('Comentario: Error en createCommentVote', error);

			return ErrorHandler.handle(error);
		}
	}

	static async changeCommentVote(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get('userId');
		const commentId = searchParams.get('commentId');

		if (!userId || !commentId) {
			return NextResponse.json(
				{ error: 'Missing userId or commentId' },
				{ status: 400 }
			);
		}

		try {
			const { newStatus } = await req.json();

			if (![VoteStatus.UPVOTE, VoteStatus.DOWNVOTE].includes(newStatus)) {
				return NextResponse.json(
					{ error: 'Invalid newStatus value' },
					{ status: 400 }
				);
			}

			const updatedVote = await CommentVoteService.changeCommentVote(
				userId,
				commentId,
				newStatus
			);

			if (!updatedVote) {
				return NextResponse.json(
					{ error: 'Vote not found' },
					{ status: 404 }
				);
			}

			return NextResponse.json(
				{ message: 'Vote updated successfully' },
				{ status: 200 }
			);
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async deleteCommentVote(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get('userId');
		const commentId = searchParams.get('commentId');

		if (!userId || !commentId) {
			return NextResponse.json(
				{ error: 'Missing userId or commentId' },
				{ status: 400 }
			);
		}

		try {
			const isDeleted = await CommentVoteService.deleteCommentVote(
				userId,
				commentId
			);

			if (!isDeleted) {
				return NextResponse.json(
					{ error: 'Vote not found' },
					{ status: 404 }
				);
			}

			return NextResponse.json(
				{ message: 'Vote deleted successfully' },
				{ status: 200 }
			);
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getCommentVotes(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const commentId = searchParams.get('commentId');

		if (!commentId) {
			return NextResponse.json(
				{ error: 'Comment ID is required' },
				{ status: 400 }
			);
		}

		try {
			const votes = await CommentVoteService.getCommentVotes(commentId);

			return NextResponse.json(votes, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getCommentVoteById(req: NextRequest, params: { id: string }) {
		const commentId = params.id;
		const { searchParams } = new URL(req.url);
		const postId = searchParams.get('postId');
		const userId = searchParams.get('userId');

		if (!commentId || !postId || !userId) {
			return NextResponse.json(
				{ error: 'Missing required parameters' },
				{ status: 400 }
			);
		}

		try {
			const vote = await CommentVoteService.getCommentVoteById(
				commentId,
				postId,
				userId
			);

			if (!vote) {
				return NextResponse.json(
					{ error: 'Vote not found' },
					{ status: 404 }
				);
			}

			return NextResponse.json(vote, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}
}
