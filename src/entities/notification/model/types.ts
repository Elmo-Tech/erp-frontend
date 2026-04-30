export interface NotificationData {
	url?: string;
	task_id?: string;
	project_id?: string;
	contract_id?: string;
	lead_id?: string;
	[key: string]: unknown;
}

export interface Notification {
	notificationId: string;
	type: string;
	title: string;
	body: string;
	readAt: string | null;
	createdAt: string;
	data: NotificationData;
}
