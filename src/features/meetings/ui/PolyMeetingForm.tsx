"use client";

/**
 * PolyMeetingForm
 *
 * Self-contained, collapsible meeting scheduling form for any detail page.
 * Accepts polymorphic `modelType` and `modelId` props so it works on:
 *  - Lead Details page   (modelType="lead")
 *  - Client Details page (modelType="client")
 *  - Project Details page (modelType="project")
 *
 * Owns its own form state, validation, and submission. Renders the shared
 * `ScheduleMeetingFormFields` component — the single source of truth for
 * the meeting form layout (attendees, location, date/time, etc.).
 *
 * On success, invalidates the meetings query for the parent model so
 * `MeetingsList` refreshes automatically.
 */

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarPlus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { useCreateMeeting } from "@/entities/meetings/api/meetings.api";
import { createMeetingSchema, type CreateMeetingFormData } from "@/entities/meetings/model/meeting.schema";
import { MODEL_TYPE_TO_MORPH, type MeetingModelType } from "@/entities/meetings/model/types";
import { getApiErrorMessage, getApiValidationErrors } from "@/shared/lib/api-error";
import { ScheduleMeetingFormFields } from "./ScheduleMeetingFormFields";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface PolyMeetingFormProps {
	/** The type of the parent model (lead | client | project) */
	modelType: MeetingModelType;
	/** The ID of the parent model */
	modelId: number;
	/** Optional callback fired after a meeting is successfully scheduled */
	onMeetingScheduled?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default values
// ─────────────────────────────────────────────────────────────────────────────

type CreateMeetingFormInput = z.input<typeof createMeetingSchema>;

function buildDefaultValues(): CreateMeetingFormInput {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const date = tomorrow.toISOString().slice(0, 10);

	return {
		meetingType: "discovery",
		title: "",
		date,
		time: "10:00",
		locationType: "online",
		locationDetails: "",
		internalAttendees: [],
		externalAttendees: [],
		description: "",
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PolyMeetingForm({ modelType, modelId, onMeetingScheduled }: PolyMeetingFormProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { mutateAsync, isPending } = useCreateMeeting(modelType, modelId);

	const form = useForm<CreateMeetingFormInput, unknown, CreateMeetingFormData>({
		resolver: zodResolver(createMeetingSchema),
		defaultValues: buildDefaultValues(),
	});

	const handleSubmit = form.handleSubmit(async (data) => {
		try {
			const scheduledAt = new Date(`${data.date}T${data.time}`).toISOString();

			await mutateAsync({
				model_type: MODEL_TYPE_TO_MORPH[modelType],
				model_id: modelId,
				meeting_type: data.meetingType,
				// Auto-generate title from meeting type if the user left it blank
				title: data.title.trim() || `${data.meetingType.charAt(0).toUpperCase() + data.meetingType.slice(1)} Meeting`,
				description: data.description,
				scheduled_at: scheduledAt,
				location_type: data.locationType,
				location_details: data.locationDetails,
				internal_attendees: data.internalAttendees.map(Number).filter((n) => !isNaN(n)),
				external_attendees: data.externalAttendees,
				assigned_to: data.internalAttendees[0] ? Number(data.internalAttendees[0]) : undefined,
			});

			toast.success("Meeting scheduled successfully.");
			form.reset(buildDefaultValues());
			setIsOpen(false);
			onMeetingScheduled?.();
		} catch (error) {
			const errors = getApiValidationErrors(error);
			if (errors.scheduledAt?.[0]) {
				form.setError("date", { type: "server", message: errors.scheduledAt[0] });
				form.setError("time", { type: "server", message: errors.scheduledAt[0] });
			}

			toast.error(getApiErrorMessage(error, "Failed to schedule meeting. Please try again."));
		}
	});

	const handleCancel = () => {
		form.reset(buildDefaultValues());
		setIsOpen(false);
	};

	return (
		<div className="rounded-xl border bg-card overflow-hidden">
			{/* ── Toggle header ─────────────────────────────────────────────── */}
			<button
				type="button"
				onClick={() => setIsOpen((v) => !v)}
				className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
			>
				<span className="flex items-center gap-2">
					<CalendarPlus className="size-4 text-primary" />
					Schedule a Meeting
				</span>
				{isOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
			</button>

			{/* ── Form body ─────────────────────────────────────────────────── */}
			{isOpen && (
				<div className="border-t px-4 py-5">
					<FormProvider {...form}>
						<form
							onSubmit={handleSubmit}
							className="flex flex-col gap-5"
						>
							{/* All form fields — single source of truth */}
							<ScheduleMeetingFormFields />

							{/* Actions */}
							<div className="flex justify-end gap-2 pt-1 border-t">
								<Button
									type="button"
									variant="outline"
									onClick={handleCancel}
									disabled={isPending}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isPending}
								>
									{isPending ? "Scheduling…" : "Schedule Meeting"}
								</Button>
							</div>
						</form>
					</FormProvider>
				</div>
			)}
		</div>
	);
}
