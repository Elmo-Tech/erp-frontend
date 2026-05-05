"use client";

import type { UseFormReturn } from "react-hook-form";
import { Video } from "lucide-react";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect, FormTagSelector, type FormTagOption, type SelectOption } from "@/shared/ui/forms";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { LocationType, LocationTypeLabels, MeetingType, MeetingTypeLabels, type ScheduleMeetingFormData } from "../model/meeting.schema";

interface ScheduleMeetingFormProps {
	form: UseFormReturn<ScheduleMeetingFormData>;
	projectOptions?: SelectOption[];
	internalAttendeeOptions?: FormTagOption[];
	externalAttendeeOptions?: FormTagOption[];
	isLoadingInternalUsers?: boolean;
	disabled?: boolean;
}

const MEETING_TYPE_OPTIONS = Object.values(MeetingType).map((type) => ({
	value: type,
	label: MeetingTypeLabels[type],
}));

const LOCATION_TYPE_OPTIONS = Object.values(LocationType).map((type) => ({
	value: type,
	label: LocationTypeLabels[type],
}));

export function ScheduleMeetingForm({ form, projectOptions = [], internalAttendeeOptions = [], externalAttendeeOptions = [], isLoadingInternalUsers = false, disabled = false }: ScheduleMeetingFormProps) {
	const locationType = form.watch("location_type");
	const isOnlineMeeting = locationType === LocationType.ONLINE;

	return (
		<Form {...form}>
			<div className="flex flex-col gap-5">
				<FormInput
					control={form.control}
					name="clientName"
					label="Client"
					disabled
					inputClassName="bg-muted/40"
				/>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FormCombobox
						control={form.control}
						name="relatedProjectId"
						label="Related Project"
						placeholder="Optional"
						searchPlaceholder="Search projects…"
						emptyText="No project found."
						options={projectOptions}
						disabled={disabled || projectOptions.length === 0}
					/>
					<FormSelect
						control={form.control}
						name="meetingType"
						label="Meeting Type"
						options={MEETING_TYPE_OPTIONS}
						disabled={disabled}
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FormInput
						control={form.control}
						name="date"
						label="Date"
						type="date"
						disabled={disabled}
					/>
					<FormInput
						control={form.control}
						name="time"
						label="Time"
						type="time"
						disabled={disabled}
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FormSelect
						control={form.control}
						name="location_type"
						label="Location Type"
						options={LOCATION_TYPE_OPTIONS}
						disabled={disabled}
						onValueChange={() => form.setValue("location_details", "", { shouldDirty: true, shouldValidate: false })}
					/>
					<FormInput
						control={form.control}
						name="location_details"
						label={isOnlineMeeting ? "Meeting Link" : "Location Details"}
						type={isOnlineMeeting ? "url" : "text"}
						placeholder={isOnlineMeeting ? "https://meet.google.com/..." : "Building, address, room, or notes"}
						disabled={disabled}
						endAdornment={isOnlineMeeting ? <Video className="size-4 text-muted-foreground" /> : undefined}
					/>
				</div>

				<FormTagSelector
					control={form.control}
					name="internalAttendees"
					label="Internal Attendees"
					options={internalAttendeeOptions}
					disabled={disabled || isLoadingInternalUsers || internalAttendeeOptions.length === 0}
					description={isLoadingInternalUsers ? "Loading internal users..." : undefined}
				/>

				<FormTagSelector
					control={form.control}
					name="externalAttendees"
					label="External Attendees"
					options={externalAttendeeOptions}
					disabled={disabled}
				/>
			</div>
		</Form>
	);
}
