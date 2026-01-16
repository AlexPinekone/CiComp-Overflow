import { CommentController } from '@/controller/CommentController';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	return CommentController.getCommentsByPostId(request);
}

export async function PUT(request: NextRequest) {
	return CommentController.updateComment(request);
}

export async function DELETE(request: NextRequest) {
	return CommentController.deleteComment(request);
}
