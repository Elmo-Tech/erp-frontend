"use client";

/**
 * MeetingScheduleTab
 *
 * Rendered inside the Meeting stage modal — "Schedule" mode.
 * Replicates the exact layout of the Client module's ScheduleMeetingForm:
 *
 *  Row 1 (2-col): Meeting Type (full width)
 *  Row 2 (2-col): Date | Time
 *  Row 3 (2-col): Location Type | Meeting Link / Location Details
 *  Row 4 (full):  Internal Attendees  (FormTagSelector)
 *  Row 5 (full):  External Attendees  (FormTagSelector)
 *
 * Internal attendees are fetched live from /api/v1/internal-users.
 * External attendees use a static set of role-based options (same pattern
 * as the Client module — no lead-specific contacts exist yet).
 */

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Video } from "lucide-react";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTagSelector } from "@/shared/ui/forms/FormTagSelector";
import type { FormTagOption } from "@/shared/ui/forms/FormTagSelector";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import type { MeetingScheduleValues } from "./stageModal.schema";

// ─────────────────────────────────────────────────────────────────────────────
// Option lists — mirrors meeting.schema.ts constants exactly
// ─────────────────────────────────────────────────────────────────────────────

const MEETING_TYPE_OPTIONS = [
	{ value: "discovery", label: "Discovery" },
	{ value: "kickoff", label: "Kickoff" },
	{ value: "review", label: "Review" },
	{ value: "status", label: "Status Review" },
	{ value: "handover", label: "Handover" },
	{ value: "demo", label: "Demo" },
	{ value: "negotiation", label: "Negotiation" },
];

const LOCATION_TYPE_OPTIONS = [
	{ value: "online", label: "Online" },
	{ value: "client_site", label: "Client Site" },
	{ value: "our_office", label: "Our Office" },
	{ value: "other", label: "Other" },
];

// Static external-attendee role options (no lead-specific contacts yet)
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

	// Live-watch location_type to swap the label/type of the details field
	const locationType = useWatch({ control, name: "location_type" }) as string | undefined;
	const isOnline = locationType === "online";

	// Fetch internal users — same hook used by the Client module
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
			{/* ── Row 1: Meeting Type (full width) ──────────────────────────── */}
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
					placeholder={isOnline ? "https://meet.google.com/…" : "Building, address, room, or notes"}
					endAdornment={isOnline ? <Video className="size-4 text-muted-foreground" /> : undefined}
				/>
			</div>

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
