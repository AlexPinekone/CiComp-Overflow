import { RedisCache } from '@/lib/redis';
import { Post } from '@/model/Post';
import { AdminService } from '@/service/AdminService';
import { PostService } from '@/service/PostService';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { NextRequest, NextResponse } from 'next/server';

export class AdminController {
	static async getAllPosts(req: NextRequest) {
		try {
			const redis = await RedisCache.getInstance();
			const cacheKey = redis.buildKey('admin', 'posts');

			if (await redis.exists(cacheKey)) {
				const cachedPosts = await redis.getJSON<any[]>(cacheKey);
				return NextResponse.json(cachedPosts, { status: 200 });
			}
			const posts = await PostService.getAllPosts({
				orderBy: 'createdAt',
			});
			await redis.setJSON(cacheKey, posts, 60);
			return NextResponse.json(posts, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getPostById(id: string) {
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid post ID' },
				{ status: 400 }
			);
		}

		try {
			const redis = await RedisCache.getInstance();
			const cacheKey = redis.buildKey('admin', 'post', id);
			if (await redis.exists(cacheKey)) {
				const cachedPost = await redis.getJSON<any>(cacheKey);
				return NextResponse.json(cachedPost, { status: 200 });
			}
			const post = await PostService.getPostById(id);
			if (!post)
				return NextResponse.json(
					{ error: 'Post not found' },
					{ status: 404 }
				);

			await redis.setJSON(cacheKey, post, 3600);
			return NextResponse.json(post, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getAllUsers() {
		try {
			const users = await AdminService.getAllUsers();
			return NextResponse.json(users, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getUserById(id: string) {
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid post ID' },
				{ status: 400 }
			);
		}

		try {
			const user = await AdminService.getUserById(id);
			if (!user)
				return NextResponse.json(
					{ error: 'User not found' },
					{ status: 404 }
				);
			return NextResponse.json(user, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async banProfileById(id: string) {
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid post ID' },
				{ status: 400 }
			);
		}

		try {
			const profile = await AdminService.banProfileById(id);
			if (!profile)
				return NextResponse.json(
					{ error: 'User not found' },
					{ status: 404 }
				);
			return NextResponse.json(profile, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async updatePost(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid post ID' },
				{ status: 400 }
			);
		}

		try {
			const { title, body, status, userId } = await req.json();
			const redis = RedisCache.getInstance();
			const cacheKey = (await redis).buildKey('admin', 'post', id);
			if (await (await redis).exists(cacheKey)) {
				await (await redis).del(cacheKey);
			}

			const originalPost = await PostService.getPostById(id);

			if (!originalPost) {
				return NextResponse.json(
					{ error: 'Post not found' },
					{ status: 404 }
				);
			}

			let finalStatus = status;
			if (userId !== originalPost.userId) {
				finalStatus = 'EDITED_BY_ADMIN';
			}

			const updatedPost = await PostService.updatePost({
				postId: id,
				title,
				body,
				status: finalStatus,
			} as Post);

			return NextResponse.json(updatedPost, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async deletePost(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid post ID' },
				{ status: 400 }
			);
		}

		try {
			await PostService.deletePost(id);
			return NextResponse.json(null, { status: 204 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getAllRequests() {
		try {
			const redis = await RedisCache.getInstance();
			const cacheKey = redis.buildKey('admin', 'requests');

			if (await redis.exists(cacheKey)) {
				const cachedRequests = await redis.getJSON<any[]>(cacheKey);
				return NextResponse.json(cachedRequests, { status: 200 });
			}

			const requests = await AdminService.getAllRequests();

			await redis.setJSON(cacheKey, requests, 60);

			return NextResponse.json(requests, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getRequestById(id: string) {
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid post ID' },
				{ status: 400 }
			);
		}

		try {
			const redis = await RedisCache.getInstance();
			const cacheKey = redis.buildKey('admin', 'request', id);
			if (await redis.exists(cacheKey)) {
				const cachedRequest = await redis.getJSON<any>(cacheKey);
				return NextResponse.json(cachedRequest, { status: 200 });
			}
			const request = await AdminService.getRequestById(id);
			await redis.setJSON(cacheKey, request, 3600);
			if (!request)
				return NextResponse.json(
					{ error: 'Post not found' },
					{ status: 404 }
				);
			return NextResponse.json(request, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async deleteRequest(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid post ID' },
				{ status: 400 }
			);
		}
		try {
			await AdminService.deleteRequest(id);
			return NextResponse.json(null, { status: 204 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}
}
