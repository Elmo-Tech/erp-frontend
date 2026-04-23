"use client";

import { useEffect, useCallback, useRef } from "react";
import { getEcho } from "@/_old/lib/echo";
import { useAuthStore } from "@/_old/store/authStore";
import { useNotificationStore, Notification } from "@/_old/store/notificationStore";
import api from "@/shared/api/base";
import { toast } from "sonner";

interface NotificationEvent {
	notificationId: string;
	type: string;
	message: string;
	data: Record<string, unknown>;
	createdAt: string;
}

let isInitialized = false;

// Hook to initialize notification WebSocket (call once in layout)
export function useNotificationSocketInit() {
	const { user } = useAuthStore();
	const { setNotifications, addNotification, setUnreadCount, setIsLoading } = useNotificationStore();
	const channelRef = useRef<unknown>(null);

	// Fetch notifications
	const fetchNotifications = useCallback(async () => {
		try {
			const response = await api.get<{
				data: {
					notifications: Notification[];
					unreadCount: number;
				};
			}>("/notifications");
			setNotifications(response.data.data.notifications);
			setUnreadCount(response.data.data.unreadCount);
		} catch {
			// Silent fail
		} finally {
			setIsLoading(false);
		}
	}, [setNotifications, setUnreadCount, setIsLoading]);

	useEffect(() => {
		if (isInitialized) return;

		fetchNotifications();

		if (!user?.userId) return;

		const echo = getEcho();
		if (!echo) return;

		isInitialized = true;

		const channel = echo.private(`user.${user.userId}`);
		channelRef.current = channel;

		channel.listen(".notification.created", (event: NotificationEvent) => {
			console.log("[Notification] Received:", event);

			const notification: Notification = {
				notificationId: event.notificationId || crypto.randomUUID(),
				type: event.type,
				message: event.message,
				data: event.data,
				readAt: null,
				createdAt: event.createdAt || new Date().toISOString(),
			};

			addNotification(notification);

			// Show toast
			toast.info(event.message, {
				action: {
					label: "View",
					onClick: () => {
						// Navigate based on notification type
						if (event.data?.task_id) {
							window.location.href = `/dashboard/tasks?highlight=${event.data.task_id}`;
						}
					},
				},
			});
		});

		return () => {
			if (channelRef.current) {
				echo.leave(`user.${user.userId}`);
				channelRef.current = null;
				isInitialized = false;
			}
		};
	}, [user?.userId, fetchNotifications, addNotification]);

	return { refetch: fetchNotifications };
}
