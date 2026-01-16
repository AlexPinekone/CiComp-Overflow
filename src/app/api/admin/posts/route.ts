import { AdminController } from '@/controller/AdminController';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
	return AdminController.getAllPosts(req);
}
