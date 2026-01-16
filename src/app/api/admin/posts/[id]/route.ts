import { AdminController } from '@/controller/AdminController';
import { NextRequest } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	return AdminController.getPostById(params.id);
}

export async function PUT(request: NextRequest) {
	return AdminController.updatePost(request);
}

export async function DELETE(request: NextRequest) {
	return AdminController.deletePost(request);
}
