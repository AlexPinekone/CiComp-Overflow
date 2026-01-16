'use client';

import { useContext, useState } from 'react';
import { Button } from './ui/button';
import { SessionContext } from '@/providers/SessionProvider';
import { voteOnPost } from '@/actions/post';
import { useRouter } from 'next/navigation';
import { createNotification } from '@/actions/notification';

interface VoteButtonsProps {
	postId: string;
	displayVotes: string | number;
	userVote: number;
}

export default function VoteButtons({
	postId,
	displayVotes,
	userVote,
}: VoteButtonsProps) {
	const router = useRouter();
	const sessionContext = useContext(SessionContext);
	const userId = sessionContext?.session?.userId;

	const [localVote, setLocalVote] = useState(userVote);
	const [voteCount, setVoteCount] = useState(Number(displayVotes));

	const handleVote = async (status: 'UPVOTE' | 'DOWNVOTE') => {
		if (!userId) {
			router.push('/login');
			return;
		}

		// Guardar estado anterior por si hay error
		const previousVote = localVote;
		const previousCount = voteCount;

		let newVote = 0;
		let newCount = voteCount;

		if (
			(status === 'UPVOTE' && localVote === 1) ||
			(status === 'DOWNVOTE' && localVote === -1)
		) {
			// Eliminar voto
			newVote = 0;
			newCount += status === 'UPVOTE' ? -1 : 1;
		} else if (
			(status === 'UPVOTE' && localVote === -1) ||
			(status === 'DOWNVOTE' && localVote === 1)
		) {
			// Cambiar voto
			newVote = status === 'UPVOTE' ? 1 : -1;
			newCount += status === 'UPVOTE' ? 2 : -2;
		} else {
			// Voto nuevo
			newVote = status === 'UPVOTE' ? 1 : -1;
			newCount += newVote;
		}

		setLocalVote(newVote);
		setVoteCount(newCount);

		try {
			const result = await voteOnPost(postId, userId, status);
			console.log('hola,votaste con exito');
			if (
				result?.success &&
				result.postAuthorId &&
				result.postAuthorId !== userId
			) {
				await createNotification({
					userId: result.postAuthorId,
					type: 'LIKE',
					referenceId: postId as string,
					createdByUserId: userId as string,
				});
			}
		} catch (error) {
			console.error('Error al votar:', error);
			setLocalVote(previousVote);
			setVoteCount(previousCount);
		}
	};

	const showVotes = voteCount > 0;

	return (
		<div className="flex items-center space-x-2">
			<Button
				size="sm"
				variant="outline"
				onClick={() => handleVote('UPVOTE')}
				className={`transition-all duration-150 ${
					localVote === 1
						? 'bg-[var(--primary)] text-white'
						: 'hover:bg-gray-100 active:bg-gray-200'
				}`}>
				▲ {showVotes ? voteCount : ''}
			</Button>

			<Button
				size="sm"
				variant="outline"
				onClick={() => handleVote('DOWNVOTE')}
				className={`transition-all duration-150 ${
					localVote === -1
						? 'bg-[var(--secondary)] text-white'
						: 'hover:bg-gray-100 active:bg-gray-200'
				}`}>
				▼
			</Button>
		</div>
	);
}
