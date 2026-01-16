import { NextRequest } from 'next/server';
import { ProfileController } from '@/controller/ProfileController';

export async function GET() {
	return await ProfileController.getAllProfiles();
}

export async function POST(req: NextRequest) {
	return await ProfileController.registerProfile(req);
}

export async function PUT(req: NextRequest) {
	return await ProfileController.updateProfile(req);
}
