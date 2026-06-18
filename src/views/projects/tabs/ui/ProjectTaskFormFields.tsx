"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
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
	return (
		<div className="flex flex-col gap-4">
			<TaskSummaryFields form={form} />
			<TaskAssignmentFields
				form={form}
				isMembersLoading={isMembersLoading}
				milestoneOptions={milestoneOptions}
				assigneeOptions={assigneeOptions}
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
}: {
	form: UseFormReturn<AddTaskFormData>;
	isMembersLoading: boolean;
	milestoneOptions: ProjectTaskFilterOption[];
	assigneeOptions: ProjectTaskFilterOption[];
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
			<FormCombobox
				control={form.control}
				name="assigneeId"
				label="Assignee (optional)"
				placeholder={isMembersLoading ? "Loading members…" : "Unassigned"}
				searchPlaceholder="Search team members…"
				emptyText="No member found."
				options={assigneeOptions}
				disabled={isMembersLoading}
			/>
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
			<FormInput
				control={form.control}
				name="startDate"
				label="Start date"
				type="date"
			/>
			<FormInput
				control={form.control}
				name="dueDate"
				label="Due date"
				type="date"
			/>
		</div>
	);
}
