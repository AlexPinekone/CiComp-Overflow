export interface Notification {
	notificationId: string;
	type: string;
	createdAt: Date;
	updatedAt: Date;
	softDelete: boolean;
}
