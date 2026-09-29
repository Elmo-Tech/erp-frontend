"use client";

import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormDatePicker, FormInput, FormTextarea, FormSelect } from "@/components/shared";
import type { SelectOption } from "@/components/shared/forms/FormSelect";
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
	projectTypeOptions: SelectOption[];
	isProjectTypesLoading?: boolean;
}

export function ProjectFormFields<TFormValues extends FieldValues>({ form, showReasonField, projectTypeOptions, isProjectTypesLoading }: ProjectFormFieldsProps<TFormValues>) {
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

				<FormSelect
					control={form.control}
					name={"projectTypeId" as FieldPath<TFormValues>}
					label="Project Type"
					placeholder={isProjectTypesLoading ? "Loading project types..." : "Select project type"}
					options={projectTypeOptions}
					disabled={isProjectTypesLoading}
					parseValue={(value) => Number(value)}
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
