export const notificationKeys = {
	all: ["notifications"] as const,
	lists: () => [...notificationKeys.all, "list"] as const,
	list: (perPage?: number) => [...notificationKeys.lists(), perPage] as const,
	unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

