import { UserController } from '@/controller/UserController';
import { NextRequest } from 'next/server';

/*
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	return UserController.getUserPostsById(req, id);
}
	*/

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = await params;

	const url = new URL(req.url);
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const orderBy =
		(url.searchParams.get('orderBy') as 'newest' | 'oldest') || 'newest';
	const limit = parseInt(url.searchParams.get('limit') || '5', 10);

	return UserController.getUserPostsByIdPaginated(
		req,
		id,
		orderBy,
		page,
		limit
	);
}
