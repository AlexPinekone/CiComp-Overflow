import { AdminController } from '@/controller/AdminController';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
	return AdminController.getAllRequests();
}
