import { NextRequest, NextResponse } from 'next/server';
import { CommentVoteController } from '@/controller/CommentVoteController';
import { ErrorHandler } from '@/utils/ErrorHandler';

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const commentId = id;
		const { searchParams } = new URL(req.url);
		const postId = searchParams.get('postId');
		const userId = searchParams.get('userId');

		if (!commentId || !postId || !userId) {
			return NextResponse.json(
				{ error: 'Missing commentId, postId, or userId' },
				{ status: 400 }
			);
		}

		return await CommentVoteController.getCommentVoteById(req, {
			id: commentId,
		});
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}

export async function POST(request: NextRequest) {
	try {
		return await CommentVoteController.createCommentVote(request);
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}
