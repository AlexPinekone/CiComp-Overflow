import { NextRequest } from 'next/server';
import { ProfileController } from '@/controller/ProfileController';

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	return await ProfileController.getProfileById(id);
}
