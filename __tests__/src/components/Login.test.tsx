import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page'; // Ajusta la ruta si es necesario
import { useRouter } from 'next/navigation';

// Mock de `useRouter`
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}));

// Mock de `fetch`
global.fetch = jest.fn();

describe('LoginPage', () => {
	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
		(global.fetch as jest.Mock).mockClear();
	});

	it('renderiza la página de login correctamente', () => {
		render(<LoginPage />);

		// Verifica elementos básicos en la página
		expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('ejemplo@correo.com')
		).toBeInTheDocument();
		expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
		expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
	});

	it('permite escribir en los inputs de correo y contraseña', () => {
		render(<LoginPage />);
		const emailInput = screen.getByPlaceholderText('ejemplo@correo.com');
		const passwordInput = screen.getByPlaceholderText('••••••••');

		fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
		fireEvent.change(passwordInput, { target: { value: '123456' } });

		expect((emailInput as HTMLInputElement).value).toBe('test@email.com');
		expect((passwordInput as HTMLInputElement).value).toBe('123456');
	});

	it('muestra un mensaje de error si el login falla', async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: 'Credenciales inválidas' }),
		});

		render(<LoginPage />);
		fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
			target: { value: 'test@email.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('••••••••'), {
			target: { value: 'wrongpassword' },
		});

		fireEvent.click(screen.getByText('Iniciar sesión'));

		await waitFor(() => {
			expect(
				screen.getByText('Credenciales inválidas')
			).toBeInTheDocument();
		});
	});

	it('redirecciona al usuario si el login es exitoso', async () => {
		const mockPush = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => ({}),
		});

		render(<LoginPage />);
		fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
			target: { value: 'test@email.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('••••••••'), {
			target: { value: 'password123' },
		});

		fireEvent.click(screen.getByText('Iniciar sesión'));

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});
});
