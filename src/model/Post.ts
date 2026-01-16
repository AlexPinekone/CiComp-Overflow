export interface Post {
	postId?: string;
	title: string;
	body: string;
	status?: string;
	createdAt?: Date;
	updatedAt?: Date;
	userId: string;
	softDelete?: boolean;
	tags?: string[];
}
