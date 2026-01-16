import { PostDateFilter } from '@/constants/post';
import { PostDAO } from '@/dao/PostDAO';
import { TagDAO } from '@/dao/TagDAO';
import { PostUtils } from '@/utils/PostUtils';
import CloudinaryService from '@/service/CloudinaryService';

export class PostService {
	static async getAllPosts({
		orderBy,
		tag = null,
		publishedDate = null,
		page = 1,
		limit = 10,
	}: {
		orderBy: string;
		tag?: string | null;
		publishedDate?: PostDateFilter | null;
		page?: number;
		limit?: number;
	}) {
		const [startDate, endDate] = PostUtils.getDateFilterRange(
			publishedDate as PostDateFilter
		);
		return await PostDAO.getPosts({
			orderBy,
			tag,
			startDate,
			endDate,
			page,
			limit,
		});
	}

	static async getPostById(id: string) {
		return await PostDAO.getPostById(id);
	}

	static async createPost(postData: any) {
		let newPost: any = await PostDAO.createPost(postData);
		if (newPost && postData?.image && postData.image?.size > 0) {
			const result = await CloudinaryService.uploadImage(postData.image, {
				folder: 'posts',
				public_id: newPost.postId,
				overwrite: true,
			});
			const urlPhoto = result.secure_url;
			const bodyWithImage = newPost.body.replace(
				/(<img[^>]+src=")[^">]+(")/,
				`$1${urlPhoto}$2`
			);
			newPost = await PostDAO.updatePost({
				...newPost,
				body: bodyWithImage,
			});
		}

		return newPost;
	}

	static async updatePost(postData: any) {
		let body = postData.body;
		const { image, tags, userId, ...data } = postData;
		if (image && image.size > 0) {
			const result = await CloudinaryService.uploadImage(image, {
				folder: 'posts',
				public_id: postData.postId,
				overwrite: true,
			});
			const urlPhoto = result.secure_url;
			body = body.replace(/(<img[^>]+src=")[^">]+(")/, `$1${urlPhoto}$2`);
		}

		if (tags) {
			await Promise.all([
				await TagDAO.deleteAllTags(postData.postId),
				tags.map(async (tag: string) => {
					await TagDAO.createTag(tag, postData.postId);
				}),
			]);
		}

		return await PostDAO.updatePost({ ...data, body });
	}

	static async deletePost(postId: string) {
		return await PostDAO.deletePost(postId);
	}

	static async countAllPosts() {
		return await PostDAO.countAllPosts();
	}

	static async countPostsLastMonth() {
		return await PostDAO.countPostsLastMonth();
	}

	static async searchPosts(
		query: string,
		orderBy: string,
		page: number,
		limit: number
	) {
		return await PostDAO.searchPostsPaginated(query, orderBy, page, limit);
	}

	static async searchPostsByVotes(
		query: string,
		page: number,
		limit: number
	) {
		return await PostDAO.searchPostsByVotesPaginated(query, page, limit);
	}
}
