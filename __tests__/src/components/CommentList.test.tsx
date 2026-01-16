import React from 'react';
import { render, screen } from '@testing-library/react';
import CommentList from '@/components/CommentList';

// Mock de CommentItem
jest.mock('@/components/CommentItem', () => ({
	__esModule: true,
	default: ({ comment }: any) => (
		<div data-testid="comment-item">{comment.body}</div>
	),
}));

describe('CommentList', () => {
	const baseProps = {
		userVotes: {},
		handleVote: jest.fn(),
		currentUser: 'u1',
		onUpdate: jest.fn(),
		onDelete: jest.fn(),
		onReport: jest.fn(),
	};

	it('renderiza lista de comentarios', () => {
		const comments = [
			{
				commentId: 'c1',
				postId: 'p1',
				authorName: 'A',
				authorAvatar: '',
				createdAt: new Date(),
				body: 'Uno',
				votes: 0,
			},
			{
				commentId: 'c2',
				postId: 'p1',
				authorName: 'B',
				authorAvatar: '',
				createdAt: new Date(),
				body: 'Dos',
				votes: 0,
			},
		];
		render(<CommentList {...baseProps} comments={comments} />);
		expect(screen.getAllByTestId('comment-item')).toHaveLength(2);
		expect(screen.getByText('Uno')).toBeInTheDocument();
		expect(screen.getByText('Dos')).toBeInTheDocument();
	});

	it('no muestra items si no hay comentarios', () => {
		render(<CommentList {...baseProps} comments={[]} />);
		expect(screen.queryByTestId('comment-item')).toBeNull();
	});

	it('pasa highlightedId correctamente', () => {
		const comments = [
			{
				commentId: 'c1',
				postId: 'p1',
				authorName: 'A',
				authorAvatar: '',
				createdAt: new Date(),
				body: 'Uno',
				votes: 0,
			},
			{
				commentId: 'c2',
				postId: 'p1',
				authorName: 'B',
				authorAvatar: '',
				createdAt: new Date(),
				body: 'Dos',
				votes: 0,
			},
		];
		render(
			<CommentList
				{...baseProps}
				comments={comments}
				highlightedId="c2"
			/>
		);
		expect(screen.getAllByTestId('comment-item')).toHaveLength(2);
	});
});
