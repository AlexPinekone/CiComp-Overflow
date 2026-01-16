import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentVoteButtons from '@/components/CommentVoteButtons';
jest.mock('@/providers/SessionProvider', () => ({
	SessionContext: React.createContext(null),
}));
import { SessionContext } from '@/providers/SessionProvider';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}));

jest.mock('@/actions/comment', () => ({
	voteOnComment: jest.fn().mockResolvedValue({ success: true }),
}));

describe('CommentVoteButtons', () => {
	const mockPush = jest.fn();
	beforeAll(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	});

	const renderWithSession = (session: any) =>
		render(
			<SessionContext.Provider value={{ session, setSession: jest.fn() }}>
				<CommentVoteButtons
					commentId="c1"
					postId="p1"
					displayVotes={2}
					userVote={0}
				/>
			</SessionContext.Provider>
		);

	it('renderiza los botones de voto', () => {
		renderWithSession({ userId: 'u1' });
		expect(screen.getByText(/▲/)).toBeInTheDocument();
		expect(screen.getByText(/▼/)).toBeInTheDocument();
	});

	it('redirige a login si no autenticado', async () => {
		const user = userEvent.setup();
		renderWithSession(null);
		await user.click(screen.getByText(/▲/));
		expect(mockPush).toHaveBeenCalledWith('/login');
	});

	it('cambia clases al votar up y down', async () => {
		const user = userEvent.setup();
		renderWithSession({ userId: 'u1' });
		const upBtn = screen.getByText(/▲/).closest('button');
		const downBtn = screen.getByText(/▼/).closest('button');
		await user.click(upBtn!);
		expect(upBtn).toHaveClass('bg-[var(--primary)]');
		await user.click(downBtn!);
		expect(downBtn).toHaveClass('bg-[var(--secondary)]');
	});

	it('muestra contador de votos solo si > 0', async () => {
		const user = userEvent.setup();
		render(
			<SessionContext.Provider
				value={{ session: { userId: 'u1' }, setSession: jest.fn() }}>
				<CommentVoteButtons
					commentId="c1"
					postId="p1"
					displayVotes={0}
					userVote={0}
				/>
			</SessionContext.Provider>
		);
		expect(screen.getByText('▲')).toBeInTheDocument();
		await user.click(screen.getByText(/▲/));
		expect(screen.getByText('▲ 1')).toBeInTheDocument();
	});
});
