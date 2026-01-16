import { PostService } from '@/service/PostService';
import { PostDAO } from '@/dao/PostDAO';
import { TagDAO } from '@/dao/TagDAO';
import { Post } from '@/model/Post';
import CloudinaryService from '@/service/CloudinaryService';

jest.mock('@/dao/PostDAO');
jest.mock('@/dao/TagDAO');
jest.mock('@/service/CloudinaryService');

describe('PostService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAllPosts', () => {
		it('should return all posts with default ordering', async () => {
			const mockPosts: Post[] = [
				{
					postId: '1',
					title: 'Post 1',
					body: 'Body 1',
					userId: 'user1',
					tags: ['Algoritmos y Complejidad'],
				},
				{
					postId: '2',
					title: 'Post 2',
					body: 'Body 2',
					userId: 'user2',
					tags: ['Herramientas de Software'],
				},
			];

			(PostDAO.getPosts as jest.Mock).mockResolvedValue(mockPosts);

			const result = await PostService.getAllPosts({ orderBy: 'newest' });

			expect(PostDAO.getPosts).toHaveBeenCalledWith({
				orderBy: 'newest',
				tag: null,
				startDate: expect.any(Date),
				endDate: expect.any(Date),
				page: 1,
				limit: 10,
			});
			expect(result).toEqual(mockPosts);
			expect(result).toHaveLength(2);
		});

		it('should return posts filtered by tag', async () => {
			const mockPosts: Post[] = [
				{
					postId: '1',
					title: 'JS Post',
					body: 'Body',
					userId: 'user1',
					tags: ['Algoritmos y Complejidad'],
				},
			];

			(PostDAO.getPosts as jest.Mock).mockResolvedValue({
				posts: mockPosts,
				total: 1,
				page: 1,
				limit: 10,
				totalPages: 1,
			});

			const result = await PostService.getAllPosts({
				orderBy: 'newest',
				tag: 'Algoritmos y Complejidad',
			});

			expect(PostDAO.getPosts).toHaveBeenCalledWith({
				orderBy: 'newest',
				tag: 'Algoritmos y Complejidad',
				startDate: expect.any(Date),
				endDate: expect.any(Date),
				page: 1,
				limit: 10,
			});

			expect(result.posts).toHaveLength(1);
			expect(result.posts[0].tags).toContain('Algoritmos y Complejidad');
			expect(result.total).toBe(1);
			expect(result.page).toBe(1);
		});
		it('should return posts ordered by votes', async () => {
			const mockPosts: Post[] = [
				{
					postId: '1',
					title: 'Popular Post',
					body: 'Body',
					userId: 'user1',
					tags: [],
				},
			];

			(PostDAO.getPosts as jest.Mock).mockResolvedValue(mockPosts);

			await PostService.getAllPosts({ orderBy: 'votes' });

			expect(PostDAO.getPosts).toHaveBeenCalledWith({
				orderBy: 'votes',
				tag: null,
				startDate: expect.any(Date),
				endDate: expect.any(Date),
				page: 1,
				limit: 10,
			});
		});

		it('should return empty array when no posts', async () => {
			(PostDAO.getPosts as jest.Mock).mockResolvedValue([]);

			const result = await PostService.getAllPosts({ orderBy: 'newest' });

			expect(result).toEqual([]);
		});
	});

	describe('getPostById', () => {
		it('should return post when found', async () => {
			const mockPost: Post = {
				postId: '1',
				title: 'Test Post',
				body: 'Test Body',
				userId: 'user1',
				tags: ['Algoritmos y Complejidad'],
			};

			(PostDAO.getPostById as jest.Mock).mockResolvedValue(mockPost);

			const result = await PostService.getPostById('1');

			expect(PostDAO.getPostById).toHaveBeenCalledWith('1');
			expect(result).toEqual(mockPost);
		});

		it('should return null when post not found', async () => {
			(PostDAO.getPostById as jest.Mock).mockResolvedValue(null);

			const result = await PostService.getPostById('nonexistent');

			expect(result).toBeNull();
		});
	});

	describe('createPost', () => {
		it('should create post without image', async () => {
			const postData = {
				title: 'New Post',
				body: 'New Body',
				userId: 'user1',
				tags: ['Algoritmos y Complejidad', 'Herramientas de Software'],
			};

			const mockCreatedPost = {
				postId: '1',
				...postData,
				createdAt: new Date(),
			};

			(PostDAO.createPost as jest.Mock).mockResolvedValue(
				mockCreatedPost
			);

			const result = await PostService.createPost(postData);

			expect(PostDAO.createPost).toHaveBeenCalledWith(postData);
			expect(result).toEqual(mockCreatedPost);
		});

		it('should create post with image', async () => {
			const mockImage = {
				size: 1024,
				type: 'image/png',
			};

			const postData = {
				title: 'Post with Image',
				body: '<img src="temp.jpg" />',
				userId: 'user1',
				tags: ['Algoritmos y Complejidad'],
				image: mockImage,
			};

			const mockCreatedPost = {
				postId: '1',
				title: postData.title,
				body: postData.body,
				userId: postData.userId,
			};

			const mockUpdatedPost = {
				...mockCreatedPost,
				body: '<img src="https://cloudinary.com/image.jpg" />',
			};

			(PostDAO.createPost as jest.Mock).mockResolvedValue(
				mockCreatedPost
			);
			(CloudinaryService.uploadImage as jest.Mock).mockResolvedValue({
				secure_url: 'https://cloudinary.com/image.jpg',
			});
			(PostDAO.updatePost as jest.Mock).mockResolvedValue(
				mockUpdatedPost
			);

			const result = await PostService.createPost(postData);

			expect(CloudinaryService.uploadImage).toHaveBeenCalledWith(
				mockImage,
				{
					folder: 'posts',
					public_id: '1',
					overwrite: true,
				}
			);
			expect(PostDAO.updatePost).toHaveBeenCalled();
			expect(result.body).toContain('https://cloudinary.com/image.jpg');
		});

		it('should create post with tags', async () => {
			const postData = {
				title: 'Tagged Post',
				body: 'Body',
				userId: 'user1',
				tags: ['Algoritmos y Complejidad', 'Herramientas de Software'],
			};

			const mockCreatedPost = {
				postId: '1',
				...postData,
			};

			(PostDAO.createPost as jest.Mock).mockResolvedValue(
				mockCreatedPost
			);

			const result = await PostService.createPost(postData);

			expect(result).toEqual(mockCreatedPost);
		});
	});

	describe('updatePost', () => {
		it('should update post without image', async () => {
			const updateData = {
				postId: '1',
				title: 'Updated Title',
				body: 'Updated Body',
				userId: 'user1',
			};

			const mockUpdatedPost = {
				...updateData,
				updatedAt: new Date(),
			};

			(TagDAO.deleteAllTags as jest.Mock).mockResolvedValue(true);
			(PostDAO.updatePost as jest.Mock).mockResolvedValue(
				mockUpdatedPost
			);

			const result = await PostService.updatePost(updateData);

			expect(PostDAO.updatePost).toHaveBeenCalled();
			expect(result.title).toBe('Updated Title');
		});

		it('should update post with new image', async () => {
			const mockImage = { size: 2048 };
			const updateData = {
				postId: '1',
				title: 'Updated',
				body: '<img src="old.jpg" />',
				image: mockImage,
			};

			(CloudinaryService.uploadImage as jest.Mock).mockResolvedValue({
				secure_url: 'https://cloudinary.com/new.jpg',
			});
			(PostDAO.updatePost as jest.Mock).mockResolvedValue({
				...updateData,
				body: '<img src="https://cloudinary.com/new.jpg" />',
			});

			const result = await PostService.updatePost(updateData);

			expect(CloudinaryService.uploadImage).toHaveBeenCalled();
			expect(result.body).toContain('https://cloudinary.com/new.jpg');
		});

		it('should update post tags', async () => {
			const updateData = {
				postId: '1',
				title: 'Post',
				body: 'Body',
				tags: ['NewTag1', 'NewTag2'],
			};

			(TagDAO.deleteAllTags as jest.Mock).mockResolvedValue(true);
			(TagDAO.createTag as jest.Mock).mockResolvedValue(true);
			(PostDAO.updatePost as jest.Mock).mockResolvedValue(updateData);

			await PostService.updatePost(updateData);

			expect(TagDAO.deleteAllTags).toHaveBeenCalledWith('1');
			expect(TagDAO.createTag).toHaveBeenCalledTimes(2);
		});
	});

	describe('deletePost', () => {
		it('should delete post successfully', async () => {
			const mockDeleteResult = { userId: 'user1' };

			(PostDAO.deletePost as jest.Mock).mockResolvedValue(
				mockDeleteResult
			);

			const result = await PostService.deletePost('1');

			expect(PostDAO.deletePost).toHaveBeenCalledWith('1');
			expect(result).toEqual(mockDeleteResult);
		});

		it('should propagate error when post not found', async () => {
			(PostDAO.deletePost as jest.Mock).mockRejectedValue(
				new Error('Post not found')
			);

			await expect(PostService.deletePost('nonexistent')).rejects.toThrow(
				'Post not found'
			);
		});
	});

	describe('countAllPosts', () => {
		it('should return total count of posts', async () => {
			(PostDAO.countAllPosts as jest.Mock).mockResolvedValue(42);

			const result = await PostService.countAllPosts();

			expect(PostDAO.countAllPosts).toHaveBeenCalled();
			expect(result).toBe(42);
		});

		it('should return 0 when no posts', async () => {
			(PostDAO.countAllPosts as jest.Mock).mockResolvedValue(0);

			const result = await PostService.countAllPosts();

			expect(result).toBe(0);
		});
	});

	describe('countPostsLastMonth', () => {
		it('should return count of posts from last month', async () => {
			(PostDAO.countPostsLastMonth as jest.Mock).mockResolvedValue(15);

			const result = await PostService.countPostsLastMonth();

			expect(PostDAO.countPostsLastMonth).toHaveBeenCalled();
			expect(result).toBe(15);
		});
	});

	describe('searchPosts', () => {
		it('should search posts with pagination', async () => {
			const mockSearchResult = {
				posts: [
					{
						postId: '1',
						title: 'Search Result',
						body: 'Body',
						userId: 'user1',
					},
				],
				total: 1,
				page: 1,
				limit: 10,
			};

			(PostDAO.searchPostsPaginated as jest.Mock).mockResolvedValue(
				mockSearchResult
			);

			const result = await PostService.searchPosts(
				'test',
				'newest',
				1,
				10
			);

			expect(PostDAO.searchPostsPaginated).toHaveBeenCalledWith(
				'test',
				'newest',
				1,
				10
			);
			expect(result).toEqual(mockSearchResult);
		});
	});

	describe('searchPostsByVotes', () => {
		it('should search posts ordered by votes', async () => {
			const mockSearchResult = {
				posts: [
					{
						postId: '1',
						title: 'Popular Post',
						body: 'Body',
						userId: 'user1',
					},
				],
				total: 1,
				page: 1,
				limit: 10,
			};

			(
				PostDAO.searchPostsByVotesPaginated as jest.Mock
			).mockResolvedValue(mockSearchResult);

			const result = await PostService.searchPostsByVotes('test', 1, 10);

			expect(PostDAO.searchPostsByVotesPaginated).toHaveBeenCalledWith(
				'test',
				1,
				10
			);
			expect(result).toEqual(mockSearchResult);
		});
	});
});
