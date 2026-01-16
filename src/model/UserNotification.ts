export interface UserNotification {
	UserNotificationId: string;
	UserId: string;
	type: 'ANSWER' | 'EDIT' | 'LIKE' | 'DELETE' | 'REQUEST';
	referenceId: string;
	status: 'UNREAD' | 'READ';
	createdAt: Date;
	updatedAt: Date;
	softDelete: boolean;
	createdByUserId: string;
}
