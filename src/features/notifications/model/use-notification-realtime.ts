"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Notification, NotificationData } from "@/entities/notification/model/types";
import { notificationApi } from "@/entities/notification/api/notification.api";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { getEcho } from "@/shared/realtime/echo";
import { useNotificationStore } from "./notification.store";

interface NotificationEvent {
	notificationId?: string;
	type: string;
	message: string;
	data: NotificationData;
	createdAt?: string;
}

interface RealtimeChannel {
	listen: (event: string, callback: (payload: NotificationEvent) => void) => RealtimeChannel;
}

let activeSubscriptionUserId: number | null = null;

export function useNotificationRealtimeInit() {
	const userId = useAuthStore((state) => state.user?.userId);
	const setNotifications = useNotificationStore((state) => state.setNotifications);
	const addNotification = useNotificationStore((state) => state.addNotification);
	const setIsLoading = useNotificationStore((state) => state.setIsLoading);
	const channelRef = useRef<RealtimeChannel | null>(null);

	const fetchNotifications = useCallback(async () => {
		try {
			const response = await notificationApi.getNotifications();
			setNotifications(response.notifications, response.unreadCount);
		} finally {
			setIsLoading(false);
		}
	}, [setIsLoading, setNotifications]);

	useEffect(() => {
		fetchNotifications();

		if (!userId || activeSubscriptionUserId === userId) {
			return;
		}

		const echo = getEcho();
		if (!echo) {
			return;
		}

		activeSubscriptionUserId = userId;
		const channel = echo.private(`user.${userId}`) as unknown as RealtimeChannel;
		channelRef.current = channel;

		channel.listen(".notification.created", (event) => {
			const notification: Notification = {
				notificationId: event.notificationId ?? crypto.randomUUID(),
				type: event.type,
				message: event.message,
				data: event.data,
				readAt: null,
				createdAt: event.createdAt ?? new Date().toISOString(),
			};

			addNotification(notification);
			toast.info(notification.message || "New notification");
		});

		return () => {
			echo.leave(`user.${userId}`);
			channelRef.current = null;
			activeSubscriptionUserId = null;
		};
	}, [addNotification, fetchNotifications, userId]);

	return { refetch: fetchNotifications };
}

