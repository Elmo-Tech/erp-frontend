"use client";

import { create } from "zustand";
import type { Notification } from "@/entities/notification/model/types";

interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	setNotifications: (notifications: Notification[]) => void;
	addNotification: (notification: Notification) => void;
	markAsRead: (notificationId: string) => void;
	markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
	notifications: [],
	unreadCount: 0,

	setNotifications: (notifications) =>
		set({
			notifications,
			unreadCount: notifications.filter((n) => !n.readAt).length,
		}),

	addNotification: (notification) =>
		set((state) => {
			const notifications = [notification, ...state.notifications];
			return {
				notifications,
				unreadCount: notifications.filter((n) => !n.readAt).length,
			};
		}),

	markAsRead: (notificationId) =>
		set((state) => {
			const notifications = state.notifications.map((n) =>
				n.notificationId === notificationId ? { ...n, readAt: new Date().toISOString() } : n,
			);
			return {
				notifications,
				unreadCount: notifications.filter((n) => !n.readAt).length,
			};
		}),

	markAllAsRead: () =>
		set((state) => ({
			notifications: state.notifications.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
			unreadCount: 0,
		})),
}));
