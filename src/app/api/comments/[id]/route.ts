import { CommentController } from '@/controller/CommentController';
import { NextRequest } from 'next/server';

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	return CommentController.updateComment(request, id);
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	return CommentController.deleteComment(request, id);
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	return CommentController.getCommentById(request, id);
}
