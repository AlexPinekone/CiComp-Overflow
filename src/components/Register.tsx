'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminRegisterContainer() {
	const [name, setName] = useState('');
	const [lastName, setLastName] = useState('');
	const [mail, setMail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const router = useRouter();
	const [success, setSuccess] = useState(false);
	const [userData, setUserData] = useState<any>(null);

	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

	function validateFields() {
		if (!mail.includes('@') || !mail.includes('.')) {
			setError("El correo debe ser válido (contener '@' y un dominio).");
			return false;
		}
		if (!passwordRegex.test(password)) {
			setError(
				'La contraseña debe tener al menos 8 caracteres, ' +
					'una mayúscula, una minúscula, un número y un carácter especial.'
			);
			return false;
		}
		if (password !== confirmPassword) {
			setError('Las contraseñas no coinciden.');
			return false;
		}
		setError('');
		return true;
	}

	async function doSignup() {
		setShowConfirm(false);
		setLoading(true);
		setError('');
		try {
			const res = await fetch('/api/user/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, lastName, mail, password, role }),
			});

			const contentType = res.headers.get('content-type');
			if (contentType?.includes('application/json')) {
				const data = await res.json();
				if (!res.ok)
					throw new Error(data.error || 'Error al registrar');

				setUserData(data);
				setSuccess(true);
			} else {
				const text = await res.text();
				throw new Error(text || 'Error al registrar usuario');
			}
		} catch (err: any) {
			setError(err.message || 'Error al registrar usuario');
		} finally {
			setLoading(false);
		}
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!validateFields()) return;
		if (role === 'ADMIN') {
			setShowConfirm(true);
		} else {
			doSignup();
		}
	}

	function handleContinue() {
		setSuccess(false);
		setUserData(null);

		// Limpiar todos los campos del formulario
		setName('');
		setLastName('');
		setMail('');
		setPassword('');
		setConfirmPassword('');
		setRole('USER');
		setError('');
	}

	return (
		<div className="bg-[#002E5E] text-[#F6F8F9] rounded-lg p-6 shadow-md max-w-md mx-auto">
			<h2 className="text-xl font-semibold text-center mb-4">
				Registro de un nuevo usuario
			</h2>
			{error && (
				<div className="p-2 mb-4 bg-red-500 text-sm rounded text-white">
					{error}
				</div>
			)}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium">
						Nombre(s)
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						placeholder="Ingresa el nombre"
						className="mt-1 w-full px-3 py-2 border rounded text-black"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium">
						Apellido(s)
					</label>
					<input
						type="text"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						required
						placeholder="Ingresa el apellido"
						className="mt-1 w-full px-3 py-2 border rounded text-black"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium">
						Correo electrónico
					</label>
					<input
						type="email"
						value={mail}
						onChange={(e) => setMail(e.target.value)}
						required
						placeholder="ejemplo@correo.com"
						className="mt-1 w-full px-3 py-2 border rounded text-black"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium">
						Contraseña
					</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						placeholder="••••••••"
						className="mt-1 w-full px-3 py-2 border rounded text-black"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium">
						Confirmar Contraseña
					</label>
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						placeholder="••••••••"
						className="mt-1 w-full px-3 py-2 border rounded text-black"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium">Rol</label>
					<select
						value={role}
						onChange={(e) => setRole(e.target.value as any)}
						className="mt-1 w-full px-3 py-2 border rounded text-black">
						<option value="USER">USUARIO</option>
						<option value="ADMIN">ADMINISTRADOR</option>
					</select>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="w-full py-2 rounded shadow text-white bg-blue-600 disabled:opacity-50">
					{loading ? 'Registrando...' : 'Registrar Usuario'}
				</button>
			</form>

			{showConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-80">
						<h3 className="text-lg font-semibold text-black mb-4">
							Confirmar creación
						</h3>
						<p className="text-black mb-6">
							Estás a punto de crear un usuario con rol{' '}
							<strong className="text-black">
								ADMINISTRADOR
							</strong>
							. ¿Deseas continuar?
						</p>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowConfirm(false)}
								className="px-4 py-2 rounded bg-red-600 text-white">
								Cancelar
							</button>
							<button
								onClick={doSignup}
								className="px-4 py-2 rounded bg-blue-600 text-white">
								Aceptar
							</button>
						</div>
					</div>
				</div>
			)}
			{success && userData && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-80">
						<div className="text-center mb-4">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 13l4 4L19 7"></path>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-green-600 mb-2">
								¡Usuario registrado exitosamente!
							</h3>
						</div>
						<div className="text-black mb-6 space-y-2">
							<p>
								<strong>Nombre:</strong> {userData.user?.name}{' '}
								{userData.user?.lastName}
							</p>
							<p>
								<strong>Correo:</strong>{' '}
								{userData.account?.mail}
							</p>
							<p>
								<strong>Rol:</strong>{' '}
								{userData.user?.role === 'ADMIN'
									? 'ADMINISTRADOR'
									: 'USUARIO'}
							</p>
						</div>
						<div className="flex justify-center">
							<button
								onClick={handleContinue}
								className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
								Continuar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
