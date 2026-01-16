'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { useAddCommentMutation } from '@/redux/services/commentsApi';
import { createNotification } from '@/actions/notification';
import { getUserIdFromSession } from '@/actions/user';
import { replaceForbiddenWords } from '@/utils/validateContent';

interface CommentFormProps {
	postId: string;
	postAuthorId: string;
	sortBy?: string;
	order?: string;
}

export default function CommentForm({
	postId,
	postAuthorId,
	sortBy,
	order,
}: CommentFormProps) {
	const [comment, setComment] = useState('');
	const [error, setError] = useState('');
	const [addComment, { isLoading }] = useAddCommentMutation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const body = comment.trim();
		if (!body) {
			setError('El comentario no puede estar vacío.');
			return;
		}
		if (body.length > 500) {
			setError('El comentario no puede superar 500 caracteres.');
			return;
		}
		setError('');

		try {
			const sanitized = replaceForbiddenWords(body);
			const created = await addComment({
				postId,
				body: sanitized,
				sortBy,
				order,
			}).unwrap();
			setComment('');
			toast.success('Comentario creado correctamente');

			// Notificación al autor del post
			const commentAuthorId = await getUserIdFromSession();
			if (typeof commentAuthorId === 'string' && created?.commentId) {
				await createNotification({
					userId: postAuthorId,
					type: 'ANSWER',
					referenceId: created.commentId,
					createdByUserId: commentAuthorId,
				});
			}
		} catch {
			toast.error('Error al crear el comentario');
		}
	};

	return (
		<div className="mt-6 border-t pt-4">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Textarea
						name="body"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Escribe un comentario..."
						rows={4}
						className="w-full p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					/>
				</div>
				{error && <p className="text-red-500">{error}</p>}
				<Button
					disabled={isLoading}
					type="submit"
					className="w-full p-3 bg-primary text-white rounded-md hover:bg-tertiary focus:outline-none focus:ring-2 focus:ring-primary transition">
					{isLoading ? 'Publicando...' : 'Comentar'}
				</Button>
			</form>
		</div>
	);
}
