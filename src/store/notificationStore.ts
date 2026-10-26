import { create } from "zustand";

export interface Notification {
	notificationId: string;
	type: string;
	message: string;
	data: Record<string, unknown>;
	readAt: string | null;
	createdAt: string;
}

interface NotificationStore {
	notifications: Notification[];
	unreadCount: number;
	isLoading: boolean;
	setNotifications: (notifications: Notification[]) => void;
	addNotification: (notification: Notification) => void;
	setUnreadCount: (count: number) => void;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	setIsLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
	notifications: [],
	unreadCount: 0,
	isLoading: true,
	setNotifications: (notifications) => set({ notifications }),
	addNotification: (notification) =>
		set((state) => state.notifications.some((item) => item.notificationId === notification.notificationId) ? state : ({
			notifications: [notification, ...state.notifications],
			unreadCount: state.unreadCount + 1,
		})),
	setUnreadCount: (count) => set({ unreadCount: count }),
	markAsRead: (id) =>
		set((state) => ({
			notifications: state.notifications.map((n) => (n.notificationId === id ? { ...n, readAt: new Date().toISOString() } : n)),
			unreadCount: Math.max(0, state.unreadCount - (state.notifications.some((n) => n.notificationId === id && !n.readAt) ? 1 : 0)),
		})),
	markAllAsRead: () =>
		set((state) => ({
			notifications: state.notifications.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })),
			unreadCount: 0,
		})),
	setIsLoading: (loading) => set({ isLoading: loading }),
}));
