import { VoteStatus } from './UserPostVote';

export interface Vote {
	commentId: string;
	userId: string;
	postId?: string;
	status: VoteStatus;
	createdAt?: Date;
	softDelete?: boolean;
}
