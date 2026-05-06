"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { useCreateCalendarEvent, useUpdateCalendarEvent } from "@/features/calendar/model/use-calendar-actions";
import { calendarEventSchema, CALENDAR_EVENT_DEFAULT_VALUES, type CalendarEventFormData } from "@/features/calendar/model/calendar.schema";
import type { CalendarEvent } from "@/entities/calendar/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EVENT_TYPE_OPTIONS = [
	{ value: "custom", label: "Custom" },
	{ value: "meeting", label: "Meeting" },
	{ value: "reminder", label: "Reminder" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface EventFormModalProps {
	open: boolean;
	onClose: () => void;
	editTarget: CalendarEvent | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EventFormModal({ open, onClose, editTarget }: EventFormModalProps) {
	const isEditing = editTarget !== null;
	const createEvent = useCreateCalendarEvent();
	const updateEvent = useUpdateCalendarEvent();

	// Cast resolver to bypass z.coerce type mismatch (Zod v4 + @hookform/resolvers v5)
	const form = useForm<CalendarEventFormData>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(calendarEventSchema) as any,
		defaultValues: CALENDAR_EVENT_DEFAULT_VALUES,
	});

	// Sync form when modal opens or editTarget changes
	useEffect(() => {
		if (!open) return;

		if (editTarget) {
			form.reset({
				title: editTarget.title,
				description: editTarget.description ?? "",
				// Slice to "YYYY-MM-DDTHH:MM" for datetime-local input
				startTime: editTarget.startTime.slice(0, 16),
				endTime: editTarget.endTime.slice(0, 16),
				eventType: editTarget.eventType,
			});
		} else {
			form.reset(CALENDAR_EVENT_DEFAULT_VALUES);
		}
	}, [open, editTarget, form]);

	const handleSubmit = async (data: CalendarEventFormData) => {
		try {
			const payload = {
				...data,
				description: data.description || null,
			};

			if (isEditing) {
				await updateEvent.mutateAsync({ id: editTarget.id, payload });
				toast.success("Event updated successfully");
			} else {
				await createEvent.mutateAsync(payload);
				toast.success("Event created successfully");
			}
			onClose();
		} catch {
			toast.error(isEditing ? "Failed to update event" : "Failed to create event");
		}
	};

	const isPending = createEvent.isPending || updateEvent.isPending;

	return (
		<FormDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title={isEditing ? "Edit Event" : "New Event"}
			description={isEditing ? "Update the event details." : "Create a new calendar event."}
			onSubmit={form.handleSubmit(handleSubmit as Parameters<typeof form.handleSubmit>[0])}
			submitLabel={isEditing ? "Save Changes" : "Create Event"}
			isLoading={isPending}
			size="lg"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					<FormInput
						control={form.control}
						name="title"
						label="Title"
						placeholder="e.g. Team Sync"
						disabled={isPending}
					/>

					{/* datetime-local inputs — FormInput doesn't support this type,
					    so we use Controller + raw <input> with the same visual style */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Controller
							control={form.control}
							name="startTime"
							render={({ field, fieldState }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Start Time</FormLabel>
									<Input
										type="datetime-local"
										disabled={isPending}
										{...field}
										value={field.value ?? ""}
									/>
									{fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
								</FormItem>
							)}
						/>
						<Controller
							control={form.control}
							name="endTime"
							render={({ field, fieldState }) => (
								<FormItem className="flex flex-col">
									<FormLabel>End Time</FormLabel>
									<Input
										type="datetime-local"
										disabled={isPending}
										{...field}
										value={field.value ?? ""}
									/>
									{fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
								</FormItem>
							)}
						/>
					</div>

					<FormSelect
						control={form.control}
						name="eventType"
						label="Event Type"
						options={EVENT_TYPE_OPTIONS}
						disabled={isPending}
					/>

					<FormTextarea
						control={form.control}
						name="description"
						label="Description (optional)"
						placeholder="What is this event about?"
						rows={3}
						disabled={isPending}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
