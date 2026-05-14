"use client";

/**
 * ScheduleMeetingFormFields
 *
 * The single source of truth for meeting scheduling form fields.
 *
 * Renders the full 5-row meeting form layout:
 *   Row 1: Meeting Type (full width)
 *   Row 2: Date | Time
 *   Row 3: Location Type | Meeting Link / Location Details
 *   Row 4: Internal Attendees  (FormTagSelector — live users)
 *   Row 5: External Attendees  (FormTagSelector — static roles)
 *
 * Consumes the form context via `useFormContext` — must be rendered inside
 * a `<FormProvider>` that uses `createMeetingSchema` from
 * `@/entities/meetings/model/meeting.schema`.
 *
 * Used by:
 *  - PolyMeetingForm   (Lead / Project detail pages — collapsible inline form)
 *  - MeetingScheduleTab (Lead pipeline stage modal — "Schedule" tab)
 */

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Video } from "lucide-react";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTagSelector, type FormTagOption } from "@/shared/ui/forms/FormTagSelector";
import { useSettingsDictionary } from "@/shared/api/settings.api";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import type { CreateMeetingFormData } from "@/entities/meetings/model/meeting.schema";
import { MEETING_TYPES, MEETING_TYPE_LABELS, LOCATION_TYPES, LOCATION_TYPE_LABELS } from "@/entities/meetings/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Option lists
// ─────────────────────────────────────────────────────────────────────────────

const MEETING_TYPE_OPTIONS = MEETING_TYPES.map((t) => ({
	value: t,
	label: MEETING_TYPE_LABELS[t],
}));

const LOCATION_TYPE_OPTIONS = LOCATION_TYPES.map((t) => ({
	value: t,
	label: LOCATION_TYPE_LABELS[t],
}));

// Static external-attendee role options — no model-specific contacts yet
const EXTERNAL_ATTENDEE_OPTIONS: FormTagOption[] = [
	{ value: "decision-maker", label: "Decision Maker" },
	{ value: "finance-contact", label: "Finance Contact" },
	{ value: "technical-contact", label: "Technical Contact" },
	{ value: "primary-contact", label: "Primary Contact" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ScheduleMeetingFormFields() {
	const { control, setValue } = useFormContext<CreateMeetingFormData>();
	const meetingTypesDict = useSettingsDictionary("meeting-types");
	useSettingsDictionary("meeting-statuses");

	// Watch locationType to swap the label/type of the details field
	const locationType = useWatch({ control, name: "locationType" });
	const isOnline = locationType === "online";

	// Fetch internal users — shared across all usages
	const usersQuery = useGetInternalUsers(true);

	const internalAttendeeOptions = useMemo<FormTagOption[]>(
		() =>
			(usersQuery.data?.users ?? []).map((user) => ({
				value: String(user.id),
				label: user.name,
			})),
		[usersQuery.data?.users],
	);
	const meetingTypeOptions = meetingTypesDict.options.length > 0 ? meetingTypesDict.options : MEETING_TYPE_OPTIONS;

	return (
		<div className="flex flex-col gap-5">
			{/* ── Row 1: Meeting Type (full width) ──────────────────────────── */}
			<FormSelect
				control={control}
				name="meetingType"
				label="Meeting Type"
				placeholder="Select type…"
				options={meetingTypeOptions}
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
					name="locationType"
					label="Location Type"
					placeholder="Select location…"
					options={LOCATION_TYPE_OPTIONS}
					onValueChange={() =>
						setValue("locationDetails", "", {
							shouldDirty: true,
							shouldValidate: false,
						})
					}
				/>
				<FormInput
					control={control}
					name="locationDetails"
					label={isOnline ? "Meeting Link" : "Location Details"}
					type={isOnline ? "url" : "text"}
					placeholder={isOnline ? "https://meet.google.com/…" : "Building, address, room, or notes"}
					endAdornment={isOnline ? <Video className="size-4 text-muted-foreground" /> : undefined}
				/>
			</div>

			{/* ── Row 4: Internal Attendees ─────────────────────────────────── */}
			<FormTagSelector
				control={control}
				name="internalAttendees"
				label="Internal Attendees"
				options={internalAttendeeOptions}
				disabled={usersQuery.isLoading || internalAttendeeOptions.length === 0}
				description={usersQuery.isLoading ? "Loading team members…" : internalAttendeeOptions.length === 0 && !usersQuery.isLoading ? "No internal users found" : undefined}
			/>

			{/* ── Row 5: External Attendees ─────────────────────────────────── */}
			<FormTagSelector
				control={control}
				name="externalAttendees"
				label="External Attendees"
				options={EXTERNAL_ATTENDEE_OPTIONS}
				description="Select the client-side roles attending this meeting."
			/>
		</div>
	);
}
