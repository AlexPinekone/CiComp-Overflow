import { RequestController } from '@/controller/RequestController';

export async function GET() {
	return await RequestController.countAllRequests();
}
