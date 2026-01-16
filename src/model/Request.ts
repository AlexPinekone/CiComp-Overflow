export interface Request {
	requestId?: string;
	userId?: string;
	title: string;
	body: string;
	type: 'post' | 'comment' | 'user' | 'general';
	referencePostId?: string;
	referenceCommentId?: string;
	referenceUserId?: string;
	status: 'PENDING' | 'APPROVED' | 'REJECTED';
	createdAt?: Date;
	updatedAt?: Date;
	softDelete?: boolean;
}
