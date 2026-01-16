import { NextRequest, NextResponse } from 'next/server';
import { PostVoteService } from '@/service/PostVoteService';
import { VoteStatus } from '@/model/UserPostVote';
import { ErrorHandler } from '@/utils/ErrorHandler';

export class PostVoteController {
	static async createPostVote(req: NextRequest) {
		try {
			const { userId, postId, status } = await req.json();

			if (!userId || !postId || !status) {
				return NextResponse.json(
					{ error: 'Missing required fields' },
					{ status: 400 }
				);
			}

			// Validar que el status sea un valor de VoteStatus
			if (![VoteStatus.UPVOTE, VoteStatus.DOWNVOTE].includes(status)) {
				return NextResponse.json(
					{ error: 'Invalid vote status' },
					{ status: 400 }
				);
			}

			const newVote = await PostVoteService.createPostVote({
				userId,
				postId,
				status,
			});

			return NextResponse.json(newVote, { status: 201 });
		} catch (error) {
			console.error('Error en createPostVote:', error);
			return ErrorHandler.handle(error);
		}
	}

	static async changePostVote(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get('userId');
		const postId = searchParams.get('postId');

		if (!userId || !postId) {
			return NextResponse.json(
				{ error: 'Missing userId or postId' },
				{ status: 400 }
			);
		}

		try {
			const { newStatus } = await req.json();

			// Validar que el newStatus sea un valor válido
			if (![VoteStatus.UPVOTE, VoteStatus.DOWNVOTE].includes(newStatus)) {
				return NextResponse.json(
					{ error: 'Invalid newStatus value' },
					{ status: 400 }
				);
			}

			const updatedVote = await PostVoteService.changePostVote(
				userId,
				postId,
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

	static async deletePostVote(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get('userId');
		const postId = searchParams.get('postId');

		if (!userId || !postId) {
			return NextResponse.json(
				{ error: 'Missing userId or postId' },
				{ status: 400 }
			);
		}

		try {
			const isDeleted = await PostVoteService.deletePostVote(
				userId,
				postId
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

	static async getPostVotes(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const postId = searchParams.get('postId');

		if (!postId) {
			return NextResponse.json(
				{ error: 'Post ID is required' },
				{ status: 400 }
			);
		}

		try {
			const votes = await PostVoteService.getPostVotes(postId);

			return NextResponse.json(votes, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getPostVoteById(req: NextRequest, params: { id: string }) {
		const { searchParams } = new URL(req.url);
		const postId = params.id;
		const userId = searchParams.get('userId');

		if (!postId || !userId) {
			return NextResponse.json(
				{ error: 'Post ID and User ID are required' },
				{ status: 400 }
			);
		}

		try {
			const vote = await PostVoteService.getPostVotesById(postId, userId);

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

	static async getAllVotesByPostId(postId: string) {
		try {
			const votes = await PostVoteService.getAllVotesByPostId(postId);

			return NextResponse.json(votes, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async countLastMonthVotes() {
		try {
			const count = await PostVoteService.countLastMonthVotes();
			return NextResponse.json({ count }, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}
}
