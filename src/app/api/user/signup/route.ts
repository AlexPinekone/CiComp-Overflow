import { UserController } from '@/controller/UserController';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		return await UserController.registerUser(request);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
