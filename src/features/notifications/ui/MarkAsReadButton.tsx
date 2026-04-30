"use client";

import { Check } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useMarkNotificationAsRead } from "@/features/notifications/model/use-notification-actions";

interface MarkAsReadButtonProps {
	notificationId: string;
}

export function MarkAsReadButton({ notificationId }: MarkAsReadButtonProps) {
	const markAsRead = useMarkNotificationAsRead();

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className="size-6 shrink-0"
			onClick={(e) => {
				e.stopPropagation();
				markAsRead.mutate(notificationId);
			}}
			disabled={markAsRead.isPending}
			aria-label="Mark as read"
		>
			<Check className="size-3.5" />
		</Button>
	);
}
