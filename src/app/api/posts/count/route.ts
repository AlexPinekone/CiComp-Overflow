import { PostController } from '@/controller/PostController';

export async function GET() {
	return await PostController.countAllPosts();
}
