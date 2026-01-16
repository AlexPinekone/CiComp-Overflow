import { decrypt } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	const token = req.headers.get('authorization');
	if (!token) {
		return NextResponse.json(
			{ errors: { general: ['No se ha enviado un token de sesión'] } },
			{ status: 401 }
		);
	}
	try {
		const { userId, ...rest } = (await decrypt(token)) ?? {};
		return NextResponse.json({ userId, ...rest }, { status: 200 });
	} catch {
		return NextResponse.json(
			{ errors: { general: ['Error al obtener el usuario'] } },
			{ status: 500 }
		);
	}
}
