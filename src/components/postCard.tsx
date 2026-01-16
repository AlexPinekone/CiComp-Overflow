'use client';

import {
	useGetCommentsByPostQuery,
	useDeleteCommentMutation,
} from '@/redux/services/commentsApi';
import { deletePost, updatePost } from '@/actions/post';
import { createRequest } from '@/actions/requests';
import { getUserIdFromSession, getUserRoleFromId } from '@/actions/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { schemaNewPost } from '@/lib/schemaPost';

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@radix-ui/react-popover';
import {
	ArrowDown,
	ArrowUp,
	CalendarClock,
	ChevronDown,
	Flag,
	Pencil,
	ThumbsUp,
	Trash2,
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import RichTextEditor from './RichTextEditor';
import VoteButtons from './VoteButtons';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Tag from './ui/tag';
import { getAllTagsCatalog } from '@/actions/tag';
import { createNotification } from '@/actions/notification';
import { Badge } from './ui/badge';
import Link from 'next/link';

//La postCard que se renderizará
export default function PostCard({
	post,
	currentUser,
	comments: ssrComments = [],
	userVote,
	voteCount,
}: any) {
	const { id } = useParams();
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const [updateState, updatePostAction] = useActionState(
		async (state: any, payload: FormData) => {
			console.log('Payload recibido en action:', payload);
			console.log('Tags seleccionados:', selectedTags);
			const result = schemaNewPost.safeParse({
				title: payload.get('title'),
				body: payload.get('body'),
				tags: selectedTags.filter(Boolean),
			});

			if (!result.success) {
				return { success: false, error: 'El Post no es válido' };
			}
			const response = await updatePost(
				payload,
				selectedTags,
				id as string
			);

			//Notificación
			const userId = await getUserIdFromSession();
			const role = await getUserRoleFromId(userId);

			if (response.success && role === 'ADMIN' && post.userId) {
				await createNotification({
					userId: post.userId,
					type: 'EDIT',
					referenceId: id as string,
					createdByUserId: userId,
				});
			}

			return response;
		},
		undefined
	);
	const [userRole, setUserRole] = useState<string | null>(null);

	const [availableTags, setAvailableTags] = useState<{ label: string }[]>([]);
	useEffect(() => {
		getAllTagsCatalog().then((result) => {
			if (Object.hasOwnProperty.call(result, 'tags')) {
				setAvailableTags(result.tags);
			} else {
				console.error('Error al obtener tags:', result.errors);
			}
		});
	}, []);
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

	const router = useRouter();
	const searchParams = useSearchParams();

	const sortBy = searchParams.get('sortBy') || 'date';
	const order = searchParams.get('order') || 'desc';
	const highlightedId = searchParams.get('highlight');

	// RTK Query->obtener comentarios dinámicos según sort
	const {
		data: queryComments,
		isFetching: loadingComments,
		isError: errorComments,
	} = useGetCommentsByPostQuery({
		postId: post.postId,
		sortBy,
		order,
	});

	// primero datos del hook, si aún no, fallback a SSR
	const effectiveComments = queryComments ?? ssrComments;

	const getLabelAndIcon = (sortBy: string, order: string) => {
		if (sortBy === 'votes' && order === 'desc')
			return {
				label: 'Más votados',
				icon: <ThumbsUp className="w-4 h-4" />,
			};

		if (sortBy === 'votes' && order === 'asc')
			return {
				label: 'Menos votados',
				icon: <ArrowDown className="w-4 h-4" />,
			};

		if (sortBy === 'date' && order === 'desc')
			return {
				label: 'Más recientes',
				icon: <CalendarClock className="w-4 h-4" />,
			};

		return { label: 'Más antiguos', icon: <ArrowUp className="w-4 h-4" /> };
	};

	const currentOption = getLabelAndIcon(sortBy, order);

	const handleSort = (sortBy: string, order: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('sortBy', sortBy);
		params.set('order', order);
		router.push(`?${params.toString()}`);
	};

	//Variables
	//Primero las de edición de un post
	const [isEditing, setIsEditing] = useState(false);
	const [editTags, setEditTags] = useState(post?.tags);
	//Las que tienen que ver con los tags:
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const MAX_TAGS = 7;
	//Variables para hacer operaciones con los votos
	const [userVotes, setUserVotes] = useState<{ [id: string]: number }>({});
	const [showConfirm, setShowConfirm] = useState(false);
	const [showConfirm2, setShowConfirm2] = useState(false);
	//Función para cancelar la edición y regresarlo todo a la normalidad
	const handleCancel = () => {
		// Reset básico
		if (post.tags) setEditTags(post.tags);
		setIsEditing(false);
	};
	//Función para eliminar el post
	const handleDeleteClick = () => {
		setShowConfirm(true);
	};

	const handleReportClick = () => {
		setShowConfirm2(true);
	};

	const handleConfirmDelete = () => {
		if (post.postId) {
			handleDeletePost(post.postId);
			setShowConfirm(false); // Cierra el modal después de la acción
		}
	};

	const handleConfirmReport = () => {
		// handleReportPost no requiere argumento
		handleReportPost();
		setShowConfirm2(false);
	};

	// Función para manejar la votación
	const handleVote = (id: string, type: 'up' | 'down') => {
		const currentVote = userVotes[id] || 0;
		const desiredVote = type === 'up' ? 1 : -1;
		const newVote = currentVote === desiredVote ? 0 : desiredVote;
		setUserVotes((prev) => ({ ...prev, [id]: newVote }));
	};

	//Actualiza en la base de datos con esta id
	// const handleUpdatePost = (/* id: string, updatedPost: PostInfo */) => {
	// 	//EN PROCESO, esto necesita actualizar la base de datos y cambiar la info
	// };
	//Borra en la base de datos con esta id
	const handleDeletePost = async (postId: string) => {
		try {
			const result = await deletePost(postId);
			const userId = await getUserIdFromSession();
			const role = await getUserRoleFromId(userId);

			if (result?.success && result.postAuthorId && role === 'ADMIN') {
				await createNotification({
					userId: result.postAuthorId,
					type: 'DELETE',
					referenceId: postId as string,
					createdByUserId: userId as string,
				});
			}

			router.push('/');
		} catch (error) {
			console.error('Error al borrar post ', error);
		}
	};
	//Manda un reporte a la base de datos con esta id de post
	const handleReportPost = async () => {
		const currentUser = await getUserIdFromSession();
		if (!currentUser) return alert('Debes iniciar sesión para reportar.');

		if (window.confirm('¿Estás seguro de reportar este post?')) {
			try {
				const formData = new FormData();

				//userId es la Id del Creador de la request
				formData.append('userId', currentUser);
				formData.append('title', 'Post Reportado');
				formData.append('body', 'Un post ha sido reportado');
				formData.append('type', 'post');
				if (post.postId)
					formData.append('referencePostId', post.postId);

				await createRequest(formData);
			} catch (error) {
				console.error('Error al reportar post ', error);
			}
		}
	};
	//Manda un reporta a la base de datos con esta id de post y de comentario
	const handleReportComment = async (commentId: string) => {
		const currentUser = await getUserIdFromSession();
		if (!currentUser) return alert('Debes iniciar sesión para reportar.');

		try {
			const formData = new FormData();

			formData.append('userId', currentUser);
			formData.append('title', 'Comentario Reportado');
			formData.append('body', 'Un comentario ha sido reportado');
			formData.append('type', 'comment');

			if (post.postId) formData.append('referencePostId', post.postId);
			formData.append('referenceCommentId', commentId);

			await createRequest(formData);
		} catch (error) {
			console.error('Error al reportar comentario', error);
		}
	};

	const handleUpdateComment = () => {};

	// RTK Query delete comment mutation
	const [deleteCommentRtk] = useDeleteCommentMutation();
	const handleDeleteComment = async (commentId: string) => {
		try {
			await deleteCommentRtk({
				commentId,
				postId: post.postId,
				sortBy,
				order,
			});
			// Notificación ADMIN
			const userId = await getUserIdFromSession();
			const role = await getUserRoleFromId(userId);
			if (role === 'ADMIN') {
				await createNotification({
					userId: post.userId,
					type: 'DELETE',
					referenceId: post.postId,
					createdByUserId: userId,
				});
			}
		} catch (error) {
			console.error('Error al borrar comentario ', error);
		}
	};

	const handleTagToggle = (tag: string) => {
		if (selectedTags.length < MAX_TAGS) {
			setSelectedTags((prevTags) =>
				prevTags.includes(tag)
					? prevTags.filter((t) => t !== tag)
					: [...prevTags, tag]
			);
		}
		setSearchQuery('');
		setIsPopoverOpen(false);
	};
	//Deselecciona un tag
	const handleTagRemove = (tag: string) => {
		setSelectedTags((prevTags) => prevTags.filter((t) => t !== tag));
	};
	//Cosas de busqueda de tags
	const filteredTags = searchQuery
		? availableTags.filter(({ label }) =>
				label.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: availableTags;

	// Show error message if status throws error after render or success message
	useEffect(() => {
		// Manejo tipado flexible del resultado de updatePostAction
		if (updateState) {
			const anyState: any = updateState;
			if (anyState.errors) {
				const firstErr = Object.values(anyState.errors)[0];
				if (firstErr) toast.error(String(firstErr));
			}
			if (anyState.success) {
				toast.success('Post actualizado correctamente');
				setIsEditing(false);
			}
		}
	}, [updateState]);

	if (!post) {
		return <div className="text-center">Cargando...</div>;
	}
	return (
		<>
			<div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
				{/* Sección de Votos, Título y opciones*/}
				<div className="flex items-center mb-4">
					{/* Botones de Votos */}
					<div className="flex flex-col items-center mr-4">
						{/* Sección de votación para el post */}
						<VoteButtons
							postId={post.postId || ''}
							displayVotes={voteCount}
							userVote={userVote}
						/>
					</div>
					{/* Título */}
					{!isEditing ? (
						<>
							<h1 className="text-xl font-bold text-gray-800 break-words">
								{post?.title}
							</h1>
							{post.userId === currentUser ||
							userRole === 'ADMIN' ? (
								<div className="flex space-x-2 ml-auto">
									<>
										<Button
											size="icon"
											variant="ghost"
											onClick={() => {
												setIsEditing(true);
												if (post.tags) {
													setSelectedTags(post.tags);
												}
											}}>
											<Pencil className="w-5 h-5 text-gray-600 hover:text-gray-900"></Pencil>
										</Button>
										<Button
											size="icon"
											variant="ghost"
											onClick={handleDeleteClick}>
											<Trash2 className="w-5 h-5 text-red-600 hover:text-red-800"></Trash2>
										</Button>
									</>
								</div>
							) : (
								<div className="flex space-x-2 ml-auto">
									<Button
										size="icon"
										variant="ghost"
										onClick={handleReportClick}>
										<Flag className="w-5 h-5 text-gray-600 hover:text-gray-900" />
									</Button>
								</div>
							)}
						</>
					) : (
						<>
							<form
								id="editPost"
								name="editPost"
								className="flex items-center w-full"
								action={updatePostAction}>
								<div className="mt-2 w-full ">
									<Input
										name="title"
										defaultValue={post?.title}
									/>
								</div>
							</form>
						</>
					)}

					{/* Si el post es del usuario actual, mostramos botones de editar y eliminar. Si no, reportar */}
				</div>
				{/* Contenido del Post */}
				<div className="p-4 bg-gray-100 rounded-lg mb-4">
					<p className="text-gray-700"></p>
					{/* <CodeHighlighter text={post.body} /> */}
					<RichTextEditor
						form="editPost"
						content={post.body}
						readOnly={!isEditing}
					/>
				</div>
				{/* Footer: Tags y Autor */}
				<div className="flex justify-between items-center">
					{/* Sección de tags */}
					{!isEditing ? (
						<div className="flex justify-between items-center w-full">
							<div className="flex flex-wrap gap-2">
								{/* Tags */}
								{post.tags
									.slice(0, 7)
									.map((tag: any, index: any) => (
										<Tag key={index} label={tag} />
									))}
							</div>
						</div>
					) : (
						<div className="w-full flex flex-wrap">
							<div className="mb-4 w-full">
								<Popover
									open={isPopoverOpen}
									onOpenChange={setIsPopoverOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className="flex items-center gap-2"
											disabled={
												editTags.length >= MAX_TAGS
											}
											onClick={() => setSearchQuery('')}>
											Seleccionar Tags{' '}
											<ChevronDown className="w-4 h-4" />
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-56 p-0 ml-7 bg-white max-h-64 overflow-auto "
										asChild>
										<div className="bg-current">
											<div className="sticky top-0 z-10 p-2 bg-white">
												<Input
													placeholder="Buscar tag"
													value={searchQuery}
													onChange={(e) =>
														setSearchQuery(
															e.target.value
														)
													}
												/>
											</div>
											<div className="flex flex-col ">
												{filteredTags.length > 0
													? filteredTags.map(
															({ label }) => (
																<Button
																	key={label}
																	variant="outline"
																	className={`w-full text-left rounded-none  p-2 ${
																		selectedTags.includes(
																			label
																		)
																			? 'bg-blue-500 text-white'
																			: 'bg-white text-black  hover:bg-gray-100 border-slate-100 '
																	}`}
																	onClick={() =>
																		handleTagToggle(
																			label
																		)
																	}>
																	{label}
																</Button>
															)
														)
													: // Mostrar el mensaje solo si hay una búsqueda activa
														searchQuery && (
															<p className="text-gray-500 bg-white p-2 rounded-md">
																No se
																encontraron
																resultados
															</p>
														)}
											</div>
										</div>
									</PopoverContent>
								</Popover>
							</div>

							{/* Sección de tags seleccionados */}
							<div className="mb-4">
								<div className="flex gap-2 flex-wrap">
									{selectedTags.map((tagId: string) => {
										const tag = (
											availableTags as { label: string }[]
										).find((t) => t.label === tagId);
										if (!tag) return null;
										return (
											<Badge
												key={tagId}
												className="bg-blue-500 text-white cursor-pointer"
												onClick={() =>
													handleTagRemove(tagId)
												}>
												{tag.label}{' '}
												<span className="ml-1">x</span>
											</Badge>
										);
									})}
								</div>
							</div>
						</div>
					)}
					{/* Autor del Post */}
					<div className="flex items-center justify-end space-x-2">
						{/* Foto Circular */}

						<Avatar className="w-10 h-10 rounded-full object-cover">
							<AvatarImage src={post.authorAvatar} />
							<AvatarFallback>ID</AvatarFallback>
						</Avatar>
						{/* Nombre del Autor */}
						<Link href={`/user/${post.userId}`}>
							<div className="px-3 py-1 bg-gray-200 rounded-lg text-sm text-gray-700">
								{post.userName}
							</div>
						</Link>
					</div>
				</div>
				{isEditing && (
					<div className="w-full flex gap-2">
						<Button
							variant="default"
							form="editPost"
							type="submit"
							className="text-white">
							Guardar
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}>
							Cancelar
						</Button>
					</div>
				)}
				{/* Sección de comentarios */}
				{/* FIX: enviar postId/postAuthorId + sortBy/order para que el optimistic patch se aplique a la lista visible */}
				<CommentForm
					postId={post.postId}
					postAuthorId={post.userId}
					sortBy={sortBy}
					order={order}
				/>
				<div className="flex mt-4">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="flex items-center gap-2 bg-primary text-white ">
								{currentOption.icon}
								Ordenar por: {currentOption.label}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="bg-gray-300">
							<DropdownMenuItem
								onClick={() => handleSort('votes', 'desc')}
								className="cursor-pointer hover:bg-gray-100">
								Más votados
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleSort('votes', 'asc')}
								className="cursor-pointer hover:bg-gray-100">
								Menos votados
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleSort('date', 'desc')}
								className="cursor-pointer hover:bg-gray-100">
								Más recientes
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleSort('date', 'asc')}
								className="cursor-pointer hover:bg-gray-100">
								Más antiguos
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				{/* Indicadores de carga / error simples */}
				{loadingComments && (
					<p className="text-sm text-gray-500 mt-2">
						Cargando comentarios...
					</p>
				)}
				{errorComments && (
					<p className="text-sm text-red-500 mt-2">
						Error al cargar comentarios
					</p>
				)}
				<CommentList
					comments={effectiveComments}
					userVotes={userVotes}
					handleVote={handleVote}
					currentUser={currentUser}
					onDelete={handleDeleteComment}
					onUpdate={handleUpdateComment}
					onReport={handleReportComment}
					highlightedId={highlightedId || undefined}></CommentList>
			</div>

			{showConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-80">
						<h3 className="text-lg font-semibold text-black mb-4">
							Confirmar eliminación
						</h3>
						<p className="text-black mb-6">
							Estás a punto de eliminar este post de forma
							permanente. ¿Deseas continuar?
						</p>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowConfirm(false)}
								className="px-4 py-2 rounded bg-gray-400 text-black">
								Cancelar
							</button>
							<button
								onClick={() => handleConfirmDelete()}
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
							Confirmar Reporte
						</h3>
						<p className="text-black mb-6">
							Estás a punto de reportar este post ¿Deseas
							continuar?
						</p>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowConfirm2(false)}
								className="px-4 py-2 rounded bg-gray-400 text-black">
								Cancelar
							</button>
							<button
								onClick={() => handleConfirmReport()}
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
