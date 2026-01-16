import Database from '@/database/Database';
const pool = Database.getInstance();

export class SessionDAO {
	static async getSessionByUserId(userId: string) {
		const query = `
            SELECT * FROM "Sessions"
            WHERE "userId" = $1 AND "softDelete" = false
            LIMIT 1;
        `;
		const values = [userId];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}

	static async createSession({
		userId,
		sessionStatus,
	}: {
		userId: string;
		sessionStatus: string;
	}) {
		const query = `
            INSERT INTO "Sessions" ("userId", "loginAttempts", "sessionStatus")
            VALUES ($1, 1, $2)
            RETURNING *;
        `;
		const values = [userId, sessionStatus];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}

	static async updateSession({
		userId,
		sessionStatus,
	}: {
		userId: string;
		sessionStatus: string;
	}) {
		const query = `
            UPDATE "Sessions"
            SET "updatedAt" = now(), "loginAttempts" = "loginAttempts", "sessionStatus" = $2
            WHERE "userId" = $1 AND "softDelete" = false
            RETURNING *;
        `;
		const values = [userId, sessionStatus];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}

	static async upsertSession({
		userId,
		sessionStatus,
	}: {
		userId: string;
		sessionStatus: string;
	}) {
		const session = await this.getSessionByUserId(userId);
		if (session) {
			return await this.updateSession({ userId, sessionStatus });
		} else {
			return await this.createSession({ userId, sessionStatus });
		}
	}
}
