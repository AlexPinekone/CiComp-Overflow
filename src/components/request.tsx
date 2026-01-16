import { useEffect, useState } from 'react';
import { User, Check, X, ExternalLink } from 'lucide-react';
import { getProfileById } from '@/actions/profile';
import { deleteRequest } from '@/actions/requests';
import { createNotification } from '../actions/notification';

interface RequestProps {
	userId: string;
	createdAt: Date | undefined;
	title?: string;
	description: string;
	status: string;
	postId?: string | undefined;
	commentId?: string;
	reportedUserId?: string;
	requestId?: string;
}

export default function RequestCard({
	userId,
	createdAt,
	title,
	description,
	status,
	postId,
	commentId,
	reportedUserId,
	requestId,
}: RequestProps) {
	const [userName, setUserName] = useState<string | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchUserName = async () => {
			try {
				const profile = await getProfileById(userId);
				setUserName(profile?.userName || 'Usuario no encontrado');
			} catch (error) {
				console.error('Error al obtener el usuario', error);
				setUserName('Error al obtener el usuario');
			} finally {
				setLoading(false);
			}
		};

		fetchUserName();
	}, [userId]);

	const handleOpenPost = () => {
		if (postId && commentId) {
			window.open(`/posts/${postId}?highlight=${commentId}`, '_blank');
		} else if (postId) {
			window.open(`/posts/${postId}`, '_blank');
		} else if (reportedUserId) {
			window.open(`/user/${reportedUserId}`, '_blank');
		} else {
			window.open(`/user/${userId}`, '_blank');
		}
	};

	const handleDelete = async (status: string) => {
		if (!requestId) {
			console.error('Request ID es undefined');
			return;
		}

		const result = await deleteRequest(requestId, status);

		if (result?.success) {
			await createNotification({
				userId: userId,
				type: 'REQUEST',
				referenceId: postId as string,
				createdByUserId: userId as string, //El mismo creador de la request
			});
		}
	};

	return (
		<div className="border border-gray-200 rounded-lg p-6 shadow-md bg-white flex flex-col hover:shadow-lg transition-shadow">
			{/* Encabezado: Icono, Nombre y Fecha */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center">
					<div className="bg-gray-200 p-2 rounded-full">
						<User className="w-10 h-10 text-gray-600" />
					</div>
					<span className="ml-3 text-[22px] font-medium text-gray-900">
						{loading ? 'Cargando...' : title ? title : userName}
					</span>
				</div>
				{/*Muestra la fecha*/}
				<span className="text-sm text-gray-500">
					{createdAt
						? new Date(createdAt).toLocaleDateString('es-MX', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})
						: 'Fecha desconocida'}
				</span>
			</div>

			{/* Descripción de la solicitud */}
			<p className="text-gray-700 mb-6 text-lg">{description}</p>

			{/* Botones de acción */}
			<div className="flex justify-between items-center">
				<button
					onClick={handleOpenPost}
					className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition text-sm">
					<ExternalLink className="w-4 h-4" /> Ir a ver
				</button>

				<div className="flex gap-3">
					{status === 'PENDING' && (
						<>
							<button
								onClick={() => {
									handleDelete('APPROVED');
								}}
								className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
								<Check className="w-5 h-5" /> Aceptar
							</button>
							<button
								onClick={() => {
									handleDelete('REJECTED');
								}}
								className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
								<X className="w-5 h-5" /> Rechazar
							</button>
						</>
					)}
					{status === 'APPROVED' && (
						<span className="text-green-600 text-lg font-medium">
							Aprobada
						</span>
					)}
					{status === 'REJECTED' && (
						<span className="text-red-600 text-lg font-medium">
							Rechazada
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
