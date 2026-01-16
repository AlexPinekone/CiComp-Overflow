import { ProfileController } from '@/controller/ProfileController';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
	return await ProfileController.getProfileByUserSession(req);
}
