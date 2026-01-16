export interface Comment {
	commentId?: string;
	body: string;
	createdAt?: Date;
	postId: string;
	softDelete?: boolean;
}
