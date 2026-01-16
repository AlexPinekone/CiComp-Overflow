import Database from '@/database/Database';
import { VoteStatus } from '@/model/UserPostVote';
import { Vote } from '@/model/UserCommentVote';

const pool = Database.getInstance();

export class CommentVoteDAO {
	static async createCommentVote(vote: Vote): Promise<Vote> {
		const existingVote = await pool.query(
			`
        SELECT "userId", "commentId", status, "softDelete"
        FROM "UserCommentVotes"
        WHERE "userId" = $1 AND "commentId" = $2
      `,
			[vote.userId, vote.commentId]
		);

		if (existingVote.rows.length > 0) {
			const existing = existingVote.rows[0];

			if (existing.softDelete) {
				const reactivateVote = await pool.query(
					`
            UPDATE "UserCommentVotes"
            SET "softDelete" = false, "status" = $3, "updatedAt" = now()
            WHERE "userId" = $1 AND "commentId" = $2
            RETURNING *;
          `,
					[vote.userId, vote.commentId, vote.status]
				);
				return reactivateVote.rows[0];
			} else {
				const updateVote = await pool.query(
					`
            UPDATE "UserCommentVotes"
            SET "status" = $3, "updatedAt" = now()
            WHERE "userId" = $1 AND "commentId" = $2
            RETURNING *;
          `,
					[vote.userId, vote.commentId, vote.status]
				);
				return updateVote.rows[0];
			}
		} else {
			const text = `
        INSERT INTO "UserCommentVotes" ("userId", "commentId", "postId", status)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;

			const newVote: Vote = await Database.session(async (client) => {
				const res = await client.query(text, [
					vote.userId,
					vote.commentId,
					vote.postId,
					vote.status,
				]);
				return res.rows[0];
			});

			return newVote;
		}
	}

	static async deleteCommentVote(
		userId: string,
		commentId: string
	): Promise<boolean> {
		const text = `
        UPDATE "UserCommentVotes"
        SET "softDelete" = true
        WHERE "userId" = $1 AND "commentId" = $2
        RETURNING *;
    `;

		const result = await Database.session(async (client) => {
			const res = await client.query(text, [userId, commentId]);

			if (res.rowCount === 0) {
				throw new Error('No se encontró el voto para eliminar.');
			}

			return true;
		});

		return result;
	}

	static async changeCommentVote(
		userId: string,
		commentId: string,
		newStatus: VoteStatus
	): Promise<boolean> {
		const text = `
        UPDATE "UserCommentVotes"
        SET "status" = $3, "updatedAt" = now()
        WHERE "userId" = $1 AND "commentId" = $2
        RETURNING *;
    `;

		const result = await Database.session(async (client) => {
			const res = await client.query(text, [
				userId,
				commentId,
				newStatus,
			]);

			if (res.rowCount === 0) {
				throw new Error('No se encontró el voto para cambiar.');
			}

			return true;
		});

		return result;
	}

	static async getCommentVotes(commentId: string): Promise<Vote[]> {
		const res = await pool.query(
			`
        SELECT
            "userId",
            "commentId",
            "postId",
            status,
            "createdAt",
            "updatedAt",
            "softDelete"
        FROM "UserCommentVotes"
        WHERE "commentId" = $1 AND "softDelete" = false;
    `,
			[commentId]
		);

		return res.rows;
	}

	static async getCommentVoteById(
		commentId: string,
		postId: string,
		userId: string
	): Promise<Vote | null> {
		const res = await pool.query(
			`SELECT * FROM "UserCommentVotes"
			 WHERE "commentId" = $1 AND "postId" = $2 AND "userId" = $3 AND "softDelete" = false`,
			[commentId, postId, userId]
		);

		return res.rows[0] || null;
	}
}
