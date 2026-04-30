"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/base";
import { useNotificationStore } from "./notification.store";
import type { Notification } from "@/entities/notification/model/types";

export function useNotifications(limit = 20) {
	const setNotifications = useNotificationStore((s) => s.setNotifications);

	return useQuery({
		queryKey: ["notifications", limit],
		queryFn: async () => {
			const { data } = await api.get<{ data: Notification[] }>(`/notifications?limit=${limit}`);
			setNotifications(data.data ?? []);
			return data.data ?? [];
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
