import { AdminController } from '@/controller/AdminController';
import { NextRequest } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	return AdminController.getUserById(id);
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	return AdminController.banProfileById(params.id);
}
