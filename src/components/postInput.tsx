'use client';

import { useAddPostMutation } from '@/redux/services/postsApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';
import { getAllTagsCatalog } from '@/actions/tag';

function PostInput() {
	const [addPost, { isLoading }] = useAddPostMutation();
	const [isOpen, setIsOpen] = useState(false);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [validationError, setValidationError] = useState('');
	const [availableTags, setAvailableTags] = useState<{ label: string }[]>([]);
	const searchParams = useSearchParams();

	useEffect(() => {
		(async () => {
			const result = await getAllTagsCatalog();
			if ('tags' in result && Array.isArray(result.tags)) {
				setAvailableTags(result.tags);
			} else {
				console.error('Error al obtener tags:', (result as any).errors);
			}
		})();
	}, []);

	const MAX_TAGS = 7;

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

	const handleTagRemove = (tag: string) => {
		setSelectedTags((prevTags) => prevTags.filter((t) => t !== tag));
	};

	const filteredTags = searchQuery
		? availableTags.filter(({ label }) =>
				label.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: availableTags;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !body.trim()) {
			setValidationError('Título y contenido son obligatorios');
			return;
		}
		setValidationError('');
		try {
			const viewArgs = {
				orderBy: 'newest' as const,
				publishedDate: searchParams.get('publishedDate') || undefined,
				tag: searchParams.get('tag') || undefined,
				since: searchParams.get('since') || undefined,
				until: searchParams.get('until') || undefined,
			};
			await addPost({
				title,
				body,
				tags: selectedTags,
				viewArgs,
			}).unwrap();
			toast.success('Post publicado', {
				description: 'Creado correctamente',
			});
			setTitle('');
			setBody('');
			setSelectedTags([]);
			const cancelButton = document.getElementById('cancel-button');
			cancelButton?.click();
		} catch (err: any) {
			const msg = err?.data?.error || 'Error al publicar post';
			toast.error(msg);
		}
	};

	return (
		<div className="max-w-lg mx-auto mt-5 ">
			<div
				onClick={() => setIsOpen(true)}
				className="p-4 flex items-center border border-gray-300 rounded-md shadow-md cursor-pointer">
				<div className="w-6 h-6 text-gray-600">
					<UserIcon className="w-6 h-6 text-gray-600" />
				</div>
				<div className="ml-4 text-gray-600">¿Qué estás pensando?</div>
			</div>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent
					id="post-input-modal"
					className="p-4 sm:max-w-[100%] sm:w-full sm:h-full sm:border-none sm:rounded-none max-w-[64rem] max-h-[80dvh] rounded-lg overflow-y-auto">
					<form
						onSubmit={handleSubmit}
						className="p-4 flex flex-col gap-2 max-w-full w-full *:max-w-full">
						<div className="flex-1 overflow-y-auto pr-2">
							<DialogTitle>Crear Post</DialogTitle>
							<input
								type="text"
								name="title"
								className="w-full p-3 border border-x-gray-300 rounded-md mb-4"
								placeholder="Escribe el título del post"
								value={title}
								onChange={(e) => {
									setTitle(e.target.value);
									setValidationError('');
								}}
							/>
							<RichTextEditor onChange={setBody} />
							<div className="mb-4">
								<p className="text-gray-600 mb-2">
									Agrega tags para el post
								</p>
								<Popover
									open={isPopoverOpen}
									onOpenChange={setIsPopoverOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className="flex items-center gap-2"
											disabled={
												selectedTags.length >= MAX_TAGS
											}
											onClick={() => setSearchQuery('')}>
											Seleccionar Tags{' '}
											<ChevronDown className="w-4 h-4" />
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-66 p-0 ml-7 bg-white max-h-64 overflow-auto "
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
													: searchQuery && (
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

							<div className="mb-4">
								<p className="text-gray-600 mb-2">
									Tags seleccionados:
								</p>
								<div className="flex gap-2 flex-wrap">
									{selectedTags.map((tagId) => {
										const tag = availableTags.find(
											(t) => t.label === tagId
										);
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
								{selectedTags.length >= MAX_TAGS && (
									<p className="text-red-500 mt-2">
										Has alcanzado el límite de tags.
									</p>
								)}
							</div>

							{validationError && (
								<div className="flex items-center gap-2 bg-red-100 text-red-700 p-3 rounded-md mt-3">
									<svg
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={2}
										stroke="currentColor"
										className="w-5 h-5">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<span>{validationError}</span>
								</div>
							)}

							<div className="mt-4 flex justify-end gap-2">
								<Button
									type="submit"
									variant={'outline'}
									className={`bg-blue-500 text-white ${!title.trim() || !body.trim()}`}
									disabled={isLoading}>
									{isLoading ? 'Publicando...' : 'Publicar'}
								</Button>
								<DialogTrigger asChild>
									<Button
										id="cancel-button"
										variant={'outline'}
										className="bg-red-500 text-white">
										Cancelar
									</Button>
								</DialogTrigger>
							</div>
						</div>
					</form>
				</DialogContent>
				<DialogDescription className="hidden">
					Este es un modal para crear un post en la red social.
				</DialogDescription>
			</Dialog>
		</div>
	);
}

export default PostInput;
