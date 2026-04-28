"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useMarkNotificationAsRead } from "../model/use-notification-actions";

interface MarkAsReadButtonProps {
	notificationId: string;
	disabled?: boolean;
	className?: string;
}

export function MarkAsReadButton({ notificationId, disabled, className }: MarkAsReadButtonProps) {
	const markAsRead = useMarkNotificationAsRead();

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			className={className}
			disabled={disabled || markAsRead.isPending}
			onClick={(event) => {
				event.stopPropagation();
				markAsRead.mutate(notificationId);
			}}
			aria-label="Mark notification as read"
		>
			{markAsRead.isPending ? <Loader2 className="animate-spin" /> : <Check />}
		</Button>
	);
}

