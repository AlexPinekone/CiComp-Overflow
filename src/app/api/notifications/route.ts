import { NotificationController } from '@/controller/UserNotificationController';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	return NotificationController.getAllNotificationsByUserId(request);
}

export async function POST(request: NextRequest) {
	return NotificationController.createNotification(request);
}

export async function DELETE(request: NextRequest) {
	return NotificationController.deleteNotification(request);
}
