import { decrypt } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const token = request.headers.get('Authorization')?.split(' ')[1];

	if (!token) {
		return NextResponse.json(
			{ error: 'Token no proporcionado' },
			{ status: 401 }
		);
	}

	const payload = decrypt(token);

	if (!payload) {
		return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
	}

	return NextResponse.json({ userId: payload.userId, role: payload.role });
}
