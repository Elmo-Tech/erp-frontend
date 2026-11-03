"use client";

import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/store/notificationStore";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { notificationTarget } from "@/lib/notificationTarget";

export function NotificationDropdown() {
	const router = useRouter();
	const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

	const handleMarkAsRead = async (id: string) => {
		try {
			await api.post(`/notifications/${id}/read`);
			markAsRead(id);
		} catch {
			// Silent fail
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await api.post("/notifications/read-all");
			markAllAsRead();
		} catch {
			// Silent fail
		}
	};

	const handleNotificationClick = (notification: (typeof notifications)[0]) => {
		if (!notification.readAt) {
			handleMarkAsRead(notification.notificationId);
		}

		const target = notificationTarget(notification);
		if (target) router.push(target);
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "task_assigned":
				return "📋";
			case "task_completed":
				return "✅";
			case "comment_added":
				return "💬";
			default:
				return "🔔";
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative h-9 w-9"
				>
					<Bell className="h-4 w-4" />
					{unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
					<span className="sr-only">Notifications</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-80"
			>
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Notifications</span>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-auto p-1 text-xs text-white!"
							onClick={handleMarkAllAsRead}
						>
							<CheckCheck className="h-3 w-3 mr-1" />
							Mark all read
						</Button>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<ScrollArea className="h-[300px]">
					{notifications.length === 0 ? (
						<div className="flex items-center justify-center h-20 text-sm text-muted-foreground">No notifications</div>
					) : (
						notifications.slice(0, 20).map((notification) => (
							<DropdownMenuItem
								key={notification.notificationId}
								className={cn("flex items-start gap-3 p-3 cursor-pointer", !notification.readAt && "bg-muted/50")}
								onClick={() => handleNotificationClick(notification)}
							>
								<span className="text-lg">{getNotificationIcon(notification.type)}</span>
								<div className="flex-1 space-y-1">
									<p className={cn("text-sm leading-tight", !notification.readAt && "font-medium")}>{notification.message}</p>
									<p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
								</div>
								{!notification.readAt && (
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 shrink-0"
										onClick={(e) => {
											e.stopPropagation();
											handleMarkAsRead(notification.notificationId);
										}}
									>
										<Check className="h-3 w-3" />
									</Button>
								)}
								<ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
							</DropdownMenuItem>
						))
					)}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
