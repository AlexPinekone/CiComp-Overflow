import { NextRequest, NextResponse } from 'next/server';
import { NotificationController } from '@/controller/UserNotificationController';
import { UserNotificationService } from '@/service/UserNotificationService';
import { ErrorHandler } from '@/utils/ErrorHandler';

jest.mock('@/service/UserNotificationService');
jest.mock('@/utils/ErrorHandler');

describe('NotificationController', () => {
	const mockNotifications = [
		{ id: '1', userId: 'u1', type: 'LIKE', referenceId: 'r1' },
	];
	const mockNotification = {
		id: '1',
		userId: 'u1',
		type: 'LIKE',
		referenceId: 'r1',
	};
	const mockNewNotification = {
		id: '2',
		userId: 'u1',
		type: 'ANSWER',
		referenceId: 'r2',
	};
	const mockUpdated = { id: '1', read: true };

	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('getAllNotificationsByUserId', () => {
		it('returns 400 if userId is missing', async () => {
			const req = new NextRequest('http://localhost/notifications');
			const res =
				await NotificationController.getAllNotificationsByUserId(req);
			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'Invalid user ID' });
		});

		it('returns 200 and notifications list on success', async () => {
			(
				UserNotificationService.getAllNotificationsByUserId as jest.Mock
			).mockResolvedValue(mockNotifications);
			const req = new NextRequest(
				'http://localhost/notifications?userId=u1'
			);
			const res =
				await NotificationController.getAllNotificationsByUserId(req);
			expect(
				UserNotificationService.getAllNotificationsByUserId
			).toHaveBeenCalledWith('u1');
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockNotifications);
		});

		it('delegates to ErrorHandler.handle on service throw', async () => {
			const error = new Error('fail');
			(
				UserNotificationService.getAllNotificationsByUserId as jest.Mock
			).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				NextResponse.json({ ok: false }, { status: 500 })
			);
			const req = new NextRequest(
				'http://localhost/notifications?userId=u1'
			);
			const res =
				await NotificationController.getAllNotificationsByUserId(req);
			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('getNotificationById', () => {
		it('returns 400 if id is missing', async () => {
			const req = new NextRequest('http://localhost/notification');
			const res = await NotificationController.getNotificationById(req);
			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Invalid notification ID',
			});
		});

		it('returns 404 if not found', async () => {
			(
				UserNotificationService.getNotificationById as jest.Mock
			).mockResolvedValue(null);
			const req = new NextRequest('http://localhost/notification?id=1');
			const res = await NotificationController.getNotificationById(req);
			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({
				error: 'Notification not found',
			});
		});

		it('returns 200 and notification on success', async () => {
			(
				UserNotificationService.getNotificationById as jest.Mock
			).mockResolvedValue(mockNotification);
			const req = new NextRequest('http://localhost/notification?id=1');
			const res = await NotificationController.getNotificationById(req);
			expect(
				UserNotificationService.getNotificationById
			).toHaveBeenCalledWith('1');
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockNotification);
		});

		it('uses ErrorHandler.handle on error', async () => {
			const error = new Error('err');
			(
				UserNotificationService.getNotificationById as jest.Mock
			).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				NextResponse.json({}, { status: 500 })
			);
			const req = new NextRequest('http://localhost/notification?id=1');
			const res = await NotificationController.getNotificationById(req);
			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('createNotification', () => {
		it('returns 400 if required fields missing', async () => {
			const req = new NextRequest(
				'http://localhost/notification/create',
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ userId: 'u1', type: 'LIKE' }),
				}
			);
			const res = await NotificationController.createNotification(req);
			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Missing required fields',
			});
		});

		it('returns 201 and new notification on success', async () => {
			(
				UserNotificationService.createNotification as jest.Mock
			).mockResolvedValue(mockNewNotification);
			const req = new NextRequest(
				'http://localhost/notification/create',
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						userId: 'u1',
						type: 'ANSWER',
						referenceId: 'r2',
						createdByUserId: 'creatorUser',
					}),
				}
			);
			const res = await NotificationController.createNotification(req);
			expect(
				UserNotificationService.createNotification
			).toHaveBeenCalledWith('u1', 'ANSWER', 'r2', 'creatorUser');
			expect(res.status).toBe(201);
			expect(await res.json()).toEqual(mockNewNotification);
		});

		it('uses ErrorHandler.handle on error', async () => {
			const error = new Error('create error');
			(
				UserNotificationService.createNotification as jest.Mock
			).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				NextResponse.json({}, { status: 500 })
			);
			const req = new NextRequest(
				'http://localhost/notification/create',
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						userId: 'u1',
						type: 'ANSWER',
						referenceId: 'r2',
						createdByUserId: 'creatorUser',
					}),
				}
			);
			const res = await NotificationController.createNotification(req);
			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('markAsRead', () => {
		it('returns 400 if id missing in body', async () => {
			const req = new NextRequest('http://localhost/notification/read', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({}),
			});
			const res = await NotificationController.markAsRead(req);
			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Invalid notification ID',
			});
		});

		it('returns 404 if not found', async () => {
			(UserNotificationService.markAsRead as jest.Mock).mockResolvedValue(
				null
			);
			const req = new NextRequest('http://localhost/notification/read', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ id: '1' }),
			});
			const res = await NotificationController.markAsRead(req);
			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({
				error: 'Notification not found',
			});
		});

		it('returns 200 and updated notification on success', async () => {
			(UserNotificationService.markAsRead as jest.Mock).mockResolvedValue(
				mockUpdated
			);
			const req = new NextRequest('http://localhost/notification/read', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ id: '1' }),
			});
			const res = await NotificationController.markAsRead(req);
			expect(UserNotificationService.markAsRead).toHaveBeenCalledWith(
				'1'
			);
			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockUpdated);
		});

		it('uses ErrorHandler.handle on error', async () => {
			const error = new Error('read error');
			(UserNotificationService.markAsRead as jest.Mock).mockRejectedValue(
				error
			);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				NextResponse.json({}, { status: 500 })
			);
			const req = new NextRequest('http://localhost/notification/read', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ id: '1' }),
			});
			const res = await NotificationController.markAsRead(req);
			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('deleteNotification', () => {
		it('returns 400 if id missing', async () => {
			const req = new NextRequest('http://localhost/notification/delete');
			const res = await NotificationController.deleteNotification(req);
			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Invalid notification ID',
			});
		});

		it('returns 404 if not found or already deleted', async () => {
			(
				UserNotificationService.deleteNotification as jest.Mock
			).mockResolvedValue(false);
			const req = new NextRequest(
				'http://localhost/notification/delete?id=1'
			);
			const res = await NotificationController.deleteNotification(req);
			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({
				error: 'Notification not found or already deleted',
			});
		});

		it('returns 204 on success', async () => {
			(
				UserNotificationService.deleteNotification as jest.Mock
			).mockResolvedValue(true);
			const req = new NextRequest(
				'http://localhost/notification/delete?id=1'
			);
			const res = await NotificationController.deleteNotification(req);
			expect(
				UserNotificationService.deleteNotification
			).toHaveBeenCalledWith('1');
			expect(res.status).toBe(204);
		});

		it('uses ErrorHandler.handle on error', async () => {
			const error = new Error('delete error');
			(
				UserNotificationService.deleteNotification as jest.Mock
			).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				NextResponse.json({}, { status: 500 })
			);
			const req = new NextRequest(
				'http://localhost/notification/delete?id=1'
			);
			const res = await NotificationController.deleteNotification(req);
			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});

	describe('deleteAllByUserId', () => {
		it('returns 400 if userId is missing', async () => {
			const req = new NextRequest(
				'http://localhost/notifications/deleteAll'
			);
			const res = await NotificationController.deleteAllByUserId(req);
			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'Invalid user ID' });
		});

		it('returns 200 and deleted flag on success', async () => {
			(
				UserNotificationService.deleteAllNotificationsByUserId as jest.Mock
			).mockResolvedValue(true);
			const req = new NextRequest(
				'http://localhost/notifications/deleteAll?userId=u1'
			);
			const res = await NotificationController.deleteAllByUserId(req);
			expect(
				UserNotificationService.deleteAllNotificationsByUserId
			).toHaveBeenCalledWith('u1');
			expect(res.status).toBe(204);
			const body = await res.text();
			expect(body).toBe('');
		});

		it('uses ErrorHandler.handle on error', async () => {
			const error = new Error('deleteAll error');
			(
				UserNotificationService.deleteAllNotificationsByUserId as jest.Mock
			).mockRejectedValue(error);
			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				NextResponse.json({}, { status: 500 })
			);
			const req = new NextRequest(
				'http://localhost/notifications/deleteAll?userId=u1'
			);
			const res = await NotificationController.deleteAllByUserId(req);
			expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
			expect(res.status).toBe(500);
		});
	});
});
