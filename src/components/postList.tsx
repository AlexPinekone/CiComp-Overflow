'use client';
import { getAllTagsCatalog } from '@/actions/tag';
import PostCard from '@/components/post';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, Loader2, RefreshCw } from 'lucide-react';
import Form from 'next/form';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { PostDateFilter } from '@/constants/post';
import { useInfinitePosts } from '@/hooks/useInfinitePosts';
import { LoadingState } from '@/components/LoadingState';
export default function PostList() {
	const [showAdvancedDate, setShowAdvancedDate] = useState(false);
	const [tags, setTags] = useState([]);
	const router = useRouter();
	const pathName = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		getAllTagsCatalog().then((response) => {
			if (response.errors) {
				toast.error(response.errors.general);
				return;
			}
			setTags(response.tags);
		});
	}, []);

	const toggleAdvancedDate = () => {
		setShowAdvancedDate(!showAdvancedDate);
	};

	const clearSearchParams = () => {
		router.push(pathName);
	};

	// Extraer parámetros relevantes para query
	const filters = useMemo(
		() => ({
			publishedDate: searchParams.get('publishedDate') || undefined,
			tag: searchParams.get('tag') || undefined,
			since: searchParams.get('since') || undefined,
			until: searchParams.get('until') || undefined,
			orderBy: 'newest' as const,
		}),
		[searchParams]
	);

	// Usar el hook de scroll infinito
	const {
		posts,
		isLoading,
		isError,
		isFetchingNextPage,
		hasMore,
		loadMoreRef,
		refetch,
		loadMore,
		total,
		currentPage,
		totalPages,
	} = useInfinitePosts({
		filters,
		limit: 10,
		threshold: 20, // Reducir threshold drasticamente
	});

	const [open, setOpen] = useState(false);
	return (
		<>
			<div className="p-8 flex flex-col gap-4 bg-white self-center rounded-lg my-8 w-full max-w-[1024px] min-h-full grow">
				<section className="flex justify-between items-center">
					<div className="text-sm text-gray-500">
						{!isLoading && posts.length > 0 && (
							<span>{posts.length} posts encontrados</span>
						)}
					</div>
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<Button
								variant="outline"
								className="aspect-square size-2! p-0">
								<Filter />
							</Button>
						</SheetTrigger>
						<SheetContent className="w-[360px] sm:w-full ">
							<Form
								replace={true}
								prefetch={false}
								onSubmit={() => setOpen(false)}
								className="flex flex-col *:w-full *:[&:not(label)]:mt-4"
								action={''}>
								<SheetHeader>
									<SheetTitle>Filtrar</SheetTitle>
									<SheetDescription className="text-left">
										Usa los filtros para encontrar
										resultados específicos.
									</SheetDescription>
								</SheetHeader>
								<Label htmlFor="publishedDate">
									Fecha de publicación
								</Label>
								<Select
									name="publishedDate"
									disabled={showAdvancedDate}>
									<SelectTrigger id="publishedDate">
										<SelectValue placeholder="Selecciona una fecha de publicación" />
									</SelectTrigger>
									<SelectContent className="max-h-60 overflow-y-auto bg-background">
										<SelectItem
											value={
												PostDateFilter.LAST_24_HOURS
											}>
											Ultimas 24 horas
										</SelectItem>
										<SelectItem
											value={PostDateFilter.LAST_WEEK}>
											Ultimos 7 días
										</SelectItem>
										<SelectItem
											value={PostDateFilter.LAST_MONTH}>
											Ultimos 30 días
										</SelectItem>
										<SelectItem
											value={
												PostDateFilter.LAST_6_MONTHS
											}>
											Ultimos 6 meses
										</SelectItem>
										<SelectItem
											value={PostDateFilter.LAST_YEAR}>
											Ultimo año
										</SelectItem>
										<SelectItem value={PostDateFilter.ALL}>
											Todo el tiempo
										</SelectItem>
									</SelectContent>
								</Select>
								<div className="flex gap-2">
									<Checkbox
										id="advancedDate"
										onCheckedChange={toggleAdvancedDate}
									/>
									<Label htmlFor="advancedDate">
										Avanzado
									</Label>
								</div>
								{showAdvancedDate && (
									<div className="flex flex-col">
										<Label className="mt-4" htmlFor="since">
											Desde
										</Label>
										<Input
											type="date"
											name="since"
											placeholder="Desde"
										/>
										<Label className="mt-4" htmlFor="until">
											Hasta
										</Label>
										<Input
											type="date"
											name="until"
											placeholder="Hasta"
										/>
									</div>
								)}
								<Label className="mt-4" htmlFor="tag">
									Seleccionar etiquetas
								</Label>
								<Select name="tag">
									<SelectTrigger id="tag">
										<SelectValue placeholder="Selecciona una etiqueta" />
									</SelectTrigger>
									<SelectContent className="max-h-60 overflow-y-auto bg-background">
										{tags.map((tag: any) => (
											<SelectItem
												key={tag.tagId}
												value={tag.label}>
												{tag.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<SheetFooter className="flex content-between gap-4 mt-4 row">
									<Button
										type="submit"
										variant="default"
										className=" mt-2 text-white">
										Aplicar
									</Button>
									<SheetClose asChild>
										<Button
											variant="outline"
											type="button"
											className=" mt-2"
											onClick={clearSearchParams}>
											Cancelar
										</Button>
									</SheetClose>
								</SheetFooter>
							</Form>
						</SheetContent>
					</Sheet>
				</section>
				{isLoading && <LoadingState type="initial" />}

				{isError && (
					<LoadingState
						type="error"
						onRetry={refetch}
						message="Error al cargar posts. Revisa tu conexión a internet."
					/>
				)}

				{!isLoading && !isError && posts.length === 0 && (
					<LoadingState
						type="empty"
						message="Intenta cambiar los filtros o crear un nuevo post"
					/>
				)}

				{posts.map((post: any) => (
					<Link
						className="w-full"
						href={`/posts/${post.postId}`}
						key={post.postId}>
						<PostCard key={post.postId} post={post} />
					</Link>
				))}

				{/* Elemento de referencia para scroll infinito */}
				<div ref={loadMoreRef}>
					{isFetchingNextPage && <LoadingState type="loadingMore" />}

					{/* Espacio para el trigger de scroll infinito */}
					{hasMore && !isFetchingNextPage && (
						<div className="text-center py-6">
							<p className="text-xs text-gray-400">
								Continúa scrolling para ver más posts
							</p>
						</div>
					)}

					{!hasMore && posts.length > 0 && (
						<LoadingState type="noMore" totalCount={total} />
					)}
				</div>
			</div>
		</>
	);
}
