import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import PrimarySearchAppBar from '@/components/Appbar';

// Mock del router para capturar navegaciones
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}));

describe('PrimarySearchAppBar', () => {
	it('debe permitir escribir en el campo de búsqueda', () => {
		render(<PrimarySearchAppBar />);
		const searchInput = screen.getByPlaceholderText('Search...');
		fireEvent.change(searchInput, { target: { value: 'React' } });
		expect(searchInput).toHaveValue('React');
	});

	it("debe redirigir a la página de búsqueda cuando se presiona 'Enter'", () => {
		const pushMock = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({ push: pushMock });
		render(<PrimarySearchAppBar />);
		const searchInput = screen.getByPlaceholderText('Search...');
		fireEvent.change(searchInput, { target: { value: 'Next.js' } });
		fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
		expect(pushMock).toHaveBeenCalledWith('/search?q=Next.js&page=1');
	});

	it('debe redirigir cuando se hace clic en el icono de búsqueda', () => {
		const pushMock = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({ push: pushMock });
		render(<PrimarySearchAppBar />);
		const searchInput = screen.getByPlaceholderText('Search...');
		const searchIcon = screen.getByRole('img');
		fireEvent.change(searchInput, { target: { value: 'TypeScript' } });
		fireEvent.click(searchIcon);
		expect(pushMock).toHaveBeenCalledWith('/search?q=TypeScript&page=1');
	});
});
