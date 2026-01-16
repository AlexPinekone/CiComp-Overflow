import Database from '@/database/Database';
import { Profile } from '@/model/Profile';

const pool = Database.getInstance();

export class ProfileDAO {
	static async getProfiles(): Promise<Profile[]> {
		const res = await pool.query(
			`SELECT * FROM "Profiles" WHERE "softDelete" = false`
		);
		return res.rows;
	}

	static async getProfileById(profileId: string): Promise<Profile | null> {
		const res = await pool.query(
			`SELECT * FROM "Profiles" WHERE "profileId" = $1 AND "softDelete" = false`,
			[profileId]
		);
		return res.rows[0] || null;
	}

	static async getProfileByUserId(userId: string): Promise<Profile | null> {
		const res = await pool.query(
			`SELECT * FROM "Profiles" WHERE "userId" = $1 AND "softDelete" = false`,
			[userId]
		);
		return res.rows[0] || null;
	}

	static async updateProfileStatus(
		profileId: string,
		status: string
	): Promise<Profile | null> {
		const text = `
      UPDATE "Profiles"
      SET status = $1
      WHERE "profileId" = $2
      RETURNING *;
    `;
		const values = [status, profileId];
		const res = await pool.query(text, values);
		return res.rows[0];
	}

	static async registerProfile(userId: any): Promise<Profile> {
		// Save the mandatory fields in the database
		const query = `
      INSERT INTO "Profiles" ("userId")
      VALUES ($1)
      RETURNING *;
    `;
		const values = [userId];
		const res = await pool.query(query, values);
		return res.rows[0];
	}

	static async updateProfile(params: {
		userId: string;
		userName?: string;
		description?: string;
		photo?: string;
	}): Promise<Profile | null> {
		const fields = [];
		const values = [];
		let index = 1;

		if (params.userName) {
			fields.push(`"userName" = $${index++}`);
			values.push(params.userName);
		}
		if (params.description) {
			fields.push(`"description" = $${index++}`);
			values.push(params.description);
		}
		if (params.photo) {
			fields.push(`"photo" = $${index++}`);
			values.push(params.photo);
		}

		if (fields.length === 0) {
			throw new Error('No fields to update');
		}

		values.push(params.userId);
		const query = `
			UPDATE "Profiles"
			SET ${fields.join(', ')}
			WHERE "userId" = $${index}
			RETURNING *;
		`;

		const res = await pool.query(query, values);
		return res.rows[0] || null;
	}

	static async getProfileByUserName(
		userName: string
	): Promise<Profile | null> {
		const res = await pool.query(
			`SELECT * FROM "Profiles" WHERE "userName" = $1 AND "softDelete" = false`,
			[userName]
		);
		return res.rows[0] || null;
	}
}
