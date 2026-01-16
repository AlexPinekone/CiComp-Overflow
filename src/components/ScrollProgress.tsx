import { useMemo } from 'react';

interface ScrollProgressProps {
	currentCount: number;
	totalCount: number;
	isLoading?: boolean;
}

export function ScrollProgress({
	currentCount,
	totalCount,
	isLoading,
}: ScrollProgressProps) {
	const progress = useMemo(() => {
		if (!totalCount || totalCount === 0) return 0;
		return Math.min((currentCount / totalCount) * 100, 100);
	}, [currentCount, totalCount]);

	if (!totalCount || totalCount === 0) return null;

	return (
		<div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
			<div className="max-w-[1024px] mx-auto">
				<div className="flex items-center justify-between text-xs text-gray-500 mb-1">
					<span>
						{currentCount} de {totalCount} posts
					</span>
					<span>{Math.round(progress)}%</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-1">
					<div
						className={`h-1 rounded-full transition-all duration-300 ${
							isLoading
								? 'bg-blue-400 animate-pulse'
								: 'bg-blue-500'
						}`}
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
