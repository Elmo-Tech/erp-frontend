"use client";

import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { NotificationItem } from "@/entities/notification/ui/NotificationItem";
import { MarkAsReadButton } from "@/features/notifications/ui/MarkAsReadButton";
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications } from "@/features/notifications/model/use-notification-actions";
import { useNotificationStore } from "@/features/notifications/model/notification.store";
import type { Notification } from "@/entities/notification/model/types";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { ScrollArea } from "@/shared/ui/scroll-area";

export function SystemNotificationsDropdown() {
	const router = useRouter();
	const notificationsQuery = useNotifications(20);
	const notifications = useNotificationStore((state) => state.notifications);
	const unreadCount = useNotificationStore((state) => state.unreadCount);
	const markAsRead = useMarkNotificationAsRead();
	const markAllAsRead = useMarkAllNotificationsAsRead();

	const handleNotificationClick = (notification: Notification) => {
		if (!notification.readAt) {
			markAsRead.mutate(notification.notificationId);
		}

		const href = resolveNotificationHref(notification);
		if (href) {
			router.push(href);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="relative"
					aria-label="Notifications"
				>
					<Bell />
					{unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium leading-none text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-84 p-0"
			>
				<DropdownMenuLabel className="flex items-center justify-between gap-2 px-3 py-2">
					<span>Notifications</span>
					{unreadCount > 0 && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => markAllAsRead.mutate()}
							disabled={markAllAsRead.isPending}
						>
							<CheckCheck data-icon="inline-start" />
							Mark all
						</Button>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<ScrollArea className="h-80">
					{notificationsQuery.isLoading && notifications.length === 0 ? (
						<div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							Loading notifications
						</div>
					) : notifications.length === 0 ? (
						<div className="px-3 py-8 text-center text-sm text-muted-foreground">No notifications</div>
					) : (
						<div className="p-1">
							{notifications.slice(0, 20).map((notification) => (
								<NotificationItem
									key={notification.notificationId}
									notification={notification}
									onClick={() => handleNotificationClick(notification)}
									action={!notification.readAt ? <MarkAsReadButton notificationId={notification.notificationId} /> : null}
								/>
							))}
						</div>
					)}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function resolveNotificationHref(notification: Notification) {
	if (typeof notification.data.url === "string") {
		return notification.data.url;
	}

	if (notification.data.task_id) {
		return `/dashboard/my-tasks?highlight=${notification.data.task_id}`;
	}

	if (notification.data.project_id) {
		return `/dashboard/projects/${notification.data.project_id}`;
	}

	if (notification.data.contract_id) {
		return `/dashboard/sales/contracts/${notification.data.contract_id}`;
	}

	if (notification.data.lead_id) {
		return `/dashboard/sales/leads/${notification.data.lead_id}`;
	}

	return null;
}

