import { CommentController } from '@/controller/CommentController';
import { NextRequest } from 'next/server';

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	return CommentController.createComment(request, id);
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	return CommentController.getCommentsByPostId(request, id);
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	return CommentController.deleteAllComment(request, id);
}
