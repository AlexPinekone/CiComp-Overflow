import { PostController } from '@/controller/PostController';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get('q') || '';
	const orderBy = searchParams.get('orderBy') || 'newest';
	const page = parseInt(searchParams.get('page') || '1', 10);
	const limit = parseInt(searchParams.get('limit') || '10', 10);

	return PostController.searchPosts(query, orderBy, page, limit);
}
