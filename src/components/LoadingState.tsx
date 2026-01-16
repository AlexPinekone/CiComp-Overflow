import { Loader2, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
	type: 'initial' | 'loadingMore' | 'error' | 'empty' | 'noMore';
	onRetry?: () => void;
	message?: string;
	totalCount?: number;
}

export function LoadingState({
	type,
	onRetry,
	message,
	totalCount,
}: LoadingStateProps) {
	switch (type) {
		case 'initial':
			return (
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
						<p className="text-sm text-gray-500">
							Cargando posts...
						</p>
					</div>
				</div>
			);

		case 'loadingMore':
			return (
				<div className="flex items-center justify-center py-6">
					<div className="flex items-center gap-2">
						<Loader2 className="w-5 h-5 animate-spin text-blue-500" />
						<p className="text-sm text-gray-500">
							Cargando más posts...
						</p>
					</div>
				</div>
			);

		case 'error':
			return (
				<div className="flex flex-col items-center justify-center py-12 gap-4">
					<div className="flex flex-col items-center gap-2">
						<Wifi className="w-8 h-8 text-red-400" />
						<p className="text-sm text-red-500 text-center">
							{message || 'Error al cargar posts'}
						</p>
					</div>
					{onRetry && (
						<Button
							onClick={onRetry}
							variant="outline"
							size="sm"
							className="flex items-center gap-2">
							<RefreshCw className="w-4 h-4" />
							Reintentar
						</Button>
					)}
				</div>
			);

		case 'empty':
			return (
				<div className="flex flex-col items-center justify-center py-16 gap-3">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
						<span className="text-2xl">📝</span>
					</div>
					<div className="text-center">
						<p className="text-gray-500 font-medium">
							No se encontraron posts
						</p>
						<p className="text-sm text-gray-400 mt-1">
							{message ||
								'Intenta cambiar los filtros o crear un nuevo post'}
						</p>
					</div>
				</div>
			);

		case 'noMore':
			return (
				<div className="text-center py-8 border-t border-gray-100 mt-4">
					<div className="flex flex-col items-center gap-2">
						<div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
							<span className="text-xl">✅</span>
						</div>
						<p className="text-sm text-gray-500 font-medium">
							Has visto todos los posts disponibles
						</p>
						{totalCount && (
							<p className="text-xs text-gray-400">
								Total: {totalCount} posts cargados
							</p>
						)}
					</div>
				</div>
			);

		default:
			return null;
	}
}
