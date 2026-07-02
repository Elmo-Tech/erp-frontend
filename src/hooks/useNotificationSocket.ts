"use client";

import { useEffect, useCallback, useRef } from "react";
import { getEcho } from "@/lib/echo";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore, Notification } from "@/store/notificationStore";
import api from "@/lib/axios";
import { toast } from "sonner";

type NotificationEvent = Record<string, unknown>;

let isInitialized = false;

// Hook to initialize notification WebSocket (call once in layout)
export function useNotificationSocketInit() {
	const { user } = useAuthStore();
	const { setNotifications, addNotification, setUnreadCount, setIsLoading } = useNotificationStore();
	const channelRef = useRef<unknown>(null);
	const defaultChannelRef = useRef<unknown>(null);

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

		const normalizeNotification = (event: NotificationEvent): Notification => {
			const data = (event.data && typeof event.data === "object" ? event.data : event) as Record<string, unknown>;
			return {
				notificationId: String(event.notificationId || event.id || crypto.randomUUID()),
				type: String(data.type || event.type || "notification"),
				message: String(data.message || event.message || "New notification"),
				data,
				readAt: null,
				createdAt: String(event.createdAt || event.created_at || new Date().toISOString()),
			};
		};

		const handleNotification = (event: NotificationEvent) => {
			const notification = normalizeNotification(event);

			addNotification(notification);

			toast.info(notification.message, {
				action: {
					label: "View",
					onClick: () => {
						if (typeof notification.data?.url === "string") {
							window.location.href = notification.data.url;
						} else if (notification.data?.task_id) {
							window.location.href = `/dashboard/my-tasks?highlight=${notification.data.task_id}`;
						} else if (notification.data?.project_id) {
							window.location.href = `/dashboard/projects/${notification.data.project_id}`;
						}
					},
				},
			});
		};

		const channel = echo.private(`user.${user.userId}`);
		channelRef.current = channel;
		channel.listen(".notification.created", handleNotification);

		const defaultChannel = echo.private(`App.Models.User.${user.userId}`) as { notification?: (callback: (event: NotificationEvent) => void) => void };
		defaultChannelRef.current = defaultChannel;
		defaultChannel.notification?.(handleNotification);

		return () => {
			if (channelRef.current) {
				echo.leave(`user.${user.userId}`);
				channelRef.current = null;
			}
			if (defaultChannelRef.current) {
				echo.leave(`App.Models.User.${user.userId}`);
				defaultChannelRef.current = null;
			}
			isInitialized = false;
		};
	}, [user?.userId, fetchNotifications, addNotification]);

	return { refetch: fetchNotifications };
}
