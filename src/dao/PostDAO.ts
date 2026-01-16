import Database from '@/database/Database';
import { Post } from '@/model/Post';
import { TagDAO } from './TagDAO';
import { PostQueryBuilder } from '@/utils/PostQueryBuilder';
import { PostOrderKey } from '@/constants/post';

const pool = Database.getInstance();
export class PostDAO {
	static async createPost(post: any): Promise<Post> {
		const text = `
		INSERT INTO "Posts" (title, body, "userId")
		VALUES ($1, $2, $3)
		RETURNING *;
	`;
		const newPost = await Database.session(async (client) => {
			const res = await client.query(text, [
				post.title,
				post.body,
				post.userId,
			]);

			return res.rows[0];
		});
		const tags = post?.tags;
		if (tags) {
			await Promise.all(
				tags.map(async (tag: string) => {
					await TagDAO.createTag(tag, newPost.postId);
				})
			);
		} else {
			throw new Error('Tags not found');
		}

		return newPost;
	}

	/* Obtener Posts sin ordenar
	static async getPosts(): Promise<Post[]> {
		const res = await pool.query(`
			SELECT 
				p.*, 
				array_agg(DISTINCT t.name) as tags,
				COALESCE(SUM(CASE 
					WHEN upv.status = 'UPVOTE' THEN 1
					WHEN upv.status = 'DOWNVOTE' THEN -1
					ELSE 0 END), 0) as voteCount
			FROM "Posts" p
			LEFT JOIN "UserPostVotes" upv ON upv."postId" = p."postId" AND upv."softDelete" = false
			LEFT JOIN "PostHasTags" pt ON p."postId" = pt."postId" AND pt."softDelete" = false
			LEFT JOIN "PostTags" t ON pt."postTagId" = t."postTagId"
			WHERE p."softDelete" = false
			GROUP BY p."postId"
		`);
		return res.rows;
	}
		*/

	static async getPostById(postId: string): Promise<Post | null> {
		const res = await pool.query(
			`SELECT p.*, array_agg(t.name) as tags, pr."userName"
			FROM "Posts" p
			LEFT JOIN "PostHasTags" pt ON p."postId" = pt."postId" AND pt."softDelete" = false
			LEFT JOIN "PostTags" t ON pt."postTagId" = t."postTagId"
			LEFT JOIN "Profiles" pr ON p."userId" = pr."userId"
			WHERE p."softDelete" = false 
			AND p."postId" = $1
			GROUP BY p."postId", pr."userName"`,
			[postId]
		);
		return res.rows[0] || null;
	}

