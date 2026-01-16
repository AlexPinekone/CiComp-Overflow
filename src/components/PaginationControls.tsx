'use client';

interface PaginationControlsProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export default function PaginationControls({
	page,
	totalPages,
	onPageChange,
}: PaginationControlsProps) {
	return (
		<div className="flex justify-center space-x-2 mt-4">
			<button
				disabled={page === 1}
				onClick={() => onPageChange(page - 1)}
				className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
				Anterior
			</button>
			<span>
				Página {page} de {totalPages}
			</span>
			<button
				disabled={page === totalPages}
				onClick={() => onPageChange(page + 1)}
				className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
				Siguiente
			</button>
		</div>
	);
}
