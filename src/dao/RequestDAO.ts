import Database from '@/database/Database';
import { Request } from '@/model/Request';

const pool = Database.getInstance();

export class RequestDAO {
	static async createRequest(request: Request): Promise<Request> {
		const text = `
		INSERT INTO "Requests" ("userId", body, title, status, type, "referencePostId", "referenceCommentId", "referenceUserId")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING *;
	`;
		const values = [
			request.userId,
			request.body,
			request.title,
			request.status,
			request.type,
			request.referencePostId ?? null,
			request.referenceCommentId ?? null,
			request.referenceUserId ?? null,
		];

		const res = await pool.query(text, values);
		return res.rows[0];
	}

	static async getRequests(): Promise<Request[]> {
		const res = await pool.query(`SELECT * FROM "Requests"`);
		return res.rows;
	}

	static async getRequestById(requestId: string): Promise<Request | null> {
		const res = await pool.query(
			`SELECT * FROM "Requests" WHERE "requestId" = $1 AND "softDelete" = false`,
			[requestId]
		);
		return res.rows[0] || null;
	}

	static async deleteRequest(
		requestId: string,
		status: string
	): Promise<void> {
		await pool.query(
			`UPDATE "Requests" SET "softDelete" = true, status = $1  WHERE "requestId" = $2`,
			[status, requestId]
		);
	}

	static async updateRequestStatus(
		requestId: string,
		status: string
	): Promise<Request> {
		const text = `
      UPDATE "Requests"
      SET status = $1
      WHERE "requestId" = $2
      RETURNING *;
    `;
		const values = [status, requestId];

		const res = await pool.query(text, values);
		return res.rows[0];
	}

	static async countAllRequests(): Promise<number> {
		const res = await pool.query(`
      SELECT COUNT(*) FROM "Requests"
      WHERE "softDelete" = false;
    `);
		return parseInt(res.rows[0].count, 10);
	}

	static async getRequestsPaginated(
		type: string,
		page: number,
		limit: number
	): Promise<{ requests: Request[]; total: number }> {
		const offset = (page - 1) * limit;

		const res = await pool.query(
			`
			SELECT * FROM "Requests"
			WHERE type = $1
			ORDER BY "createdAt" DESC
			LIMIT $2 OFFSET $3
			`,
			[type, limit, offset]
		);

		const countRes = await pool.query(
			`
			SELECT COUNT(*) FROM "Requests"
			WHERE type = $1
			`,
			[type]
		);

		return {
			requests: res.rows,
			total: parseInt(countRes.rows[0].count, 10),
		};
	}
}
