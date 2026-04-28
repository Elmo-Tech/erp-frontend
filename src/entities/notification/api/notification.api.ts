import api from "@/shared/api/base";
import type { NotificationListResponse } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

export const notificationApi = {
	async getNotifications(perPage = 20): Promise<NotificationListResponse> {
		const response = await api.get<ApiEnvelope<NotificationListResponse>>(`/notifications?perPage=${perPage}`);

		return response.data.data;
	},

	async getUnreadCount(): Promise<number> {
		const response = await api.get<ApiEnvelope<{ unreadCount: number }>>("/notifications/unread-count");

		return response.data.data.unreadCount;
	},

	async markAsRead(notificationId: string): Promise<void> {
		await api.post(`/notifications/${notificationId}/read`);
	},

	async markAllAsRead(): Promise<void> {
		await api.post("/notifications/read-all");
	},
};

