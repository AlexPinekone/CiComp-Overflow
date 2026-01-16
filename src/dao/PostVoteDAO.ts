import Database from '@/database/Database';
import { Vote, VoteStatus } from '@/model/UserPostVote';

const pool = Database.getInstance();

export class PostVoteDAO {
	static async createPostVote(vote: Vote): Promise<Vote> {
		const existingVote = await pool.query(
			`
        SELECT "userId", "postId", status, "softDelete"
        FROM "UserPostVotes"
        WHERE "userId" = $1 AND "postId" = $2
      `,
			[vote.userId, vote.postId]
		);

		if (existingVote.rows.length > 0) {
			const existing = existingVote.rows[0];

			if (existing.softDelete) {
				const reactivateVote = await pool.query(
					`
            UPDATE "UserPostVotes"
            SET "softDelete" = false, "status" = $3, "updatedAt" = now()
            WHERE "userId" = $1 AND "postId" = $2
            RETURNING *;
          `,
					[vote.userId, vote.postId, vote.status]
				);
				return reactivateVote.rows[0];
			} else {
				const updateVote = await pool.query(
					`
            UPDATE "UserPostVotes"
            SET "status" = $3, "updatedAt" = now()
            WHERE "userId" = $1 AND "postId" = $2
            RETURNING *;
          `,
					[vote.userId, vote.postId, vote.status]
				);
				return updateVote.rows[0];
			}
		} else {
			const text = `
        INSERT INTO "UserPostVotes" ("userId", "postId", status)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;

			const newVote: Vote = await Database.session(async (client) => {
				const res = await client.query(text, [
					vote.userId,
					vote.postId,
					vote.status,
				]);
				return res.rows[0];
			});

			return newVote;
		}
	}

	static async updatePostVoteStatus(
		userId: string,
		postId: string,
		status: VoteStatus
	): Promise<Vote> {
		const res = await pool.query(
			`UPDATE "UserPostVotes"
			 SET status = $3, "updatedAt" = now(), "softDelete" = false
			 WHERE "userId" = $1 AND "postId" = $2
			 RETURNING *`,
			[userId, postId, status]
		);
		return res.rows[0];
	}

	static async deletePostVote(
		userId: string,
		postId: string
	): Promise<boolean> {
		const text = `
        UPDATE "UserPostVotes"
        SET "softDelete" = true
        WHERE "userId" = $1 AND "postId" = $2
        RETURNING *;
    `;

		const result = await Database.session(async (client) => {
			const res = await client.query(text, [userId, postId]);

			if (res.rowCount === 0) {
				throw new Error('No se encontró el voto para eliminar.');
			}

			return true;
		});

		return result;
	}

	static async changePostVote(
		userId: string,
		postId: string,
		newStatus: VoteStatus
	): Promise<boolean> {
		const text = `
        UPDATE "UserPostVotes"
        SET "status" = $3, "updatedAt" = now()
        WHERE "userId" = $1 AND "postId" = $2
        RETURNING *;
    `;

		const result = await Database.session(async (client) => {
			const res = await client.query(text, [userId, postId, newStatus]);

			if (res.rowCount === 0) {
				throw new Error('No se encontró el voto para cambiar.');
			}

			return true;
		});

		return result;
	}

	static async getPostVotes(postId: string): Promise<Vote[]> {
		const res = await pool.query(
			`
        SELECT
            "userId",
            "postId",
            status,
            "createdAt",
            "updatedAt",
            "softDelete"
        FROM "UserPostVotes"
        WHERE "postId" = $1 AND "softDelete" = false;
    `,
			[postId]
		);

		return res.rows;
	}

	static async getPostVotesById(
		postId: string,
		userId: string
	): Promise<Vote | null> {
		const res = await pool.query(
			`
        SELECT
            "userId",
            "postId",
            status,
            "createdAt",
            "updatedAt",
            "softDelete"
        FROM "UserPostVotes"
        WHERE "postId" = $1 AND "userId" = $2 AND "softDelete" = false;
    `,
			[postId, userId]
		);

		return res.rows[0] || null;
	}

	static async getAllVotesByPostId(postId: string): Promise<Vote[]> {
		const res = await pool.query(
			`SELECT * FROM "UserPostVotes" WHERE "postId" = $1`,
			[postId]
		);
		return res.rows;
	}

	static async countLastMonthVotes(): Promise<number> {
		const res = await pool.query(`
      SELECT COUNT(*) FROM "UserPostVotes"
      WHERE "softDelete" = false
	  AND "createdAt" >= NOW() - INTERVAL '1 month';
	  
    `);
		return parseInt(res.rows[0].count, 10);
	}
}
