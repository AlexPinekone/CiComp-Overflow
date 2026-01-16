import { NextRequest } from 'next/server';
import { ProfileController } from '@/controller/ProfileController';

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	return await ProfileController.updateProfileStatus(req, id);
}
