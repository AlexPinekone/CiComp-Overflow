import { UserNotificationService } from '@/service/UserNotificationService';
import { UserNotificationDAO } from '@/dao/UserNotificationDAO';

jest.mock('@/dao/UserNotificationDAO');

describe('UserNotificationService', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('getAllNotificationsByUserId → debe llamar al DAO y devolver su resultado', async () => {
		const fake = [{ id: '1' }, { id: '2' }];
		(
			UserNotificationDAO.getAllNotificationsByUserId as jest.Mock
		).mockResolvedValue(fake);
		const res =
			await UserNotificationService.getAllNotificationsByUserId('u1');
		expect(
			UserNotificationDAO.getAllNotificationsByUserId
		).toHaveBeenCalledWith('u1');
		expect(res).toBe(fake);
	});

	it('getNotificationById → idem DAO', async () => {
		const obj = { id: 'n1' };
		(
			UserNotificationDAO.getNotificationById as jest.Mock
		).mockResolvedValue(obj);
		const res = await UserNotificationService.getNotificationById('n1');
		expect(UserNotificationDAO.getNotificationById).toHaveBeenCalledWith(
			'n1'
		);
		expect(res).toBe(obj);
	});

	it('createNotification → debe pasar userId, type, referenceId al DAO', async () => {
		const created = { id: 'new' };
		(UserNotificationDAO.createNotification as jest.Mock).mockResolvedValue(
			created
		);
		const res = await UserNotificationService.createNotification(
			'u1',
			'LIKE',
			'r1',
			'creatorUserId'
		);
		expect(UserNotificationDAO.createNotification).toHaveBeenCalledWith(
			'u1',
			'LIKE',
			'r1',
			'creatorUserId'
		);
		expect(res).toBe(created);
	});

	it('markAsRead → debe invocar al DAO.markAsRead', async () => {
		const updated = { id: 'n1', read: true };
		(UserNotificationDAO.markAsRead as jest.Mock).mockResolvedValue(
			updated
		);
		const res = await UserNotificationService.markAsRead('n1');
		expect(UserNotificationDAO.markAsRead).toHaveBeenCalledWith('n1');
		expect(res).toBe(updated);
	});

	it('deleteNotification → debe invocar a softDeleteNotification y devolver boolean', async () => {
		(
			UserNotificationDAO.softDeleteNotification as jest.Mock
		).mockResolvedValue(true);
		const res = await UserNotificationService.deleteNotification('n1');
		expect(UserNotificationDAO.softDeleteNotification).toHaveBeenCalledWith(
			'n1'
		);
		expect(res).toBe(true);
	});

	it('deleteAllNotificationsByUserId → idem DAO', async () => {
		(
			UserNotificationDAO.deleteAllNotificationsByUserId as jest.Mock
		).mockResolvedValue(false);
		const res =
			await UserNotificationService.deleteAllNotificationsByUserId('u1');
		expect(
			UserNotificationDAO.deleteAllNotificationsByUserId
		).toHaveBeenCalledWith('u1');
		expect(res).toBe(false);
	});
});
