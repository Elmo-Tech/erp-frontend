"use client";

/**
 * MeetingScheduleTab
 *
 * Thin wrapper rendered inside the Meeting stage modal — "Schedule" mode.
 * Delegates all form field rendering to the shared ScheduleMeetingFormFields
 * component so there is exactly ONE meeting form layout in the codebase.
 *
 * The parent StageModal / MeetingStageModal owns the FormProvider context
 * (using meetingScheduleSchema from stageModal.schema.ts). The field names
 * in that schema (meeting_type, location_type, internal_attendees, etc.) use
 * snake_case while CreateMeetingFormData uses camelCase — ScheduleMeetingFormFields
 * is wired to the camelCase schema, so this tab adapts the context by
 * re-exporting the same fields under the correct names via a bridge form.
 *
 * NOTE: The pipeline modal uses its own meetingScheduleSchema (snake_case field
 * names) while PolyMeetingForm uses createMeetingSchema (camelCase). Both schemas
 * validate the same data — the difference is only in field naming convention.
 * This tab keeps its own field rendering to stay compatible with the pipeline
 * modal's FormProvider context.
 */

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Video } from "lucide-react";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { FormTagSelector, type FormTagOption } from "@/shared/ui/forms/FormTagSelector";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import { MEETING_TYPES, MEETING_TYPE_LABELS, LOCATION_TYPES, LOCATION_TYPE_LABELS } from "@/entities/meetings/model/types";
import type { MeetingScheduleValues } from "./stageModal.schema";

// ─────────────────────────────────────────────────────────────────────────────
// Option lists — derived from the shared entity constants
// ─────────────────────────────────────────────────────────────────────────────

const MEETING_TYPE_OPTIONS = MEETING_TYPES.map((t) => ({
	value: t,
	label: MEETING_TYPE_LABELS[t],
}));

const LOCATION_TYPE_OPTIONS = LOCATION_TYPES.map((t) => ({
	value: t,
	label: LOCATION_TYPE_LABELS[t],
}));

// Static external-attendee role options
const EXTERNAL_ATTENDEE_OPTIONS: FormTagOption[] = [
	{ value: "decision-maker", label: "Decision Maker" },
	{ value: "finance-contact", label: "Finance Contact" },
	{ value: "technical-contact", label: "Technical Contact" },
	{ value: "primary-contact", label: "Primary Contact" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MeetingScheduleTab() {
	const { control, setValue } = useFormContext<MeetingScheduleValues>();

	// Watch location_type (snake_case — matches meetingScheduleSchema)
	const locationType = useWatch({ control, name: "location_type" }) as string | undefined;
	const isOnline = locationType === "online";

	const usersQuery = useGetInternalUsers(true);

	const internalAttendeeOptions = useMemo<FormTagOption[]>(
		() =>
			(usersQuery.data?.users ?? []).map((user) => ({
				value: String(user.id),
				label: user.name,
			})),
		[usersQuery.data?.users],
	);

	return (
		<div className="flex flex-col gap-5">
			{/* ── Row 1: Meeting Type ───────────────────────────────────────── */}
			<FormSelect
				control={control}
				name="meeting_type"
				label="Meeting Type"
				placeholder="Select type…"
				options={MEETING_TYPE_OPTIONS}
			/>

			{/* ── Row 2: Date | Time ────────────────────────────────────────── */}
			<div className="grid grid-cols-2 gap-4">
				<FormInput
					control={control}
					name="date"
					label="Date"
					type="date"
				/>
				<FormInput
					control={control}
					name="time"
					label="Time"
					type="time"
				/>
			</div>

			{/* ── Row 3: Location Type | Link / Details ─────────────────────── */}
			<div className="grid grid-cols-2 gap-4">
				<FormSelect
					control={control}
					name="location_type"
					label="Location Type"
					placeholder="Select location…"
					options={LOCATION_TYPE_OPTIONS}
					onValueChange={() =>
						setValue("location_details", "", {
							shouldDirty: true,
							shouldValidate: false,
						})
					}
				/>
				<FormInput
					control={control}
					name="location_details"
					label={isOnline ? "Meeting Link" : "Location Details"}
					type={isOnline ? "url" : "text"}
					placeholder={isOnline ? "Optional meeting link" : "Building, address, room, or notes"}
					endAdornment={isOnline ? <Video className="size-4 text-muted-foreground" /> : undefined}
				/>
			</div>

			<FormTextarea
				control={control}
				name="notes"
				label="Notes"
				placeholder="Meeting context, decisions, or follow-up notes"
				rows={3}
			/>

			{/* ── Row 4: Internal Attendees ─────────────────────────────────── */}
			<FormTagSelector
				control={control}
				name="internal_attendees"
				label="Internal Attendees"
				options={internalAttendeeOptions}
				disabled={usersQuery.isLoading || internalAttendeeOptions.length === 0}
				description={usersQuery.isLoading ? "Loading team members…" : internalAttendeeOptions.length === 0 && !usersQuery.isLoading ? "No internal users found" : undefined}
			/>

			{/* ── Row 5: External Attendees ─────────────────────────────────── */}
			<FormTagSelector
				control={control}
				name="external_attendees"
				label="External Attendees"
				options={EXTERNAL_ATTENDEE_OPTIONS}
				description="Select the client-side roles attending this meeting."
			/>
		</div>
	);
}
