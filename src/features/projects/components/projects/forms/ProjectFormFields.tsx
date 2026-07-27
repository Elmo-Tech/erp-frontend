"use client";

import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormDatePicker, FormInput, FormTextarea, FormSelect } from "@/components/shared";
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

interface ProjectFormFieldsProps<TFormValues extends FieldValues> {
	form: UseFormReturn<TFormValues>;
	showReasonField?: boolean;
}

export function ProjectFormFields<TFormValues extends FieldValues>({ form, showReasonField }: ProjectFormFieldsProps<TFormValues>) {
	return (
		<Form {...form}>
			<div className="space-y-4">
				<FormInput
					control={form.control}
					name={"title" as FieldPath<TFormValues>}
					label="Project Title"
					placeholder="Enter project title"
				/>

				<FormTextarea
					control={form.control}
					name={"description" as FieldPath<TFormValues>}
					label="Description"
					placeholder="Enter project description"
					rows={3}
				/>

				<FormDatePicker
					control={form.control}
					name={"deadline" as FieldPath<TFormValues>}
					label="Deadline"
				/>

				<FormSelect
					control={form.control}
					name={"status" as FieldPath<TFormValues>}
					label="Status"
					placeholder="Select status"
					options={statusOptions}
				/>

				{showReasonField && (
					<FormTextarea
						control={form.control}
						name={"reason" as FieldPath<TFormValues>}
						label="Reason for Change"
						placeholder="Explain why the deadline is being changed..."
						rows={2}
					/>
				)}
			</div>
		</Form>
	);
}
