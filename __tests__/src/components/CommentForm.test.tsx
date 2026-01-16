import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentForm from '@/components/CommentForm';
import { toast } from 'sonner';

// Mocks
const mockAddComment = jest.fn().mockReturnValue({
	unwrap: jest.fn().mockResolvedValue({ commentId: 'c1' }),
});

jest.mock('@/redux/services/commentsApi', () => ({
	useAddCommentMutation: () => [mockAddComment, { isLoading: false }],
}));

jest.mock('@/actions/notification', () => ({
	createNotification: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/actions/user', () => ({
	getUserIdFromSession: jest.fn().mockResolvedValue('u1'),
}));

jest.mock('@/utils/validateContent', () => ({
	replaceForbiddenWords: (s: string) => s,
}));

jest.mock('sonner', () => ({
	toast: { success: jest.fn(), error: jest.fn() },
}));

describe('CommentForm', () => {
	const baseProps = { postId: 'p1', postAuthorId: 'author1' };

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renderiza textarea y botón de submit', () => {
		render(<CommentForm {...baseProps} />);
		expect(
			screen.getByPlaceholderText('Escribe un comentario...')
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', {
				name: /Comentar|Publicar|Publicando.../i,
			})
		).toBeInTheDocument();
	});

	it('valida body vacío', async () => {
		const user = userEvent.setup();
		render(<CommentForm {...baseProps} />);
		await user.click(
			screen.getByRole('button', { name: /Comentar|Publicar/i })
		);
		expect(
			screen.getByText('El comentario no puede estar vacío.')
		).toBeInTheDocument();
	});

	it('valida body con longitud > 500', async () => {
		const user = userEvent.setup();
		render(<CommentForm {...baseProps} />);
		const ta = screen.getByPlaceholderText('Escribe un comentario...');
		await user.type(ta, 'a'.repeat(501));
		await user.click(
			screen.getByRole('button', { name: /Comentar|Publicar/i })
		);
		expect(
			screen.getByText('El comentario no puede superar 500 caracteres.')
		).toBeInTheDocument();
	});

	it('submit exitoso llama a addComment y notifica', async () => {
		const user = userEvent.setup();
		render(<CommentForm {...baseProps} />);
		const ta = screen.getByPlaceholderText('Escribe un comentario...');
		await user.type(ta, 'Hola mundo');
		await user.click(
			screen.getByRole('button', { name: /Comentar|Publicar/i })
		);

		// addComment debe haberse llamado
		expect(mockAddComment).toHaveBeenCalled();
		// Esperar a que el flujo async haya llamado toast (la promesa unwrap se resuelve)
		await Promise.resolve();
		expect(toast.success).toHaveBeenCalledWith(
			'Comentario creado correctamente'
		);
	});
});
