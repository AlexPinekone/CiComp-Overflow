import { UserNotificationDAO } from '@/dao/UserNotificationDAO';
import { UserNotification } from '@/model/UserNotification';

export class UserNotificationService {
	static async getAllNotificationsByUserId(
		userId: string
	): Promise<UserNotification[]> {
		return await UserNotificationDAO.getAllNotificationsByUserId(userId);
	}

	static async getNotificationById(
		id: string
	): Promise<UserNotification | null> {
		return await UserNotificationDAO.getNotificationById(id);
	}

	static async createNotification(
		userId: string,
		type: 'ANSWER' | 'EDIT' | 'LIKE' | 'DELETE' | 'REQUEST',
		referenceId: string,
		createdByUserId: string
	): Promise<UserNotification> {
		return await UserNotificationDAO.createNotification(
			userId,
			type,
			referenceId,
			createdByUserId
		);
	}

	static async markAsRead(
		notificationId: string
	): Promise<UserNotification | null> {
		return await UserNotificationDAO.markAsRead(notificationId);
	}

	static async deleteNotification(id: string): Promise<boolean> {
		return await UserNotificationDAO.softDeleteNotification(id);
	}

	static async deleteAllNotificationsByUserId(
		userId: string
	): Promise<boolean> {
		return await UserNotificationDAO.deleteAllNotificationsByUserId(userId);
	}
}
