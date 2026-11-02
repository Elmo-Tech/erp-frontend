"use client";

import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormDatePicker, FormInput, FormTextarea, FormSelect } from "@/components/shared";
import type { SelectOption } from "@/components/shared/forms/FormSelect";

interface ProjectFormFieldsProps<TFormValues extends FieldValues> {
	form: UseFormReturn<TFormValues>;
	showReasonField?: boolean;
	projectTypeOptions: SelectOption[];
	isProjectTypesLoading?: boolean;
	statusOptions: SelectOption[];
	isStatusesLoading?: boolean;
}

export function ProjectFormFields<TFormValues extends FieldValues>({ form, showReasonField, projectTypeOptions, isProjectTypesLoading, statusOptions, isStatusesLoading }: ProjectFormFieldsProps<TFormValues>) {
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
					placeholder={isStatusesLoading ? "Loading statuses..." : "Select status"}
					options={statusOptions}
					disabled={isStatusesLoading}
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
