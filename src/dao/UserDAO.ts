import Database from '@/database/Database';
import { User } from '@/model/User';

const pool = Database.getInstance();

export class UserDAO {
	static async getUsers(): Promise<User[]> {
		const res = await pool.query(
			'SELECT * FROM "Users" WHERE "softDelete" = false'
		);
		return res.rows;
	}

	static async getUserById(userId: string): Promise<User | null> {
		const res = await pool.query(
			`SELECT * FROM "Users" WHERE "userId" = $1 AND "softDelete" = false`,
			[userId]
		);
		return res.rows[0] || null;
	}

	static async deleteUser(userId: string): Promise<void> {
		await pool.query(
			`UPDATE "Users" SET "softDelete" = true WHERE "userId" = $1`,
			[userId]
		);
	}
	static async registerUser({ name, lastName, role }: any): Promise<User> {
		const text = `
		  INSERT INTO "Users" (name, "lastName", role)
		  VALUES ($1, $2, $3)
		  RETURNING *;
		`;
		const values = [name, lastName, role];
		const res = await pool.query(text, values);
		return res.rows[0];
	}

	static async getUserPostsById(id: string) {
		const res = await pool.query(
			`SELECT * FROM "Posts" WHERE "userId" = $1 AND "softDelete" = false`,
			[id]
		);
		return res.rows;
	}

	static async getUserPostsByIdPaginated(
		userId: string,
		orderBy: 'newest' | 'oldest',
		page: number,
		limit: number
	) {
		const offset = (page - 1) * limit;
		const orderByClause =
			orderBy === 'newest' ? `"createdAt" DESC` : `"createdAt" ASC`;

		const res = await pool.query(
			`
			SELECT *
			FROM "Posts"
			WHERE "userId" = $1
			AND "softDelete" = false
			ORDER BY ${orderByClause}
			LIMIT $2 OFFSET $3
		`,
			[userId, limit, offset]
		);

		const totalRes = await pool.query(
			`
			SELECT COUNT(*) as total
			FROM "Posts"
			WHERE "userId" = $1
			AND "softDelete" = false
		`,
			[userId]
		);

		const total = parseInt(totalRes.rows[0].total, 10);

		return {
			posts: res.rows,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	static async countActiveUsers(): Promise<number> {
		const res = await pool.query(`
		SELECT COUNT(DISTINCT "userId") AS count
		FROM "Sessions"
		WHERE "softDelete" = false
		AND "createdAt" >= NOW() - INTERVAL '1 month';
	`);
		return parseInt(res.rows[0].count, 10);
	}
}