	static async getPosts({
		orderBy,
		tag,
		startDate,
		endDate,
		page = 1,
		limit = 10,
	}: {
		orderBy: string;
		tag?: string | null;
		startDate?: Date | null;
		endDate?: Date | null;
		page?: number;
		limit?: number;
	}): Promise<{
		posts: Post[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}> {
		const offset = (page - 1) * limit;

		const postQueryBuilder = new PostQueryBuilder()
			.onlyActive()
			.setOrderBy(orderBy as PostOrderKey);

		if (startDate) postQueryBuilder.startDate(startDate);
		if (endDate) postQueryBuilder.endDate(endDate);
		if (tag) postQueryBuilder.tag(tag);

		// Build query with pagination
		const { sql, params } = postQueryBuilder.build();
		const paginatedSql = `${sql} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
		const paginatedParams = [...params, limit, offset];

		const res = await pool.query(paginatedSql, paginatedParams);

		// Get total count for pagination metadata - use a simpler count query
		let countQuery = `
			SELECT COUNT(*) as count
			FROM "Posts" p
			WHERE p."softDelete" = false
		`;
		let countParams: any[] = [];

		// Add date filters
		if (startDate) {
			countQuery += ` AND p."createdAt" >= $${countParams.length + 1}`;
			countParams.push(startDate);
		}
		if (endDate) {
			countQuery += ` AND p."createdAt" <= $${countParams.length + 1}`;
			countParams.push(endDate);
		}

		// Add tag filter
		if (tag) {
			countQuery += ` AND EXISTS (
				SELECT 1
				FROM "PostHasTags" pht
				JOIN "PostTags" t ON t."postTagId" = pht."postTagId"
				WHERE pht."postId" = p."postId"
				  AND pht."softDelete" = false
				  AND t.name = $${countParams.length + 1}
			)`;
			countParams.push(tag);
		}

		const countRes = await pool.query(countQuery, countParams);
		const total = parseInt(countRes.rows[0].count, 10);

		return {
			posts: res.rows,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	static async updatePost(post: any): Promise<Post> {
		const { postId, ...fields } = post;

		const keys = Object.entries(fields)
			.filter(([, value]) => Boolean(value))
			.map(([key], index) => {
				return `"${key}" = $${index + 1}`;
			});

		const values = Object.values(fields).filter((value) => Boolean(value));

		const text = `UPDATE "Posts" SET ${keys.join(', ')} WHERE "postId" = '${postId}' RETURNING *;`;

		const res = await pool.query(text, values);
		return res.rows[0];
	}

	static async deletePost(postId: string): Promise<{ userId: string }> {
		const result = await pool.query(
			`UPDATE "Posts" SET "softDelete" = true WHERE "postId" = $1 RETURNING "userId"`,
			[postId]
		);

		if (result.rows.length === 0) {
			throw new Error('Post not found');
		}

		return { userId: result.rows[0].userId };
	}

	static async searchPosts(term: string | null): Promise<any[]> {
		const query = `
			SELECT DISTINCT p.*, array_agg(pt.name) AS tags
			FROM "Posts" p
			LEFT JOIN "PostHasTags" pht ON p."postId" = pht."postId"
			LEFT JOIN "PostTags" pt ON pht."postTagId" = pt."postTagId"
			WHERE 
				(p.title ILIKE $1 OR $1 IS NULL) OR
				(p.body ILIKE $1 OR $1 IS NULL) OR
				(pt.name ILIKE $1 OR $1 IS NULL) 
				AND p."softDelete" = false
			GROUP BY p."postId";
		`;

		const searchTerm = term ? `%${term}%` : null;

		try {
			const result = await pool.query(query, [searchTerm]);
			return result.rows;
		} catch (error) {
			console.error('Error searching the posts', error);
			return [];
		}
	}

	static async searchPostsPaginated(
		query: string,
		orderBy: string,
		page: number,
		limit: number
	): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
		const offset = (page - 1) * limit;

		const orderByClause =
			orderBy === 'oldest' ? `p."createdAt" ASC` : `p."createdAt" DESC`;

		// Filtro en SQL (ILIKE = case insensitive en Postgres)
		const res = await pool.query(
			`
		SELECT p.*, array_agg(DISTINCT t.name) as tags, pr."userName"
		FROM "Posts" p
		LEFT JOIN "PostHasTags" pt ON p."postId" = pt."postId" AND pt."softDelete" = false
		LEFT JOIN "PostTags" t ON pt."postTagId" = t."postTagId"
		LEFT JOIN "Profiles" pr ON p."userId" = pr."userId"
		WHERE p."softDelete" = false
		AND (
			LOWER(p.title) ILIKE $1
			OR LOWER(p.body) ILIKE $1
			OR EXISTS (
				SELECT 1 FROM "PostTags" t2
				JOIN "PostHasTags" pt2 ON pt2."postTagId" = t2."postTagId"
				WHERE pt2."postId" = p."postId" AND LOWER(t2.name) ILIKE $1
			)
		)
		GROUP BY p."postId", pr."userName"
		ORDER BY ${orderByClause}
		LIMIT $2 OFFSET $3
		`,
			[`%${query}%`, limit, offset]
		);

		// Total
		const totalRes = await pool.query(
			`
			SELECT COUNT(*) as total
			FROM "Posts" p
			WHERE p."softDelete" = false
			AND (
				LOWER(p.title) ILIKE $1
				OR LOWER(p.body) ILIKE $1
			)
		`,
			[`%${query}%`]
		);

		return {
			posts: res.rows,
			total: parseInt(totalRes.rows[0].total, 10),
			page,
			limit,
		};
	}

	//Post ordenados por votos
	static async searchPostsByVotesPaginated(
		query: string,
		page: number,
		limit: number
	) {
		const offset = (page - 1) * limit;

		const res = await pool.query(
			`
		WITH vote_agg AS (
			SELECT "postId",
					COALESCE(SUM(
					CASE 
						WHEN status = 'UPVOTE' THEN 1
						WHEN status = 'DOWNVOTE' THEN -1
						ELSE 0
					END
					), 0) as voteCount
			FROM "UserPostVotes"
			WHERE "softDelete" = false
			GROUP BY "postId"
		)
		SELECT p.*, array_agg(DISTINCT t.name) as tags, pr."userName", COALESCE(v.voteCount, 0) as "voteCount"
		FROM "Posts" p
		LEFT JOIN vote_agg v ON v."postId" = p."postId"
		LEFT JOIN "PostHasTags" pt ON p."postId" = pt."postId" AND pt."softDelete" = false
		LEFT JOIN "PostTags" t ON pt."postTagId" = t."postTagId"
		LEFT JOIN "Profiles" pr ON p."userId" = pr."userId"
		WHERE p."softDelete" = false
		AND (
			LOWER(p.title) ILIKE $1
			OR LOWER(p.body) ILIKE $1
			OR EXISTS (
				SELECT 1 FROM "PostTags" t2
				JOIN "PostHasTags" pt2 ON pt2."postTagId" = t2."postTagId"
				WHERE pt2."postId" = p."postId" AND LOWER(t2.name) ILIKE $1
			)
		)
		GROUP BY p."postId", pr."userName", v.voteCount
		ORDER BY "voteCount" DESC
		LIMIT $2 OFFSET $3
		`,
			[`%${query}%`, limit, offset]
		);

		const totalRes = await pool.query(
			`
		SELECT COUNT(*) as total
		FROM "Posts" p
		WHERE p."softDelete" = false
		AND (
			LOWER(p.title) ILIKE $1
			OR LOWER(p.body) ILIKE $1
		)
		`,
			[`%${query}%`]
		);

		return {
			posts: res.rows,
			total: parseInt(totalRes.rows[0].total, 10),
			page,
			limit,
		};
	}

	static async countAllPosts(): Promise<number> {
		const res = await pool.query(`
		SELECT COUNT(*) FROM "Posts"
		WHERE "softDelete" = false;
		`);
		return parseInt(res.rows[0].count, 10);
	}

	static async countPostsLastMonth(): Promise<number> {
		const res = await pool.query(`
			SELECT COUNT(*) FROM "Posts"
			WHERE "softDelete" = false
			AND "createdAt" >= NOW() - INTERVAL '1 month';
		`);
		return parseInt(res.rows[0].count, 10);
	}
}
