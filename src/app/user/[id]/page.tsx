'use client';

import { getUserPostsByIdPaginated } from '@/actions/post';
import { getProfileById, updateProfileStatus } from '@/actions/profile';
import { createRequest } from '@/actions/requests';
import {
	getUserIdFromSession,
	getUserProfileDataBySessionOrId,
	getUserRoleFromSession,
} from '@/actions/user';
import Medal from '@/components/Medal';
import PaginationControls from '@/components/PaginationControls';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/constants/session';
import { AvatarImage } from '@radix-ui/react-avatar';
import {
	ArrowUpDownIcon,
	BadgeCheckIcon,
	Flag,
	StarIcon,
	Trash2,
	TrophyIcon,
	User,
} from 'lucide-react'; // Iconos de medalla
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Datos mock del usuario
const user = {
	profileId: '1',
	userId: '1',
	photo: 'https://img.freepik.com/foto-gratis/adorable-beagle-cachorro-solo-retrato_53876-64816.jpg?semt=ais_hybrid',
	username: 'Perrito',
	description:
		'Hola, soy Perrito y me encanta compartir conocimiento sobre programación.',
};

export default function UserProfilePage() {
	const { id } = useParams(); // * Obtiene el ID del usuario de la URL para cargar sus datos

	const [posts, setPosts] = useState([]);
	const [ascending, setAscending] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [userRole, setUserRole] = useState<string | null>(null);

	const [userData, setUserData] = useState({});

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);

	const isAdmin = userData?.role === UserRole.ADMIN;
	const isCurrentUser = userData?.userId === id;

	useEffect(() => {
		getUserProfileDataBySessionOrId(id as string).then((data) => {
			if (data) {
				setUserData(data);
			}
		});
	}, [id]);

	useEffect(() => {
		const fetchUserRole = async () => {
			if (!user.profileId) return;

			try {
				const role = await getUserRoleFromSession();
				setUserRole(role);
			} catch (error) {
				console.error('Error fetching user role:', error);
			}
		};

		fetchUserRole();
	}, []);

	const toggleSortOrder = () => {
		setAscending(!ascending);
		/*
		setPosts(
			[...posts].sort((a: any, b: any) =>
				ascending
					? b.date.getTime() - a.date.getTime()
					: a.date.getTime() - b.date.getTime()
			)
		);*/
		setPage(1);
	};

	/*
	useEffect(() => {
		if (id && typeof id === 'string') {
			getUserPostsById(id).then((data) => {
				if (data.posts) {
					setPosts(data.posts);
				}
			});
		}
	}, [id]);*/

	const handleBanClick = () => {
		handleBanUser();
	};

	const handleBanUser = async () => {
		const profile = await getProfileById(id as string);
		if (window.confirm('¿Estás seguro de banear este usuario?')) {
			try {
				updateProfileStatus(profile.profileId, 'BANNED');
			} catch (error) {
				console.error('Error al banear al usuario:', error);
			}
		}
	};

	const handleReportUser = async () => {
		const currentUser = await getUserIdFromSession();
		if (!currentUser) return alert('Debes iniciar sesión para reportar.');

		if (window.confirm('¿Estás seguro de reportar este usuario?')) {
			try {
				const formData = new FormData();
				const currentUser = await getUserIdFromSession();
				//userId es la Id del Creador de la request
				formData.append('userId', currentUser);
				formData.append('title', 'Usuario Reportado');
				formData.append('body', 'Un usuario ha sido reportado');
				formData.append('type', 'user');
				formData.append('referenceUserId', id as string);
				await createRequest(formData);
			} catch (error) {
				console.error('Error al reportar el usuario: ', id, error);
			}
		}
	};

	const fetchPosts = async () => {
		if (!id) return;
		setLoading(true);

		try {
			const res = await getUserPostsByIdPaginated(
				id as string,
				ascending ? 'newest' : 'oldest',
				page,
				5
			);

			if (!res.errors) {
				setPosts(res.posts);
				setTotalPages(res.totalPages || 1);
			} else {
				setPosts([]);
				setTotalPages(1);
				console.error('Error al obtener posts:', res.errors);
			}
		} catch (error) {
			setPosts([]);
			setTotalPages(1);
			console.error(error);
		}

		setLoading(false);
	};

	useEffect(() => {
		fetchPosts();
	}, [id, page, ascending]);

	return (
		<div className="max-w-3xl mx-auto p-6 bg-gray-50">
			{/* Sección de Perfil */}
			<div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md relative">
				{/* Foto de Perfil */}
				<div className="relative" onClick={() => setIsModalOpen(true)}>
					<Avatar className="size-64 rounded-full overflow-hidden border-4 border-tertiary shadow-md cursor-pointer hover:opacity-80 transition-opacity">
						<AvatarImage
							src={userData.photo}
							alt="Foto de perfil"
							className="rounded-full w-full aspect-square  object-cover"
						/>
						<AvatarFallback className="bg-gray-200 text-gray-500  w-full aspect-square text-4xl">
							{`${userData.name?.charAt(0) ?? ''}${
								userData.lastName?.charAt(0) ?? ''
							}`}
						</AvatarFallback>
					</Avatar>
					{isAdmin && !isCurrentUser && (
						<>
							<div className="flex space-x-2 ml-auto absolute top-4 right-4">
								<Button
									size="icon"
									className="bg-red-600 text-white rounded-full hover:bg-white hover:text-red-600 border border-red-600 shadow-md"
									variant="ghost"
									onClick={handleBanClick}>
									<Trash2 className="w-5 h-5" />
								</Button>
							</div>
							<Link
								href={`/profile/${id}`}
								className="flex space-x-2 ml-auto absolute top-16 -right-2 rounded-full bg-white border border-black/5 p-2 shadow-md hover:bg-primary hover:text-white">
								<User className="w-5 h-5" />
							</Link>
						</>
					)}
					{!isCurrentUser && (
						<div className="flex space-x-2 ml-auto absolute bottom-4 right-4">
							<Button
								size="icon"
								className="rounded-full border border-black/5 bg-white text-primary hover:bg-primary hover:text-white"
								variant="ghost"
								onClick={() =>
									handleReportUser(user.profileId)
								}>
								<Flag className="w-5 h-5" />
							</Button>
						</div>
					)}
				</div>

				{/* Nombre y descripción */}
				<div className="text-center mt-4">
					{/* <UserName name={userData.userName} /> */}
					<h1 className="text-2xl font-bold text-primary">
						{[userData.name, userData?.lastName].join(' ')}
					</h1>
					<p className="mt-2 text-gray-600 text-sm max-w-xs">
						@{userData.userName}
					</p>
					<p className="mt-2 text-gray-600 text-sm max-w-xs">
						{userData.description}
					</p>
				</div>
			</div>

			{/* Sección de Publicaciones */}
			<div className="mt-6">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-bold text-gray-800">
						Publicaciones
					</h2>
					<Button
						onClick={toggleSortOrder}
						className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary">
						<ArrowUpDownIcon size={20} />
						<span>
							{ascending
								? 'Más recientes primero'
								: 'Más antiguas primero'}
						</span>
					</Button>
				</div>

				{loading ? (
					<p className="text-center text-gray-500 mt-4">
						Cargando...
					</p>
				) : posts.length > 0 ? (
					<>
						{posts.map((post: any) => (
							<div
								key={post.postId}
								className="border border-gray-300 rounded-lg p-5 mb-4 bg-white shadow-md transition-transform transform hover:scale-105 hover:shadow-lg">
								<h3 className="text-xl font-semibold mb-2 text-primary">
									{post.title}
								</h3>
								<p className="text-gray-700 mb-3">
									{post.body}
								</p>
								<p className="mb-2 text-sm text-gray-500">
									Publicado el{' '}
									{new Date(
										post.createdAt
									).toLocaleDateString('es-MX')}
								</p>
								<Link
									href={`/posts/${post.postId}`}
									className="text-secondary font-medium hover:underline">
									Ver post completo →
								</Link>
							</div>
						))}

						{/* Paginación */}
						<PaginationControls
							page={page}
							totalPages={totalPages}
							onPageChange={setPage}
						/>
					</>
				) : (
					<p className="text-gray-500 text-center">
						Este usuario aún no ha publicado nada.
					</p>
				)}
			</div>
		</div>
	);
}
