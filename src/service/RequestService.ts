import { RequestDAO } from '@/dao/RequestDAO';
import { Request } from '@/model/Request';

export class RequestService {
	static async getRequestsPaginated(
		type: string,
		page: number,
		limit: number
	): Promise<{ requests: Request[]; total: number }> {
		return await RequestDAO.getRequestsPaginated(type, page, limit);
	}

	static async getRequestById(id: string): Promise<Request | null> {
		return await RequestDAO.getRequestById(id);
	}

	static async createRequest(requestData: Request): Promise<Request> {
		return await RequestDAO.createRequest(requestData);
	}

	static async updateRequestStatus(
		requestId: string,
		status: string
	): Promise<Request> {
		return await RequestDAO.updateRequestStatus(requestId, status);
	}

	static async deleteRequest(
		requestId: string,
		status: string
	): Promise<void> {
		return await RequestDAO.deleteRequest(requestId, status);
	}

	static async countAllRequests(): Promise<number> {
		return await RequestDAO.countAllRequests();
	}
}
