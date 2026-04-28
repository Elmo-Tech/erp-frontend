export type NotificationType = "task_assigned" | "task_completed" | "comment_added" | "proposal_approved" | "proposal_rejected" | "meeting_reminder" | "expiry_warning" | "general" | string;

export interface NotificationData {
	type?: string;
	message?: string;
	task_id?: number;
	project_id?: number;
	lead_id?: number;
	quotation_id?: number;
	contract_id?: number;
	url?: string;
	[key: string]: unknown;
}

export interface Notification {
	notificationId: string;
	type: NotificationType;
	message: string;
	data: NotificationData;
	readAt: string | null;
	createdAt: string;
}

export interface NotificationPagination {
	total: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface NotificationListResponse {
	notifications: Notification[];
	unreadCount: number;
	pagination?: NotificationPagination;
}

