"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { useDeleteCalendarEvent } from "@/features/calendar/model/use-calendar-actions";
import type { AggregatedCalendarItem } from "@/entities/calendar/model/types";

interface DeleteEventDialogProps {
	open: boolean;
	onClose: () => void;
	/** The aggregated item — must be type "event" to extract the numeric ID */
	event: AggregatedCalendarItem | null;
}

export function DeleteEventDialog({ open, onClose, event }: DeleteEventDialogProps) {
	const deleteEvent = useDeleteCalendarEvent();

	const handleConfirm = async () => {
		if (!event) return;

		// Aggregated IDs are prefixed: "event-12" → 12
		const numericId = parseInt(event.id.replace("event-", ""), 10);
		if (isNaN(numericId)) return;

		try {
			await deleteEvent.mutateAsync(numericId);
			toast.success(`"${event.title}" deleted`);
			onClose();
		} catch {
			toast.error("Failed to delete event");
		}
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title="Delete Event"
			description={
				event ? (
					<span>
						Are you sure you want to delete <strong>{event.title}</strong>? This action cannot be undone.
					</span>
				) : (
					"Are you sure you want to delete this event?"
				)
			}
			confirmLabel="Delete Event"
			variant="destructive"
			onConfirm={handleConfirm}
			isLoading={deleteEvent.isPending}
		/>
	);
}
