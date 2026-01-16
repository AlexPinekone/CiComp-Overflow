import { NextRequest, NextResponse } from 'next/server';
import { PostVoteController } from '@/controller/PostVoteController';
import { ErrorHandler } from '@/utils/ErrorHandler';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');

		if (!id) {
			return NextResponse.json(
				{ error: 'Post ID is required' },
				{ status: 400 }
			);
		}

		if (userId) {
			return PostVoteController.getPostVoteById(request, { id });
		} else {
			return PostVoteController.getAllVotesByPostId(id);
		}
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}

export async function POST(request: NextRequest) {
	try {
		return await PostVoteController.createPostVote(request);
	} catch (error) {
		return ErrorHandler.handle(error);
	}
}
