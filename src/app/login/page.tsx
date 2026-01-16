'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ciCompLogo from '../../../public/ciCompLogo.svg';
import { loginUser } from '@/actions/session';
import { toast } from 'sonner';
import { queryClient } from '@/providers/Providers';

export default function LoginPage() {
	const router = useRouter();
	const [state, loginAction, isPending] = useActionState(
		async (prevState: any, payload: FormData) => {
			const response = await loginUser(payload);

			if (response?.error) {
				return { error: response.error };
			}

			queryClient.invalidateQueries({ queryKey: ['session'] });
			router.push('/admin');

			return { success: true };
		},
		null
	);

	useEffect(() => {
		if (state?.success) {
			toast.success('¡Inicio de sesión exitoso!');
		}
		if (state?.error) {
			toast.error(state.error);
		}
	}, [state]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
				<div className="flex justify-center">
					<Image src={ciCompLogo} alt="Logo" className="w-20 h-20" />
				</div>

				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-titles">
						Iniciar Sesión
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Ingresa tus credenciales para acceder a tu cuenta
					</p>
				</div>

				{state?.error && (
					<div className="p-4 text-sm text-white bg-red-500 rounded-md">
						{state.error}
					</div>
				)}

				<form className="mt-8 space-y-6" action={loginAction}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="mail"
								className="block text-sm font-medium text-gray-700">
								Correo electrónico
							</label>
							<input
								id="mail"
								name="mail"
								type="email"
								autoComplete="email"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
								placeholder="ejemplo@correo.com"
							/>
						</div>

						<div>
							<div className="flex items-center justify-between">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700">
									Contraseña
								</label>
								<Link
									href="/forgot-password"
									className="text-xs text-primary hover:text-tertiary">
									¿Olvidaste tu contraseña?
								</Link>
							</div>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
								placeholder="••••••••"
							/>
						</div>
					</div>
					<div className="space-y-3">
						<button
							type="submit"
							disabled={isPending}
							className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
							{isPending
								? 'Iniciando sesión...'
								: 'Iniciar sesión'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
