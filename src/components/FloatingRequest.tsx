'use client';

import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { createRequest } from '@/actions/requests';
import { getUserIdFromSession } from '@/actions/user';

export default function FloatingModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [form, setForm] = useState({ title: '', description: '' });

	const toggleModal = () => setIsOpen(!isOpen);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const userId = await getUserIdFromSession();
		if (!userId) return;

		const formData = new FormData();
		formData.append('userId', userId);
		formData.append('title', form.title);
		formData.append('body', form.description);
		formData.append('type', 'general');

		const result = await createRequest(formData);

		setForm({ title: '', description: '' });
		setIsOpen(false);
	};

	const handleCancel = () => {
		setForm({ title: '', description: '' });
		setIsOpen(false);
	};

	return (
		<>
			<button
				onClick={toggleModal}
				className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition"
				aria-label="Abrir modal">
				<Mail className="w-6 h-6" />
			</button>

			{isOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 w-screen">
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
						<h2 className="text-xl font-semibold text-gray-800">
							Consulta
						</h2>
						<form onSubmit={handleSubmit} className="space-y-4">
							<input
								name="title"
								placeholder="Título"
								value={form.title}
								onChange={handleChange}
								className="w-full p-2 border rounded"
								required
							/>
							<textarea
								name="description"
								placeholder="Descripción"
								value={form.description}
								onChange={handleChange}
								className="w-full p-2 border rounded"
								required
							/>
							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={handleCancel}
									className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
									Cancelar
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
									Enviar
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
