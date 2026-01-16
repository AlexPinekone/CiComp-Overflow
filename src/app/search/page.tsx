'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchPosts, searchPostsByVotes } from '@/actions/post';
import PostCard from '@/components/post';
import Link from 'next/link';
import PaginationControls from '@/components/PaginationControls';

export default function SearchPage() {
	const searchParams = useSearchParams();
	const query = searchParams.get('q')?.toLowerCase() || '';

	const [posts, setPosts] = useState<any[]>([]);
	const [orderBy, setOrderBy] = useState<'newest' | 'oldest' | 'votes'>(
		'newest'
	);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);

	const normalize = (str: string) =>
		str
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');

	useEffect(() => {
		const fetchPosts = async () => {
			setLoading(true);

			const res =
				orderBy === 'votes'
					? await searchPostsByVotes(query, page, 10)
					: await searchPosts(query, orderBy, page, 10);

			if (!res.errors) {
				setPosts(res.posts);
				setTotalPages(res.totalPages || 1);
			} else {
				console.error('Error al obtener los posts:', res.errors);
				setPosts([]);
				setTotalPages(1);
			}
			setLoading(false);
		};
		fetchPosts();
	}, [query, orderBy, page]);

	const handleOrderChange = (newOrder: 'newest' | 'oldest' | 'votes') => {
		setOrderBy(newOrder);
		setPage(1);
	};

	return (
		<main className="min-h-screen p-4">
			<h1 className="text-2xl font-bold mb-4">Resultados de búsqueda</h1>
			<p className="text-lg mb-4">
				Término: <span className="font-semibold">{query}</span>
			</p>

			{/* Botones para ordenar */}
			<div className="flex gap-4 mb-4">
				<button
					className={`px-4 py-2 rounded-md ${
						orderBy === 'newest'
							? 'bg-primary text-white'
							: 'bg-gray-200'
					}`}
					onClick={() => {
						setOrderBy('newest');
						setPage(1);
					}}>
					Más Recientes
				</button>
				<button
					className={`px-4 py-2 rounded-md ${
						orderBy === 'oldest'
							? 'bg-primary text-white'
							: 'bg-gray-200'
					}`}
					onClick={() => {
						setOrderBy('oldest');
						setPage(1);
					}}>
					Más Antiguos
				</button>
				<button
					className={`px-4 py-2 rounded-md ${
						orderBy === 'votes'
							? 'bg-primary text-white'
							: 'bg-gray-200'
					}`}
					onClick={() => {
						setOrderBy('votes');
						setPage(1);
					}}>
					Más Votados
				</button>
			</div>

			{/* Loader */}
			{loading && (
				<p className="text-center text-gray-500 mt-4">Cargando...</p>
			)}

			{/* Lista de posts */}
			{!loading && posts.length > 0 ? (
				<div className="grid gap-4">
					{posts.map((post: any) => (
						<Link href={`/posts/${post.postId}`} key={post.postId}>
							<PostCard post={post} />
						</Link>
					))}
				</div>
			) : !loading ? (
				<p className="text-gray-600">No se encontraron resultados.</p>
			) : null}

			{/* Controles de paginación */}
			{!loading && posts.length > 0 && (
				<PaginationControls
					page={page}
					totalPages={totalPages}
					onPageChange={setPage} // solo pasa la función para actualizar página
				/>
			)}
		</main>
	);
}
