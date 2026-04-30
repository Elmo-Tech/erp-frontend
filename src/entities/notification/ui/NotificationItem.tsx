"use client";

import type { ReactNode } from "react";
import type { Notification } from "@/entities/notification/model/types";
import { cn } from "@/shared/lib/utils";

interface NotificationItemProps {
	notification: Notification;
	onClick?: () => void;
	action?: ReactNode;
}

export function NotificationItem({ notification, onClick, action }: NotificationItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50",
				!notification.readAt && "bg-primary/5",
			)}
		>
			<div className="min-w-0 flex-1 space-y-0.5">
				<div className="flex items-start justify-between gap-2">
					<span className={cn("line-clamp-1 font-medium", !notification.readAt && "text-foreground")}>
						{notification.title}
					</span>
					{action}
				</div>
				<p className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>
			</div>
		</button>
	);
}
