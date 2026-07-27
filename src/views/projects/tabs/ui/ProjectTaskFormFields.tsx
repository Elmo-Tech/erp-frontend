"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTaskPermissions } from "@/entities/user/model/permissions";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { FormMultiCombobox } from "@/shared/ui/forms/FormMultiCombobox";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { TaskPriority, TaskPriorityLabels } from "@/shared/lib/statusHelpers";
import type { AddTaskFormData } from "../model/project-task-forms";
import type { ProjectTaskFilterOption } from "../model/project-tasks-filters";

interface ProjectTaskFormFieldsProps {
	form: UseFormReturn<AddTaskFormData>;
	isMembersLoading: boolean;
	milestoneOptions: ProjectTaskFilterOption[];
	assigneeOptions: ProjectTaskFilterOption[];
}

export function ProjectTaskFormFields({ form, isMembersLoading, milestoneOptions, assigneeOptions }: ProjectTaskFormFieldsProps) {
	const { canAssignTasks } = useTaskPermissions();

	return (
		<div className="flex flex-col gap-4">
			<TaskSummaryFields form={form} />
			<TaskAssignmentFields
				form={form}
				isMembersLoading={isMembersLoading}
				milestoneOptions={milestoneOptions}
				assigneeOptions={assigneeOptions}
				canAssignTasks={canAssignTasks}
			/>
			<TaskScheduleFields form={form} />
		</div>
	);
}

function TaskSummaryFields({ form }: { form: UseFormReturn<AddTaskFormData> }) {
	return (
		<>
			<FormInput
				control={form.control}
				name="title"
				label="Task title"
				placeholder="e.g. Build login page"
			/>
			<FormTextarea
				control={form.control}
				name="description"
				label="Description (optional)"
				placeholder="What needs to be done, acceptance criteria, notes…"
				rows={3}
			/>
		</>
	);
}

function TaskAssignmentFields({
	form,
	isMembersLoading,
	milestoneOptions,
	assigneeOptions,
	canAssignTasks,
}: {
	form: UseFormReturn<AddTaskFormData>;
	isMembersLoading: boolean;
	milestoneOptions: ProjectTaskFilterOption[];
	assigneeOptions: ProjectTaskFilterOption[];
	canAssignTasks: boolean;
}) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<FormCombobox
				control={form.control}
				name="milestoneId"
				label="Milestone (optional)"
				placeholder="Backlog — no milestone"
				searchPlaceholder="Search milestones…"
				emptyText="No milestone found."
				options={milestoneOptions}
			/>
			{canAssignTasks && (
				<FormMultiCombobox
					control={form.control}
					name="assigneeIds"
					label="Assignees"
					placeholder={isMembersLoading ? "Loading employees…" : "Select employees…"}
					searchPlaceholder="Search employees…"
					emptyText="No active employee found."
					options={assigneeOptions}
					disabled={isMembersLoading}
					description="The first employee is the primary owner. Everyone selected is added to the project automatically."
				/>
			)}
		</div>
	);
}

function TaskScheduleFields({ form }: { form: UseFormReturn<AddTaskFormData> }) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<FormSelect
				control={form.control}
				name="priority"
				label="Priority"
				options={[
					{ value: TaskPriority.LOW, label: TaskPriorityLabels[TaskPriority.LOW] },
					{ value: TaskPriority.MEDIUM, label: TaskPriorityLabels[TaskPriority.MEDIUM] },
					{ value: TaskPriority.HIGH, label: TaskPriorityLabels[TaskPriority.HIGH] },
					{ value: TaskPriority.URGENT, label: TaskPriorityLabels[TaskPriority.URGENT] },
				]}
			/>
			<FormInput
				control={form.control}
				name="estimatedHours"
				label="Estimated hours"
				type="number"
				placeholder="0"
				min={0}
				step={0.5}
			/>
			<FormDatePicker
				control={form.control}
				name="startDate"
				label="Start date"
			/>
			<FormDatePicker
				control={form.control}
				name="dueDate"
				label="Due date"
			/>
			<FormField
				control={form.control}
				name="coverImage"
				render={({ field: { onChange } }) => (
					<FormItem className="sm:col-span-2">
						<FormLabel>Cover image (optional)</FormLabel>
						<FormControl>
							<Input
								type="file"
								accept="image/png,image/jpeg,image/webp"
								onChange={(event) => onChange(event.target.files?.[0])}
							/>
						</FormControl>
						<p className="text-xs text-muted-foreground">Shown at the top of the pipeline card. Maximum 5 MB.</p>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
