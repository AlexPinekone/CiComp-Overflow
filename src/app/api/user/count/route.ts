import { UserController } from '@/controller/UserController';

export async function GET() {
	return await UserController.countActiveUsers();
}
