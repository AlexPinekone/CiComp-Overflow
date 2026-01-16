'use client';
import { useEffect, useState } from 'react';
import CommentItem from './CommentItem';
import { getUserIdFromSession } from '@/actions/user';

interface Comment {
	commentId: string;
	postId: string;
	authorName: string;
	authorAvatar: string;
	createdAt: Date;
	body: string;
	votes: number;
}

interface CommentListProps {
	comments: Comment[] | any;
	userVotes: { [key: string]: number };
	handleVote: (id: string, type: 'up' | 'down') => void;
	currentUser: string;
	onUpdate: (id: string, comment: Comment | any) => void;
	onDelete: (id: string) => void;
	onReport: (commentId: string) => void;
	highlightedId?: string;
}

export default function CommentList({
	comments,
	userVotes,
	currentUser,
	handleVote,
	onUpdate,
	onDelete,
	onReport,
	highlightedId,
}: CommentListProps) {
	return (
		<div className="mt-6">
			<div className="space-y-4">
				{comments.map((comment: any) => (
					<CommentItem
						key={comment.commentId}
						comment={comment}
						userVote={userVotes[comment.commentId] || 0}
						handleVote={handleVote}
						currentUser={currentUser}
						onUpdate={onUpdate}
						onDelete={onDelete}
						onReport={onReport}
						isHighlighted={highlightedId === comment.commentId}
					/>
				))}
			</div>
		</div>
	);
}
