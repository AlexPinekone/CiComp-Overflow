'use client';

import { useContext, useState } from 'react';
import { Button } from './ui/button';
import { SessionContext } from '@/providers/SessionProvider';
import { voteOnComment } from '@/actions/comment';
import { useRouter } from 'next/navigation';

interface CommentVoteButtonsProps {
	commentId: string;
	postId: string;
	displayVotes: number;
	userVote: number;
}

export default function CommentVoteButtons({
	commentId,
	postId,
	displayVotes,
	userVote,
}: CommentVoteButtonsProps) {
	const router = useRouter();
	const sessionContext = useContext(SessionContext);
	const userId = sessionContext?.session?.userId;

	const [localVote, setLocalVote] = useState(userVote);
	const [voteCount, setVoteCount] = useState(displayVotes);

	const handleVote = async (status: 'UPVOTE' | 'DOWNVOTE') => {
		if (!userId) {
			router.push('/login');
			return;
		}

		const previousVote = localVote;
		const previousCount = voteCount;

		let newVote = 0;
		let newCount = voteCount;

		if (
			(status === 'UPVOTE' && localVote === 1) ||
			(status === 'DOWNVOTE' && localVote === -1)
		) {
			newVote = 0;
			newCount += status === 'UPVOTE' ? -1 : 1;
		} else if (
			(status === 'UPVOTE' && localVote === -1) ||
			(status === 'DOWNVOTE' && localVote === 1)
		) {
			newVote = status === 'UPVOTE' ? 1 : -1;
			newCount += status === 'UPVOTE' ? 2 : -2;
		} else {
			newVote = status === 'UPVOTE' ? 1 : -1;
			newCount += newVote;
		}

		setLocalVote(newVote);
		setVoteCount(newCount);

		try {
			await voteOnComment(commentId, postId, userId, status);
		} catch (error) {
			console.error('Error al votar comentario:', error);
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
