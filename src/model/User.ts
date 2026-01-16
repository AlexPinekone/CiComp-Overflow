export interface User {
	userId: string;
	name: string;
	lastName: string;
	role: string;
	createdAt: Date;
	updatedAt: Date;
	softDelete: boolean;
}
