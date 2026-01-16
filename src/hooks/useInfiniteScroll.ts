import { useEffect, useCallback, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
	threshold?: number; // Distancia desde el fondo para triggerar (en pixels)
	hasMore: boolean;
	isLoading: boolean;
	isError?: boolean;
}

interface UseInfiniteScrollReturn {
	loadMoreRef: React.RefObject<HTMLDivElement | null>;
	isNearBottom: boolean;
}

export function useInfiniteScroll(
	onLoadMore: () => void,
	options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn {
	const { threshold = 200, hasMore, isLoading, isError = false } = options;
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const [isNearBottom, setIsNearBottom] = useState(false);

	const handleScroll = useCallback(() => {
		if (!hasMore || isLoading || isError) {
			setIsNearBottom(false);
			return;
		}

		const scrollTop =
			window.pageYOffset || document.documentElement.scrollTop;
		const scrollHeight = document.documentElement.scrollHeight;
		const clientHeight = document.documentElement.clientHeight;

		const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
		const nearBottom = distanceFromBottom <= threshold;

		// Asegurar que realmente estamos haciendo scroll hacia abajo
		const lastScrollTop = (window as any).lastScrollTop || 0;
		const scrollingDown = scrollTop > lastScrollTop;
		(window as any).lastScrollTop = scrollTop;

		setIsNearBottom(nearBottom);

		// Solo triggear si estamos haciendo scroll hacia abajo Y estamos cerca del fondo
		if (nearBottom && scrollingDown && scrollTop > 100) {
			// Además debe haber scrolleado al menos 100px
			(window as any).lastOnLoadMore = Date.now();
			onLoadMore();
		}
	}, [onLoadMore, hasMore, isLoading, isError, threshold]);

	useEffect(() => {
		const throttledHandleScroll = throttle(handleScroll, 100);

		window.addEventListener('scroll', throttledHandleScroll, {
			passive: true,
		});

		// Check immediately in case content is already shorter than screen
		handleScroll();

		return () => {
			window.removeEventListener('scroll', throttledHandleScroll);
		};
	}, [handleScroll]);

	// Intersection Observer como respaldo para casos edge
	useEffect(() => {
		const target = loadMoreRef.current;
		if (!target) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				// Solo triggear el intersection observer si el scroll handler no lo ha hecho recientemente
				const now = Date.now();
				const lastOnLoadMore = (window as any).lastOnLoadMore || 0;
				const timeSinceLastLoad = now - lastOnLoadMore;

				if (
					entry.isIntersecting &&
					hasMore &&
					!isLoading &&
					!isError &&
					timeSinceLastLoad > 2000 // 2 segundos para coincidir con el cooldown
				) {
					(window as any).lastOnLoadMore = now;
					onLoadMore();
				}
			},
			{
				rootMargin: `${Math.min(threshold, 10)}px`, // Limitar rootMargin
				threshold: 0.1,
			}
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [onLoadMore, hasMore, isLoading, isError, threshold]);

	return {
		loadMoreRef,
		isNearBottom,
	};
}

// Utility function to throttle scroll events
function throttle<T extends (...args: any[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout | null = null;
	let lastExecTime = 0;

	return (...args: Parameters<T>) => {
		const currentTime = Date.now();

		if (currentTime - lastExecTime > delay) {
			func(...args);
			lastExecTime = currentTime;
		} else {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			timeoutId = setTimeout(
				() => {
					func(...args);
					lastExecTime = Date.now();
				},
				delay - (currentTime - lastExecTime)
			);
		}
	};
}
