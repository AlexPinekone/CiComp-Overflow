'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Flag, Pencil, Trash2 } from 'lucide-react'; // Importamos los íconos de Lucide
import { useActionState, useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { updateCommentById } from '@/actions/comment';
import { toast } from 'sonner';
import { getUserRoleFromId } from '@/actions/user';
import { cn } from '@/lib/utils';
import CommentVoteButtons from './CommentVoteButtons';

interface Comment {
	commentId: string;
	postId: string;
	authorName: string;
	authorAvatar: string;
	body: string;
	createdAt: Date;
	votes: number;
	userVote: number;
}

interface CommentItemProps {
	comment: Comment & { userId: string };
	handleVote: (id: string, type: 'up' | 'down') => void;
	currentUser: string;
	onUpdate: (id: string, comment: Comment) => void;
	onDelete: (id: string) => void;
	onReport: (commentId: string) => void;
	isHighlighted?: boolean;
	userVote: number;
}

export default function CommentItem({
	comment,
	userVote,
	handleVote,
	currentUser,
	onUpdate,
	onDelete,
	onReport,
	isHighlighted,
}: CommentItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [userRole, setUserRole] = useState<string | null>(null);
	const [editText, setEditText] = useState(comment.body);
	const [editError, setEditError] = useState<string | null>(null);
	const [status, commentAction] = useActionState(
		(state: any, payload: FormData) =>
			updateCommentById(payload, comment.commentId),
		undefined
	);
	const ref = useRef<HTMLDivElement>(null);
	// Estado para controlar la visibilidad del modal
	const [showConfirm, setShowConfirm] = useState(false);
	const [showConfirm2, setShowConfirm2] = useState(false);

	const handleSave = async (formData) => {
		setEditError(null);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditText(comment.body);
		setIsEditing(false);
	};

	// Abre el modal de confirmación
	const handleDeleteClick = () => {
		setShowConfirm(true);
	};

	// Función que se ejecuta si se confirma la eliminación
	const handleConfirmDelete = () => {
		onDelete(comment.commentId);
		setShowConfirm(false);
	};

	// Función para el reporte
	const handleReportClick = () => {
		setShowConfirm2(true);
	};

	const handleConfirmReport = () => {
		onReport(comment.commentId);
		setShowConfirm2(false);
	};

	const netVotes = Array.isArray(comment.votes)
		? comment.votes.reduce((acc: number, v: any) => {
				if (v.softDelete) return acc;
				if (v.status === 'UPVOTE') return acc + 1;
				if (v.status === 'DOWNVOTE') return acc - 1;
				return acc;
			}, 0)
		: 0;

	const userVoteStatus = Array.isArray(comment.votes)
		? comment.votes.find(
				(v: any) => v.userId === currentUser && !v.softDelete
			)?.status
		: null;

	const numericUserVote =
		userVoteStatus === 'UPVOTE'
			? 1
			: userVoteStatus === 'DOWNVOTE'
				? -1
				: 0;

	useEffect(() => {
		if (status?.success) {
			onUpdate(comment.commentId, { ...comment, body: editText });
			toast.success('Comentario actualizado correctamente');
		} else if (status?.errors) {
			toast.error('Error al actualizar el comentario');
		}
	}, [status]);

	useEffect(() => {
		const fetchUserRole = async () => {
			if (!currentUser) return;

			try {
				const role = await getUserRoleFromId(currentUser);
				setUserRole(role);
			} catch (error) {
				console.error('Error fetching user role:', error);
			}
		};

		fetchUserRole();
	}, [currentUser]);

	useEffect(() => {
		if (isHighlighted && ref.current) {
			ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [isHighlighted]);

	return (
		<>
			<div
				id={comment.commentId}
				className={cn(
					'p-4 rounded- lg flex items-start space-x-4',
					isHighlighted
						? 'bg-yellow-100 border-yellow-400 animate-pulse'
						: 'bg-gray-100 '
				)}>
				{/* Avatar */}
				<Avatar className="w-10 h-10 rounded-full">
					<AvatarImage src={comment.authorAvatar} />
					<AvatarFallback>
						{comment.authorName?.[0] ?? 'EX'}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<div className="flex justify-between items-center">
						<div>
							<p className="text-sm font-semibold">
								{comment.authorName}
							</p>
							<p className="text-xs text-gray-500">
								{formatDistanceToNow(comment.createdAt, {
									addSuffix: true,
									locale: es,
								})}
							</p>
						</div>
						{/* Si el comentario es del usuario actual, mostramos los botones de editar y eliminar */}
						{comment.userId === currentUser ||
						userRole === 'ADMIN' ? (
							<div className="flex space-x-2">
								{!isEditing && (
									<>
										<Button
											size="icon"
											variant="ghost"
											onClick={() => setIsEditing(true)}>
											<Pencil className="w-5 h-5 text-gray-600 hover:text-gray-900" />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											onClick={handleDeleteClick}>
											<Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
										</Button>
									</>
								)}
							</div>
						) : (
							<div className="flex space-x-2">
								<Button
									size="icon"
									variant="ghost"
									onClick={handleReportClick}>
									<Flag className="w-5 h-5 text-gray-600 hover:text-gray-900" />
								</Button>
							</div>
						)}
					</div>

					{isEditing ? (
						<div className="mt-2">
							<form action={commentAction} onSubmit={handleSave}>
								<Textarea
									name="body"
									value={editText}
									onChange={(e) =>
										setEditText(e.target.value)
									}
									rows={3}
									className="w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								/>
								{editError && (
									<p className="text-red-500 text-sm mt-1">
										{editError}
									</p>
								)}
								<div className="flex space-x-2 mt-2">
									<Button size="sm" type="submit">
										Guardar
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={handleCancel}>
										Cancelar
									</Button>
								</div>
							</form>
						</div>
					) : (
						<p className="text-gray-800 text-sm mt-2">
							{comment.body}
						</p>
					)}

					{/* Sección de votación */}
					<div className="flex items-center space-x-2 mt-2">
						<CommentVoteButtons
							commentId={comment.commentId}
							postId={comment.postId}
							userVote={numericUserVote}
							displayVotes={netVotes}
						/>
					</div>
				</div>
			</div>

			{/* Código del modal de confirmación */}
			{showConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-80">
						<h3 className="text-lg font-semibold text-black mb-4">
							Confirmar eliminación
						</h3>
						<p className="text-black mb-6">
							Estás a punto de eliminar este comentario de forma
							permanente. ¿Deseas continuar?
						</p>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowConfirm(false)}
								className="px-4 py-2 rounded bg-gray-400 text-black">
								Cancelar
							</button>
							<button
								onClick={handleConfirmDelete}
								className="px-4 py-2 rounded bg-red-600 text-white">
								Eliminar
							</button>
						</div>
					</div>
				</div>
			)}

			{showConfirm2 && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-80">
						<h3 className="text-lg font-semibold text-black mb-4">
							Confirmar reporte
						</h3>
						<p className="text-black mb-6">
							Estás a punto de reportar este comentario ¿Deseas
							continuar?
						</p>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowConfirm2(false)}
								className="px-4 py-2 rounded bg-gray-400 text-black">
								Cancelar
							</button>
							<button
								onClick={handleConfirmReport}
								className="px-4 py-2 rounded bg-red-600 text-white">
								Reportar
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
