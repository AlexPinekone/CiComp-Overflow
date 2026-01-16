import Database from '@/database/Database';

const pool = Database.getInstance();
export class AccountDAO {
	static async getAccountByMail({ mail }: any) {
		const query = `
      SELECT *
      FROM "Accounts"
      WHERE mail = $1
    `;
		const values = [mail];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}

	static async registerAccount(account: any) {
		const query = `
      INSERT INTO "Accounts" ("userId", password, mail)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
		const values = [account.userId, account.password, account.mail];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}
}
