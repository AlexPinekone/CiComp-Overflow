export interface Account {
	userId: string; // UUID
	password: string;
	mail: string;
	createdAt?: Date;
	updatedAt?: Date;
	softDelete?: boolean;
}
