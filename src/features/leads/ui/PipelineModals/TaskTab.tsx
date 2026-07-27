"use client";

/**
 * TaskTab — rendered inside each stage modal when the user selects "Task".
 *
 * Assigned To uses a FormSelect populated from useGetInternalUsers —
 * the same hook used by AddClientModal and MeetingScheduleTab.
 */

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import type { TaskTabFormValues } from "./stageModal.schema";

export function TaskTab() {
	const { control } = useFormContext<TaskTabFormValues>();

	// Fetch internal users — always enabled since the tab is already mounted
	const usersQuery = useGetInternalUsers(true);

	const userOptions = useMemo(
		() =>
			(usersQuery.data?.users ?? []).map((user) => ({
				value: String(user.id),
				label: user.name,
			})),
		[usersQuery.data?.users],
	);

	return (
		<div className="space-y-4">
			{/* Assigned To — user combobox with search */}
			<FormCombobox
				control={control}
				// assignedTo is a number in the schema; FormCombobox stores strings.
				// The value is coerced to a number in the StageModal submit handler.
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				name={"assignedTo" as any}
				label="Assigned To *"
				placeholder={usersQuery.isLoading ? "Loading users…" : "Select a team member…"}
				searchPlaceholder="Search team members…"
				emptyText="No team member found."
				options={userOptions}
				disabled={usersQuery.isLoading || userOptions.length === 0}
				description={usersQuery.isLoading ? "Loading internal users…" : userOptions.length === 0 && !usersQuery.isLoading ? "No internal users found" : undefined}
			/>

			{/* Deadline */}
			<FormDatePicker
				control={control}
				name="deadline"
				label="Deadline *"
			/>

			{/* Notes */}
			<FormTextarea
				control={control}
				name="taskNotes"
				label="Notes (optional)"
				placeholder="Describe the task…"
				rows={3}
			/>
		</div>
	);
}
