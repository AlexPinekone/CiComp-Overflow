import { NextRequest, NextResponse } from 'next/server';
import { UserNotificationService } from '@/service/UserNotificationService';
import { ErrorHandler } from '@/utils/ErrorHandler';

export class NotificationController {
	static async getAllNotificationsByUserId(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get('userId');
		if (!userId) {
			return NextResponse.json(
				{ error: 'Invalid user ID' },
				{ status: 400 }
			);
		}

		try {
			const notifications =
				await UserNotificationService.getAllNotificationsByUserId(
					userId
				);
			return NextResponse.json(notifications, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getNotificationById(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid notification ID' },
				{ status: 400 }
			);
		}

		try {
			const notification =
				await UserNotificationService.getNotificationById(id);
			if (!notification) {
				return NextResponse.json(
					{ error: 'Notification not found' },
					{ status: 404 }
				);
			}
			return NextResponse.json(notification, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async createNotification(req: NextRequest) {
		try {
			const { userId, type, referenceId, createdByUserId } =
				await req.json();

			if (!userId || !type || !referenceId || !createdByUserId) {
				return NextResponse.json(
					{ error: 'Missing required fields' },
					{ status: 400 }
				);
			}

			const newNotification =
				await UserNotificationService.createNotification(
					userId,
					type,
					referenceId,
					createdByUserId
				);

			return NextResponse.json(newNotification, { status: 201 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async markAsRead(req: NextRequest) {
		try {
			const { id } = await req.json();

			if (!id) {
				return NextResponse.json(
					{ error: 'Invalid notification ID' },
					{ status: 400 }
				);
			}

			const updated = await UserNotificationService.markAsRead(id);
			if (!updated) {
				return NextResponse.json(
					{ error: 'Notification not found' },
					{ status: 404 }
				);
			}
			return NextResponse.json(updated, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async deleteNotification(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid notification ID' },
				{ status: 400 }
			);
		}

		try {
			const deleted =
				await UserNotificationService.deleteNotification(id);
			if (!deleted) {
				return NextResponse.json(
					{ error: 'Notification not found or already deleted' },
					{ status: 404 }
				);
			}
			return new NextResponse(null, { status: 204 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async deleteAllByUserId(req: NextRequest) {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get('userId');
		if (!userId) {
			return NextResponse.json(
				{ error: 'Invalid user ID' },
				{ status: 400 }
			);
		}

		try {
			const deleted =
				await UserNotificationService.deleteAllNotificationsByUserId(
					userId
				);
			return new NextResponse(null, { status: 204 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}
}
