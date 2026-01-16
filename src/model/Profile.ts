export interface Profile {
	profileId?: string;
	userId: string;
	photo?: string;
	description?: string;
	userName: string;
	status?: string;
	createdAt?: Date;
	updatedAt?: Date;
	softDelete?: boolean;
}
