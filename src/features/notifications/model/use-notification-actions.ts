"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/entities/notification/api/notification.api";
import { notificationKeys } from "@/entities/notification/model/query-keys";
import type { NotificationListResponse } from "@/entities/notification/model/types";
import { useNotificationStore } from "./notification.store";

export function useNotifications(perPage = 20) {
	const setNotifications = useNotificationStore((state) => state.setNotifications);
	const setIsLoading = useNotificationStore((state) => state.setIsLoading);

	return useQuery<NotificationListResponse, Error>({
		queryKey: notificationKeys.list(perPage),
		queryFn: async () => {
			const response = await notificationApi.getNotifications(perPage);
			setNotifications(response.notifications, response.unreadCount);
			setIsLoading(false);
			return response;
		},
		staleTime: 60 * 1000,
	});
}

export function useMarkNotificationAsRead() {
	const queryClient = useQueryClient();
	const markAsRead = useNotificationStore((state) => state.markAsRead);

	return useMutation<void, Error, string>({
		mutationFn: notificationApi.markAsRead,
		onSuccess: (_, notificationId) => {
			markAsRead(notificationId);
			queryClient.invalidateQueries({ queryKey: notificationKeys.all });
		},
	});
}

export function useMarkAllNotificationsAsRead() {
	const queryClient = useQueryClient();
	const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

	return useMutation<void, Error, void>({
		mutationFn: notificationApi.markAllAsRead,
		onSuccess: () => {
			markAllAsRead();
			queryClient.invalidateQueries({ queryKey: notificationKeys.all });
		},
	});
}

