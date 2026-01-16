import { NextRequest } from 'next/server';
import { PostController } from '@/controller/PostController';

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get('q') || '';
	const page = parseInt(searchParams.get('page') || '1', 10);
	const limit = parseInt(searchParams.get('limit') || '10', 10);

	return PostController.searchPostsByVotes(query, page, limit);
}
