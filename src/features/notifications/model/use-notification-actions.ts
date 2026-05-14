"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/base";
import { useNotificationStore } from "./notification.store";
import type { Notification } from "@/entities/notification/model/types";

interface BackendNotification {
	id: string;
	type: string;
	data?: {
		title?: string;
		message?: string;
		body?: string;
		[key: string]: unknown;
	};
	read_at?: string | null;
	readAt?: string | null;
	created_at?: string;
	createdAt?: string;
}

function normalizeNotification(notification: BackendNotification | Notification): Notification {
	if ("notificationId" in notification) {
		return notification;
	}

	const data = notification.data ?? {};

	return {
		notificationId: notification.id,
		type: notification.type,
		title: typeof data.title === "string" ? data.title : "Notification",
		body: typeof data.message === "string" ? data.message : typeof data.body === "string" ? data.body : "",
		readAt: notification.read_at ?? notification.readAt ?? null,
		createdAt: notification.created_at ?? notification.createdAt ?? "",
		data,
	};
}

export function useNotifications(limit = 20) {
	const setNotifications = useNotificationStore((s) => s.setNotifications);

	return useQuery({
		queryKey: ["notifications", limit],
		queryFn: async () => {
			const { data } = await api.get<{ data: Notification[] | { notifications: BackendNotification[] } }>(`/notifications?limit=${limit}`);
			const raw = Array.isArray(data.data) ? data.data : data.data?.notifications ?? [];
			const notifications = raw.map(normalizeNotification);
			setNotifications(notifications);
			return notifications;
		},
		refetchInterval: 30_000,
		retry: false,
	});
}

export function useMarkNotificationAsRead() {
	const queryClient = useQueryClient();
	const markAsRead = useNotificationStore((s) => s.markAsRead);

	return useMutation({
		mutationFn: (notificationId: string) => api.patch(`/notifications/${notificationId}/read`),
		onMutate: (notificationId) => {
			markAsRead(notificationId);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
}

export function useMarkAllNotificationsAsRead() {
	const queryClient = useQueryClient();
	const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

	return useMutation({
		mutationFn: () => api.patch("/notifications/read-all"),
		onMutate: () => {
			markAllAsRead();
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
}
