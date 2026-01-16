import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
	useGetPostsQuery,
	GetPostsArgs,
	PostsResponse,
	PostItem,
} from '@/redux/services/postsApi';
import { useInfiniteScroll } from './useInfiniteScroll';

interface UseInfinitePostsOptions {
	filters?: Omit<GetPostsArgs, 'page' | 'limit'>;
	limit?: number;
	threshold?: number;
}

interface UseInfinitePostsReturn {
	posts: PostItem[];
	isLoading: boolean;
	isError: boolean;
	isFetchingNextPage: boolean;
	hasMore: boolean;
	error: any;
	loadMoreRef: React.RefObject<HTMLDivElement | null>;
	refetch: () => void;
	loadMore: () => void;
	currentPage: number;
	totalPages: number;
	total: number;
}

export function useInfinitePosts(
	options: UseInfinitePostsOptions = {}
): UseInfinitePostsReturn {
	const { filters = {}, limit = 10, threshold = 200 } = options;
	const [currentPage, setCurrentPage] = useState(1);
	const [allPosts, setAllPosts] = useState<PostItem[]>([]);
	const [totalInfo, setTotalInfo] = useState({ total: 0, totalPages: 0 });
	const isFirstLoad = useRef(true);
	const lastLoadedPage = useRef(1); // Rastrear la última página que se cargó exitosamente

	// Construir los argumentos para la query
	const queryArgs = useMemo(
		() => ({
			...filters,
			page: currentPage,
			limit,
		}),
		[filters, currentPage, limit]
	);

	// RTK Query hook
	const { data, isLoading, isError, error, isFetching, refetch } =
		useGetPostsQuery(queryArgs);

	// Effect para manejar nuevos datos
	useEffect(() => {
		if (data) {
			setTotalInfo({ total: data.total, totalPages: data.totalPages });

			if (data.page === 1) {
				// Primera página o reset
				setAllPosts(data.posts);
				isFirstLoad.current = false;
				lastLoadedPage.current = 1;
			} else {
				// Verificar que no estamos saltando páginas
				const expectedPage = lastLoadedPage.current + 1;
				if (data.page === expectedPage) {
					// Páginas adicionales - agregar al final evitando duplicados
					setAllPosts((prevPosts) => {
						const existingIds = new Set(
							prevPosts.map((p: PostItem) => p.postId)
						);
						const newPosts = data.posts.filter(
							(p: PostItem) => !existingIds.has(p.postId)
						);
						return [...prevPosts, ...newPosts];
					});
					lastLoadedPage.current = data.page;
				}
			}

			// Resetear el flag de loading después de procesar los datos con cooldown de 3 segundos
			setTimeout(() => {
				setIsLoadingMore(false);
			}, 2000); // 3 segundos de cooldown
		}
	}, [data]);

	// Calcular hasMore basado en la respuesta
	const hasMore = useMemo(() => {
		return currentPage < totalInfo.totalPages;
	}, [currentPage, totalInfo.totalPages]);

	// Función para cargar más posts con debounce
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const loadMore = useCallback(() => {
		const nextPage = lastLoadedPage.current + 1;

		// Evitar llamadas múltiples con debounce
		if (isLoadingMore) {
			return;
		}

		// Solo cargar la siguiente página secuencial
		if (
			!isLoading &&
			!isFetching &&
			hasMore &&
			nextPage <= totalInfo.totalPages
		) {
			setIsLoadingMore(true);
			setCurrentPage(nextPage);
		}
	}, [
		isLoading,
		isFetching,
		hasMore,
		currentPage,
		totalInfo.totalPages,
		isLoadingMore,
	]);

	// Hook de scroll infinito
	const { loadMoreRef } = useInfiniteScroll(loadMore, {
		hasMore,
		isLoading: isLoading || isFetching,
		isError,
		threshold,
	});

	// Effect para resetear cuando cambien los filtros
	const filtersKey = JSON.stringify(filters);
	const [previousFiltersKey, setPreviousFiltersKey] = useState(filtersKey);

	useEffect(() => {
		if (filtersKey !== previousFiltersKey) {
			setCurrentPage(1);
			setAllPosts([]);
			setTotalInfo({ total: 0, totalPages: 0 });
			setIsLoadingMore(false);
			setPreviousFiltersKey(filtersKey);
			isFirstLoad.current = true;
			lastLoadedPage.current = 1;
		}
	}, [filtersKey, previousFiltersKey]);

	// Función de refetch personalizada que resetea la página
	const customRefetch = useCallback(() => {
		setCurrentPage(1);
		setAllPosts([]);
		setTotalInfo({ total: 0, totalPages: 0 });
		setIsLoadingMore(false);
		isFirstLoad.current = true;
		lastLoadedPage.current = 1;
		refetch();
	}, [refetch]);

	return {
		posts: allPosts,
		isLoading: isLoading && isFirstLoad.current,
		isError,
		isFetchingNextPage: isFetching && currentPage > 1,
		hasMore,
		error,
		loadMoreRef,
		refetch: customRefetch,
		loadMore,
		currentPage,
		totalPages: totalInfo.totalPages,
		total: totalInfo.total,
	};
}
