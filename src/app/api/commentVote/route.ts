import { NextRequest, NextResponse } from 'next/server';
import { CommentVoteController } from '@/controller/CommentVoteController';
import { ErrorHandler } from '@/utils/ErrorHandler';

export async function POST(request: NextRequest) {
	try {
		return CommentVoteController.createCommentVote(request);
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const commentId = searchParams.get('commentId');

	if (!commentId) {
		return NextResponse.json(
			{ error: 'Comment ID is required' },
			{ status: 400 }
		);
	}

	try {
		return CommentVoteController.getCommentVotes(request);
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}

export async function PUT(request: NextRequest) {
	try {
		return CommentVoteController.changeCommentVote(request);
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		return CommentVoteController.deleteCommentVote(request);
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}
