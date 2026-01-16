import { NextRequest, NextResponse } from 'next/server';
import { PostVoteController } from '@/controller/PostVoteController';
import { ErrorHandler } from '@/utils/ErrorHandler';

export async function POST(request: NextRequest) {
	try {
		return PostVoteController.createPostVote(request);
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const postId = searchParams.get('postId');

	if (!postId) {
		return NextResponse.json(
			{ error: 'Post ID is required' },
			{ status: 400 }
		);
	}

	try {
		return PostVoteController.getPostVotes(request);
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}

export async function PUT(request: NextRequest) {
	try {
		return PostVoteController.changePostVote(request);
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		return PostVoteController.deletePostVote(request);
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}
