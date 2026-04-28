import { Bell, CheckCircle2, FileText, MessageSquare, Timer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "../model/types";
import { cn } from "@/shared/lib/utils";

interface NotificationItemProps {
	notification: Notification;
	action?: React.ReactNode;
	className?: string;
	onClick?: () => void;
}

function renderNotificationIcon(type: string) {
	if (type.includes("task")) {
		return <CheckCircle2 className="size-3.5" />;
	}

	if (type.includes("comment")) {
		return <MessageSquare className="size-3.5" />;
	}

	if (type.includes("proposal") || type.includes("contract")) {
		return <FileText className="size-3.5" />;
	}

	if (type.includes("reminder") || type.includes("expiry")) {
		return <Timer className="size-3.5" />;
	}

	return <Bell className="size-3.5" />;
}

export function NotificationItem({ notification, action, className, onClick }: NotificationItemProps) {
	const unread = !notification.readAt;

	return (
		<button
			type="button"
			className={cn("flex w-full min-w-0 items-start gap-3 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-muted/60", unread && "bg-muted/40", className)}
			onClick={onClick}
		>
			<div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-background", unread && "border-primary/30 text-primary")}>
				{renderNotificationIcon(notification.type)}
			</div>
			<div className="min-w-0 flex-1 space-y-1">
				<p className={cn("line-clamp-2 text-sm leading-snug", unread && "font-medium")}>{notification.message || "New notification"}</p>
				<p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
			</div>
			{action}
		</button>
	);
}
