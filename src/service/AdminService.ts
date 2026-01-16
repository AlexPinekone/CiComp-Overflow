import { ProfileDAO } from '@/dao/ProfileDAO';
import { RequestDAO } from '@/dao/RequestDAO';
import { UserDAO } from '@/dao/UserDAO';

export class AdminService {
	static async getAllUsers() {
		return await UserDAO.getUsers();
	}

	static async getUserById(id: string) {
		return await UserDAO.getUserById(id);
	}

	static async banProfileById(profileId: string) {
		return await ProfileDAO.banProfile(profileId);
	}

	static async getAllRequests() {
		return await RequestDAO.getRequests();
	}

	static async getRequestById(id: string) {
		return await RequestDAO.getRequestById(id);
	}

	static async deleteRequest(id: string) {
		return await RequestDAO.deleteRequest(id);
	}
}
