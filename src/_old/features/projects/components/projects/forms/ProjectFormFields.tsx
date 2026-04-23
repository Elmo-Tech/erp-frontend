"use client";

import { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormInput, FormTextarea, FormSelect } from "@/shared/ui";
import { ProjectStatus } from "../../../types/project";

const statusOptions = [
	{ value: ProjectStatus.DRAFT, label: "Draft" },
	{ value: ProjectStatus.ACTIVE, label: "Active" },
	{ value: ProjectStatus.UI_UX, label: "UI/UX" },
	{ value: ProjectStatus.DEVELOPMENT, label: "Development" },
	{ value: ProjectStatus.TESTING, label: "Testing" },
	{ value: ProjectStatus.COMPLETED, label: "Completed" },
	{ value: ProjectStatus.ON_HOLD, label: "On Hold" },
	{ value: ProjectStatus.CANCELLED, label: "Cancelled" },
];

interface ProjectFormFieldsProps {
	form: UseFormReturn<{
		title: string;
		description?: string;
		budget: number;
		deadline?: string;
		status: ProjectStatus;
		reason?: string;
	}>;
	showReasonField?: boolean;
}

export function ProjectFormFields({ form, showReasonField }: ProjectFormFieldsProps) {
	return (
		<Form {...form}>
			<div className="space-y-4">
				<FormInput
					control={form.control}
					name="title"
					label="Project Title"
					placeholder="Enter project title"
				/>

				<FormTextarea
					control={form.control}
					name="description"
					label="Description"
					placeholder="Enter project description"
					rows={3}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormInput
						control={form.control}
						name="budget"
						label="Budget"
						type="number"
						placeholder="0.00"
						min={0}
					/>

					<FormInput
						control={form.control}
						name="deadline"
						label="Deadline"
						type="date"
					/>
				</div>

				<FormSelect
					control={form.control}
					name="status"
					label="Status"
					placeholder="Select status"
					options={statusOptions}
				/>

				{showReasonField && (
					<FormTextarea
						control={form.control}
						name="reason"
						label="Reason for Change"
						placeholder="Explain why budget or deadline is being changed..."
						rows={2}
					/>
				)}
			</div>
		</Form>
	);
}
