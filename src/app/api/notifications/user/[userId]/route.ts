import { NotificationController } from '@/controller/UserNotificationController';
import { NextRequest } from 'next/server';

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	// Await params antes de usar sus propiedades
	const { userId } = await params;

	// Crear una nueva request con el userId en los searchParams
	const url = new URL(request.url);
	url.searchParams.set('userId', userId);

	const modifiedRequest = new NextRequest(url.toString(), {
		method: request.method,
		headers: request.headers,
		body: request.body,
	});

	return NotificationController.deleteAllByUserId(modifiedRequest);
}
