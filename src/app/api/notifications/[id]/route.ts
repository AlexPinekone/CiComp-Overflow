import { NotificationController } from '@/controller/UserNotificationController';
import { NextRequest } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	return NotificationController.getAllNotificationsByUserId(request);
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return NotificationController.markAsRead(request);
}
