import Database from '@/database/Database';
import { Comment } from '@/model/Comment'; // Asumo que existe esta interfaz/modelo

const pool = Database.getInstance();

export class CommentDAO {
	static async createComment(
		comment: Comment & { userId: string }
	): Promise<Comment> {
		const text = `
            INSERT INTO "Comments" (body, "postId", "userId")
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
		const values = [comment.body, comment.postId, comment.userId];
		const res = await pool.query(text, values);
		return res.rows[0];
	}

	static async getCommentsByPostId(postId: string): Promise<any[]> {
		const res = await pool.query(
			`
			SELECT 
				c.*,
				u.name || ' ' || u."lastName" AS "authorName",
				p.photo AS "authorAvatar",
				COALESCE(
					JSON_AGG(
						CASE 
							WHEN v."commentId" IS NOT NULL THEN
								JSON_BUILD_OBJECT(
									'userId', v."userId",
									'status', v.status,
									'softDelete', v."softDelete"
								)
							ELSE NULL
						END
					) FILTER (WHERE v."commentId" IS NOT NULL),
					'[]'
				) AS votes
			FROM "Comments" c
			LEFT JOIN "UserCommentVotes" v ON c."commentId" = v."commentId"
			LEFT JOIN "Users" u ON c."userId" = u."userId"
			LEFT JOIN "Profiles" p ON c."userId" = p."userId"
			WHERE c."postId" = $1 AND c."softDelete" = false
			GROUP BY c."commentId", u.name, u."lastName", p.photo
			ORDER BY c."createdAt" DESC
		`,
			[postId]
		);

		return res.rows.map((row) => {
			let parsedVotes: any[] = [];

			if (Array.isArray(row.votes)) {
				parsedVotes = row.votes;
			} else if (typeof row.votes === 'string') {
				try {
					parsedVotes = JSON.parse(row.votes);
				} catch {
					parsedVotes = [];
				}
			}

			return {
				...row,
				votes: parsedVotes ?? [],
			};
		});
	}

	static async getCommentById(commentId: string): Promise<Comment | null> {
		const res = await pool.query(
			'SELECT * FROM "Comments" WHERE "commentId" = $1 AND "softDelete" = false',
			[commentId]
		);
		return res.rows[0] || null;
	}

	static async updateComment(comment: Comment): Promise<Comment> {
		const text = `
            UPDATE "Comments"
            SET 
                body = $1,
                "updatedAt" = NOW()
            WHERE "commentId" = $2
            RETURNING *;
        `;
		const values = [comment.body, comment.commentId];
		const res = await pool.query(text, values);
		return res.rows[0];
	}

	static async deleteComment(commentId: string): Promise<{ userId: string }> {
		const result = await pool.query(
			`UPDATE "Comments" SET "softDelete" = true WHERE "commentId" = $1 RETURNING "userId"`,
			[commentId]
		);

		if (result.rows.length === 0) {
			throw new Error('Comment not found');
		}

		return { userId: result.rows[0].userId };
	}

	static async deleteAllComments(postId: string): Promise<void> {
		await pool.query(
			`UPDATE "Comments" SET "softDelete" = true WHERE "postId" = $1`,
			[postId]
		);
	}

	static async countLastMonthComments(): Promise<number> {
		const res = await pool.query(`
      SELECT COUNT(*) FROM "Comments"
      WHERE "softDelete" = false
	  AND "createdAt" >= NOW() - INTERVAL '1 month';
	  
    `);
		return parseInt(res.rows[0].count, 10);
	}
}
