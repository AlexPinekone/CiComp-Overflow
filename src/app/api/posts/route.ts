import { PostController } from '@/controller/PostController';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
	return PostController.getAllPosts(req);
}

export async function POST(request: NextRequest) {
	return PostController.createPost(request);
}
/*
export async function DELETE(request: NextRequest) {
	return PostController.deletePost(request);
}
*/
