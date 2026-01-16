import { NextResponse } from 'next/server';
import { SessionDAO } from '@/dao/SessionDAO';
import { getUserIdFromSession } from '@/actions/user';

export async function POST() {
	const userId = await getUserIdFromSession();

	if (userId) {
		await SessionDAO.updateSession({
			userId,
			sessionStatus: 'INACTIVE',
		});
	}

	return NextResponse.json(
		{ message: 'Session closed' },
		{
			headers: {
				'Set-Cookie':
					'Authorization=""; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
				Location: '/login',
			},
		}
	);
}
