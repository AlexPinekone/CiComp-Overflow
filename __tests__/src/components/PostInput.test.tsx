import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostInput from '@/components/postInput';
import { toast } from 'sonner';

// Mocks
const mockAddPost = jest
	.fn()
	.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ postId: 'p1' }) });

jest.mock('@/redux/services/postsApi', () => ({
	useAddPostMutation: () => [mockAddPost, { isLoading: false }],
}));

jest.mock('@/actions/tag', () => ({
	getAllTagsCatalog: jest
		.fn()
		.mockResolvedValue({ tags: [{ label: 'tag1' }, { label: 'tag2' }] }),
}));

jest.mock('@/components/RichTextEditor', () => ({
	__esModule: true,
	default: ({ onChange }: any) => (
		<textarea
			placeholder="RichTextEditor"
			onChange={(e) => onChange(e.target.value)}
		/>
	),
}));

jest.mock('sonner', () => ({
	toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
	usePathname: jest.fn(),
	useSearchParams: jest.fn().mockReturnValue({ get: () => null }),
}));

describe('PostInput', () => {
	beforeEach(() => jest.clearAllMocks());

	it('abre el modal, permite escribir título y body y publica', async () => {
		const user = userEvent.setup();
		render(<PostInput />);

		await user.click(screen.getByText('¿Qué estás pensando?'));
		expect(screen.getByText('Crear Post')).toBeInTheDocument();

		const titleInput = screen.getByPlaceholderText(
			'Escribe el título del post'
		);
		await user.type(titleInput, 'Mi título');

		const bodyInput = screen.getByPlaceholderText('RichTextEditor');
		await user.type(bodyInput, 'Este es el body');

		const publishBtn = screen.getByRole('button', { name: /Publicar/i });
		await user.click(publishBtn);

		expect(mockAddPost).toHaveBeenCalled();
		await Promise.resolve();
		expect(toast.success).toHaveBeenCalled();
	});

	it('cierra el modal al cancelar', async () => {
		const user = userEvent.setup();
		render(<PostInput />);
		await user.click(screen.getByText('¿Qué estás pensando?'));
		expect(screen.getByText('Crear Post')).toBeInTheDocument();
		const cancel = screen.getByRole('button', { name: /Cancelar/i });
		await user.click(cancel);
		expect(screen.queryByText('Crear Post')).not.toBeInTheDocument();
	});
});
