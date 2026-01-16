'use client';

import {
	getUserFromSession,
	getUserIdFromSession,
	getUserProfileDataBySessionOrId,
} from '@/actions/user';
import { UserRole } from '@/constants/session';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import {
	User as AccountCircleIcon,
	Bell as NotificationsIcon,
	Search as SearchIcon,
	Check as CheckIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ciCompLogo from '../../public/ciCompLogo.svg';
import { SessionContext } from '@/providers/SessionProvider';
import { queryClient } from '@/providers/Providers';
import FloatingModal from './FloatingRequest';
import {
	deleteAllNotificationsByUserId,
	getNotificationsByUserId,
	markNotificationAsRead,
} from '@/actions/notification';
import { getPostIdByCommentId } from '@/actions/comment';

/*const notifications = [
	{
		userName: 'MasterChief08',
		type: 'Han respondido tu pregunta.',
		description:
			'Quizás deberías intentar con utilizar Bootstrap para una mejor experiencia de usuario.',
	},
	{
		userName: 'CortanaAI',
		type: 'Han respondido tu pregunta.',
		description:
			'Puedes usar inteligencia artificial para resolver este problema.',
	},
	{
		userName: 'Arbiter117',
		type: 'Votó positivamente tu post.',
		description: 'Tu respuesta sobre patrones de diseño fue muy útil.',
	},
	{
		userName: 'Echo419',
		type: 'Le gustó tu comentario.',
		description:
			'Tu publicación sobre optimización de código ha sido compartida.',
	},
	{
		userName: 'GuiltySpark343',
		type: 'Votó positivamente tu post.',
		description: 'Gracias por tu ayuda con la configuración del servidor.',
	},
	{
		userName: 'SergeantJohnson',
		type: 'Le gustó tu comentario.',
		description: 'Ahora puedes ver sus publicaciones y comentarios.',
	},
];*/

interface UserCredentials {
	userId?: string;
	role?: string;
}

export default function AppBar() {
	const [searchValue, setSearchValue] = useState<string>('');
	const [notifications, setNotifications] = useState<any[]>([]);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const router = useRouter();
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && searchValue.trim() !== '') {
			router.push(
				`/search?q=${encodeURIComponent(searchValue.trim())}&page=1`
			);
		}
	};
	const [open, setOpen] = useState(false);
	const sessionContext = useContext(SessionContext);
	const session = sessionContext?.session;

	useEffect(() => {
		const fetchNotifications = async () => {
			if (!session) {
				//console.log('⚠️ No hay sesión activa');
				setNotifications([]);
				return;
			}

			const userId = await getUserIdFromSession();
			//console.log('🔍 UserID:', userId);

			const result = await getNotificationsByUserId(userId);

			if (!result?.notifications || result.notifications.length === 0) {
				console.log('📭 No hay notificaciones');
				setNotifications([]);
				return;
			}

			// Mostrar todas las notificaciones (leídas y no leídas)
			const allNotifications = result.notifications;

			if (allNotifications.length === 0) {
				//console.log('📭 No hay notificaciones');
				setNotifications([]);
				return;
			}

			const enrichedNotifications = await Promise.all(
				allNotifications.map(async (notification: any) => {
					try {
						const userData = await getUserProfileDataBySessionOrId(
							notification.createdByUserId as string
						);

						let message = '';
						let postId = null;

						// Si es de comentario, busca el postId
						if (
							notification.type === 'ANSWER' &&
							notification.referenceId
						) {
							postId = await getPostIdByCommentId(
								notification.referenceId
							);
						}

						switch (notification.type) {
							case 'DELETE':
								message =
									'Tu contenido fue eliminado por un administrador.';
								break;
							case 'EDIT':
								message =
									'Tu contenido fue editado por un administrador.';
								break;
							case 'LIKE':
								message = `${userData?.userName || 'Alguien'} dio like a tu post.`;
								break;
							case 'ANSWER':
								message = `${userData?.userName || 'Alguien'} respondió a tu post.`;
								break;
							case 'REQUEST':
								message = `Tu reporte ha sido revisado`;
								break;
							default:
								message = 'Tienes una nueva notificación.';
						}

						return {
							...notification,
							referenceUserName:
								userData?.userName || 'Desconocido',
							referencePhoto: userData?.photo || null,
							message: message,
							postId: postId,
						};
					} catch (error) {
						console.warn(
							'⚠️ Error al obtener datos del usuario',
							error
						);
						return {
							...notification,
							referenceUserName: 'Desconocido',
							referencePhoto: null,
							message: 'Tienes una nueva notificación.',
						};
					}
				})
			);

			//console.log('📬 Notificaciones cargadas:', enrichedNotifications);
			setNotifications(enrichedNotifications);
		};

		fetchNotifications();
	}, [session]);

	const logout = () => {
		fetch(`/api/user/${session?.userId}/logout`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(() => {
				router.push('/login');
				queryClient.invalidateQueries(['session']);
			})
			.catch(() => {
				toast.error('Error al cerrar sesión. Intenta nuevamente.');
			});
	};

	const handleMarkAsRead = async (id: string) => {
		//console.log('Marcando como leída:', id);
		const result = await markNotificationAsRead(id as string);

		if (result.success) {
			setNotifications((prev) =>
				prev.map((notification) =>
					notification.userNotificationId === id
						? { ...notification, status: 'READ' }
						: notification
				)
			);
		} else {
			console.error(
				'❌ Error al marcar como leída:',
				result.errors?.general?.[0] || 'Error desconocido'
			);
		}
	};

	const handleLinkClick = async (notificationId: string) => {
		await handleMarkAsRead(notificationId);
		setOpen(false);
	};

	const handleDeleteAll = async () => {
		if (isDeleting) return; // Evitar múltiples clics

		const userId = await getUserIdFromSession();

		if (!userId) {
			console.error('❌ Error: UserID no encontrado en la sesión');
			toast.error('Error al obtener información del usuario');
			return;
		}

		try {
			setIsDeleting(true);
			//console.log('🗑️ Eliminando todas las notificaciones...');
			const result = await deleteAllNotificationsByUserId(userId);

			if (result.success) {
				setNotifications([]);
				setOpen(false);
				//console.log('✅ Todas las notificaciones eliminadas.');
				toast.success('Todas las notificaciones han sido eliminadas');
			} else {
				console.error(
					'❌ Error al eliminar todas las notificaciones:',
					result.errors?.general?.[0] || 'Error desconocido'
				);
				toast.error('Error al eliminar las notificaciones');
			}
		} catch (error) {
			//console.error('❌ Error inesperado:', error);
			toast.error('Error inesperado al eliminar las notificaciones');
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex justify-between items-center bg-gray-800 p-4 relative max-w-full overflow-hidden sm:flex-col sm:gap-4 min-h-fit sm:text-center">
			<div className="flex items-center space-x-4">
				<div className="w-12 h-12">
					<Link href="/">
						<Image
							src={ciCompLogo}
							alt="Logo"
							className="w-12 h-12"
						/>
					</Link>
				</div>
				<Link href="/">
					<span className="text-white text-xl">CiComp Overflow</span>
				</Link>
			</div>

			<div className="flex-grow flex justify-center">
				<div className="relative w-96">
					<Input
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						onKeyDown={handleKeyDown}
						className="w-full px-4 py-2 text-white bg-gray-700 rounded-md"
						placeholder="Search..."
					/>
					<div
						className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
						onClick={() => {
							if (searchValue.trim() !== '') {
								router.push(
									`/search?q=${encodeURIComponent(searchValue.trim())}&page=1`
								);
							}
						}}>
						<SearchIcon className="text-white" />
					</div>
				</div>
			</div>

			<div className="flex items-center space-x-4 sm:justify-end sm:w-full">
				{session?.role ? (
					<>
						<Sheet open={open} onOpenChange={setOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="text-white">
									<NotificationsIcon />
								</Button>
							</SheetTrigger>
							<SheetContent className="w-96 sm:w-full sm:max-w-full">
								<SheetHeader>
									<SheetTitle>
										Notificaciones
										{notifications.length > 0 && (
											<button
												onClick={handleDeleteAll}
												disabled={isDeleting}
												className={`text-sm ml-4 transition-colors ${
													isDeleting
														? 'text-gray-400 cursor-not-allowed'
														: 'text-red-500 hover:underline hover:text-red-600'
												}`}>
												{isDeleting
													? 'Eliminando...'
													: 'Eliminar todo'}
											</button>
										)}
									</SheetTitle>
									<SheetDescription>
										{notifications.map(
											(notification, index) => (
												<div
													key={
														notification.id ?? index
													}
													className={`relative flex text-left py-4 px-2 flex-col gap-2 shadow-md rounded-lg overflow-hidden transition-all duration-200 text-sm hover:shadow-lg ${
														notification.status ===
														'READ'
															? 'bg-gray-200 text-gray-500 opacity-70'
															: 'bg-background'
													}`}>
													<Link
														href={
															notification.type ===
																'ANSWER' &&
															notification.postId
																? `/posts/${notification.postId}?highlight=${notification.referenceId}`
																: `/posts/${notification.postId || notification.referenceId}`
														}
														className="w-full hover:underline hover:*:scale-105"
														onClick={() => {
															handleLinkClick(
																notification.userNotificationId
															);
														}}>
														<div className="flex gap-2 items-center">
															<p
																className={`font-bold ${
																	notification.status ===
																	'READ'
																		? 'text-gray-400'
																		: ''
																}`}>
																{
																	notification.referenceUserName
																}
															</p>
															<p
																className={
																	notification.status ===
																	'READ'
																		? 'text-gray-400'
																		: ''
																}>
																{
																	notification.type
																}
																&nbsp;
															</p>
														</div>
														<i
															className={`font-light line-clamp-1 overflow-hidden text-ellipsis ${
																notification.status ===
																'READ'
																	? 'text-gray-400'
																	: 'text-primary'
															}`}>
															{
																notification.message
															}
														</i>
													</Link>

													{/* Botón para marcar como leído */}
													<button
														onClick={() =>
															handleMarkAsRead(
																notification.userNotificationId
															)
														}
														className={`absolute top-2 right-2 transition-colors ${
															notification.status ===
															'READ'
																? 'text-gray-400 hover:text-gray-500'
																: 'text-blue-500 hover:text-blue-600'
														}`}
														title={
															notification.status ===
															'READ'
																? 'Notificación leída'
																: 'Marcar como leído'
														}>
														<CheckIcon size={16} />
													</button>
												</div>
											)
										)}
									</SheetDescription>
								</SheetHeader>
							</SheetContent>
						</Sheet>

						<DropdownMenu>
							<DropdownMenuTrigger className="text-white">
								<AccountCircleIcon />
							</DropdownMenuTrigger>
							<DropdownMenuContent className="text-black w-48 bg-background">
								<DropdownMenuLabel>
									{session?.userName}
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Link
										href={`/user/${session.userId}`}
										className="block w-full">
										Perfil
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link
										href={`/profile/${session.userId}`}
										className="block w-full">
										Configuración
									</Link>
								</DropdownMenuItem>
								{session.role === UserRole.ADMIN && (
									<DropdownMenuItem>
										<Link
											href={`/admin/${session.userId}`}
											className="block w-full">
											Panel de Administrador
										</Link>
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									onClick={logout}
									className="text-red-500">
									Cerrar sesión
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				) : (
					<Link href="/login" className="block w-full text-white">
						Iniciar Sesion
					</Link>
				)}
			</div>
			<div>{session?.role ? <FloatingModal /> : <></>}</div>
		</div>
	);
}
