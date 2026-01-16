export enum VoteStatus {
	UPVOTE = 'UPVOTE',
	DOWNVOTE = 'DOWNVOTE',
}

export interface Vote {
	userId: string;
	postId: string;
	status: VoteStatus;
	createdAt?: Date;
	softDelete?: boolean;
}
