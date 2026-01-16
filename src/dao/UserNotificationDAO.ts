import { UserNotification } from '@/model/UserNotification';
import Database from '@/database/Database';
import { PoolClient } from 'pg';

const pool = Database.getInstance();

export class UserNotificationDAO {
	static async getAllNotificationsByUserId(
		userId: string
	): Promise<UserNotification[]> {
		const query = `
			SELECT * FROM "UserNotifications"
			WHERE "userId" = $1 AND "softDelete" = false
			ORDER BY "createdAt" DESC
		`;
		const result = await pool.query(query, [userId]);
		return result.rows;
	}

	static async getNotificationById(
		notificationId: string
	): Promise<UserNotification | null> {
		const query = `
			SELECT * FROM "UserNotifications"
			WHERE "userNotificationId" = $1 AND "softDelete" = false
		`;
		const result = await pool.query(query, [notificationId]);
		return result.rows[0] ?? null;
	}

	static async createNotification(
		userId: string,
		type: 'ANSWER' | 'EDIT' | 'LIKE' | 'DELETE' | 'REQUEST',
		referenceId: string,
		createdByUserId: string
	): Promise<UserNotification> {
		const query = `
        INSERT INTO "UserNotifications" ("userId", "type", "referenceId", "status", "createdByUserId")
        VALUES ($1, $2, $3, 'UNREAD', $4)
        RETURNING *
    `;
		const result = await pool.query(query, [
			userId,
			type,
			referenceId,
			createdByUserId,
		]); // Incluir createdByUserId en la consulta
		return result.rows[0];
	}

	static async markAsRead(
		notificationId: string
	): Promise<UserNotification | null> {
		const query = `
			UPDATE "UserNotifications"
			SET "status" = 'READ', "updatedAt" = NOW()
			WHERE "userNotificationId" = $1 AND "softDelete" = false
			RETURNING *
		`;
		const result = await pool.query(query, [notificationId]);
		return result.rows[0] ?? null;
	}

	static async softDeleteNotification(
		notificationId: string
	): Promise<boolean> {
		const query = `
			UPDATE "UserNotifications"
			SET "softDelete" = true, "updatedAt" = NOW()
			WHERE "userNotificationId" = $1
		`;
		const result = await pool.query(query, [notificationId]);
		return (
			result !== null && result.rowCount !== null && result.rowCount > 0
		);
	}

	static async deleteAllNotificationsByUserId(
		userId: string
	): Promise<boolean> {
		const query = `
			UPDATE "UserNotifications"
			SET "softDelete" = true, "updatedAt" = NOW()
			WHERE "userId" = $1
		`;
		const result = await pool.query(query, [userId]);
		return (
			result !== null && result.rowCount !== null && result.rowCount > 0
		);
	}
}
