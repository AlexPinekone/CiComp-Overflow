import { PostDateFilter } from '@/constants/post';
import { RedisCache } from '@/lib/redis';
import { PostService } from '@/service/PostService';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export class PostController {
	static async getAllPosts(request: NextRequest) {
		const redis = await RedisCache.getInstance();

		try {
			const searchParams = request.nextUrl.searchParams;
			const orderBy = searchParams.get('orderBy') || 'newest';
			const tag = searchParams.get('tag') || null;
			const publishedDate = searchParams.get('publishedDate') || null;
			const page = parseInt(searchParams.get('page') || '1', 10);
			const limit = parseInt(searchParams.get('limit') || '10', 10);

			const cacheKey = redis.buildKey(
				'posts',
				orderBy,
				publishedDate || 'all',
				tag || 'all',
				`page:${page}`,
				`limit:${limit}`
			);

			if (await redis.exists(cacheKey)) {
				const cachedPosts = await redis.getJSON<any[]>(cacheKey);
				return NextResponse.json(cachedPosts, { status: 200 });
			}

			const posts = await PostService.getAllPosts({
				orderBy,
				publishedDate: publishedDate as PostDateFilter | null,
				tag,
				page,
				limit,
			});

			await redis.setJSON(cacheKey, posts, 60);
			return NextResponse.json(posts, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getPostById(id: string) {
		const redis = await RedisCache.getInstance();

		const cacheKey = redis.buildKey('post', id);

		if (await redis.exists(cacheKey)) {
			const cachedPost = await redis.getJSON<any>(cacheKey);
			return NextResponse.json(cachedPost, { status: 200 });
		}

		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid post ID' },
				{ status: 400 }
			);
		}

		try {
			const post = await PostService.getPostById(id);
			if (!post)
				return NextResponse.json(
					{ error: 'Post not found' },
					{ status: 404 }
				);
			await redis.setJSON(cacheKey, post, 900);
			return NextResponse.json(post, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async createPost(req: NextRequest) {
		try {
			// Derivar userId desde sesión (Authorization header o cookie)
			const authHeader =
				req.headers.get('Authorization') ||
				req.headers.get('authorization');
			const cookieAuth = req.cookies.get('Authorization')?.value;
			const sessionToken = authHeader || cookieAuth;
			const payload = await decrypt(sessionToken || undefined);
			const sessionUserId = (payload as any)?.userId as
				| string
				| undefined;
			if (!sessionUserId) {
				return NextResponse.json(
					{ error: 'Unauthorized' },
					{ status: 401 }
				);
			}

			const formData = await req.formData();
			const formDataEntries = Object.fromEntries(formData.entries());
			const title = formDataEntries.title as string;
			const body = formDataEntries.body as string;
			const tags = formDataEntries.tags as string;
			const image = formDataEntries.image as File | null;

			if (!title || !body || !tags) {
				return NextResponse.json(
					{ error: 'Missing required fields' },
					{ status: 400 }
				);
			}

			const newPost = await PostService.createPost({
				title,
				body,
				userId: sessionUserId,
				tags: JSON.parse(tags),
				image,
			});

			return NextResponse.json(newPost, { status: 201 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async updatePost(req: NextRequest, id: string) {
		try {
			// Invalidate cache
			const redis = await RedisCache.getInstance();
			const cacheKey = redis.buildKey('post', id);
			if (await redis.exists(cacheKey)) {
				await redis.del(cacheKey);
			}

			const formData = await req.formData();
			const formDataEntries = Object.fromEntries(formData.entries());
			const title = formDataEntries.title as string;
			const body = formDataEntries.body as string;
			const tags = formDataEntries.tags as string;
			const userId = formDataEntries.userId as string;
			const image = formDataEntries.image as File | null;
			const status = formDataEntries.status as string;

			if (!id) {
				return NextResponse.json(
					{ error: 'Invalid post ID' },
					{ status: 400 }
				);
			}
			const updatedPost = await PostService.updatePost({
				postId: id,
				title,
				body,
				status,
				userId,
				image,
				tags: JSON.parse(tags),
			});

			return NextResponse.json(updatedPost, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async deletePost(req: NextRequest, postId: string) {
		if (!postId) {
			return NextResponse.json(
				{ error: 'Invalid post ID' },
				{ status: 400 }
			);
		}

		try {
			const result = await PostService.deletePost(postId);

			return NextResponse.json(
				{
					success: true,
					postAuthorId: result.userId,
				},
				{ status: 200 }
			);
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async countAllPosts() {
		try {
			const count = await PostService.countAllPosts();
			return NextResponse.json({ count }, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async countPostsLastMonth() {
		try {
			const count = await PostService.countPostsLastMonth();
			return NextResponse.json({ count }, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async searchPosts(
		query: string,
		orderBy: string,
		page: number,
		limit: number
	) {
		try {
			const redis = await RedisCache.getInstance();
			const cacheKey = redis.buildKey(
				'search',
				query,
				orderBy,
				`page:${page}`,
				`limit:${limit}`
			);

			if (await redis.exists(cacheKey)) {
				const cachedPosts = await redis.getJSON<any[]>(cacheKey);
				return NextResponse.json(cachedPosts, { status: 200 });
			}
			const posts = await PostService.searchPosts(
				query,
				orderBy,
				page,
				limit
			);

			await redis.setJSON(cacheKey, posts, 60);
			return NextResponse.json(posts, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async searchPostsByVotes(
		query: string,
		page: number,
		limit: number
	) {
		try {
			const redis = await RedisCache.getInstance();
			const cacheKey = redis.buildKey(
				'search',
				'votes',
				query,
				`page:${page}`,
				`limit:${limit}`
			);

			if (await redis.exists(cacheKey)) {
				const cachedPosts = await redis.getJSON<any[]>(cacheKey);
				return NextResponse.json(cachedPosts, { status: 200 });
			}

			const result = await PostService.searchPostsByVotes(
				query,
				page,
				limit
			);
			await redis.setJSON(cacheKey, result, 60);
			return NextResponse.json(result, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}
}
