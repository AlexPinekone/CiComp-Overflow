'server only';
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

class Database {
	private static instance: Pool;

	private constructor() {}

	public static getInstance(): Pool {
		if (!Database.instance) {
			dotenv.config();

			Database.instance = new Pool({
				connectionString: process.env.DATABASE_URI,
			});
		}
		return Database.instance;
	}

	public static async close() {
		await Database.instance.end();
	}

	public static async startSession(): Promise<PoolClient> {
		const client = await Database.getInstance().connect();
		await client.query('BEGIN');
		return client;
	}

	public static async session(
		transaction: (client: PoolClient) => Promise<any>
	) {
		const client = await Database.startSession();
		try {
			const response = await transaction(client);
			await Database.commit(client);
			return response;
		} catch (error) {
			await Database.rollback(client);
			throw error;
		} finally {
			await Database.stopSession(client);
		}
	}

	public static async commit(client: PoolClient) {
		await client.query('COMMIT');
	}

	public static async rollback(client: PoolClient) {
		await client.query('ROLLBACK');
	}

	public static async stopSession(client: PoolClient) {
		await client.release();
	}
}

export default Database;
