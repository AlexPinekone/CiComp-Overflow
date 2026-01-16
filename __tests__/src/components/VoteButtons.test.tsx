import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoteButtons from '@/components/VoteButtons';
jest.mock('@/providers/SessionProvider', () => ({
	SessionContext: React.createContext(null),
}));
import { SessionContext } from '@/providers/SessionProvider';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

jest.mock('@/actions/post', () => ({
	voteOnPost: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/actions/notification', () => ({
	createNotification: jest.fn().mockResolvedValue({ success: true }),
}));

describe('VoteButtons', () => {
	const mockPush = jest.fn();
	beforeAll(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	});

	const renderWithSession = (session: any) =>
		render(
			<SessionContext.Provider value={{ session, setSession: jest.fn() }}>
				<VoteButtons postId="post-1" displayVotes={5} userVote={0} />
			</SessionContext.Provider>
		);

	it('renderiza ambos botones', () => {
		renderWithSession({ userId: 'user1' });
		expect(screen.getByText(/▲/)).toBeInTheDocument();
		expect(screen.getByText(/▼/)).toBeInTheDocument();
	});

	it('redirecciona a login si no hay usuario', async () => {
		const user = userEvent.setup();
		renderWithSession(null);
		await user.click(screen.getByText(/▲/));
		expect(mockPush).toHaveBeenCalledWith('/login');
	});

	it('aplica clase de upvote al votar y togglear', async () => {
		const user = userEvent.setup();
		renderWithSession({ userId: 'u1' });
		const upBtn = screen.getByText(/▲/).closest('button');
		const downBtn = screen.getByText(/▼/).closest('button');
		expect(upBtn).not.toHaveClass('bg-[var(--primary)]');
		await user.click(upBtn!);
		expect(upBtn).toHaveClass('bg-[var(--primary)]');
		// toggle
		await user.click(upBtn!);
		expect(upBtn).not.toHaveClass('bg-[var(--primary)]');
		// votar hacia abajo
		await user.click(downBtn!);
		expect(downBtn).toHaveClass('bg-[var(--secondary)]');
	});

	it('actualiza contador de votos de forma optimista', async () => {
		const user = userEvent.setup();
		renderWithSession({ userId: 'u1' });
		const upBtn = screen.getByText(/▲/).closest('button');
		// inicialmente 5
		expect(screen.getByText('▲ 5')).toBeInTheDocument();
		await user.click(upBtn!); // nuevo voto -> 6
		expect(screen.getByText('▲ 6')).toBeInTheDocument();
		await user.click(upBtn!); // toggle -> 5
		expect(screen.getByText('▲ 5')).toBeInTheDocument();
		const downBtn = screen.getByText(/▼/).closest('button');
		await user.click(downBtn!); // cambiar a -1 desde 0 -> 4
		expect(screen.getByText('▲ 4')).toBeInTheDocument();
	});
});
