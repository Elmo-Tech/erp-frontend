"use client";

import { create } from "zustand";
import type { Notification } from "@/entities/notification/model/types";

interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	isLoading: boolean;
	setNotifications: (notifications: Notification[], unreadCount?: number) => void;
	addNotification: (notification: Notification) => void;
	setUnreadCount: (unreadCount: number) => void;
	markAsRead: (notificationId: string) => void;
	markAllAsRead: () => void;
	setIsLoading: (isLoading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
	notifications: [],
	unreadCount: 0,
	isLoading: true,
	setNotifications: (notifications, unreadCount) => set({ notifications, unreadCount: unreadCount ?? notifications.filter((notification) => !notification.readAt).length }),
	addNotification: (notification) =>
		set((state) => ({
			notifications: [notification, ...state.notifications],
			unreadCount: state.unreadCount + (notification.readAt ? 0 : 1),
		})),
	setUnreadCount: (unreadCount) => set({ unreadCount }),
	markAsRead: (notificationId) =>
		set((state) => ({
			notifications: state.notifications.map((notification) => (notification.notificationId === notificationId ? { ...notification, readAt: notification.readAt ?? new Date().toISOString() } : notification)),
			unreadCount: Math.max(0, state.unreadCount - 1),
		})),
	markAllAsRead: () =>
		set((state) => ({
			notifications: state.notifications.map((notification) => ({ ...notification, readAt: notification.readAt ?? new Date().toISOString() })),
			unreadCount: 0,
		})),
	setIsLoading: (isLoading) => set({ isLoading }),
}));

