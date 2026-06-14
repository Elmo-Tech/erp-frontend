"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect, type SelectOption } from "@/shared/ui/forms/FormSelect";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { ProjectStatus, ProjectStatusLabels } from "@/entities/project/model/types";
import type { CreateDirectProjectFormData } from "../model/project.schema";

interface ProjectFormFieldsProps {
	form: UseFormReturn<CreateDirectProjectFormData>;
	clientOptions: SelectOption[];
	lockClient?: boolean;
}

const STATUS_OPTIONS = Object.values(ProjectStatus).map((status) => ({
	value: status,
	label: ProjectStatusLabels[status],
}));

export function ProjectFormFields({ form, clientOptions, lockClient = false }: ProjectFormFieldsProps) {
	return (
		<Form {...form}>
			<div className="flex flex-col gap-4">
				<FormCombobox
					control={form.control}
					name="clientId"
					label="Client"
					placeholder="Select client…"
					searchPlaceholder="Search clients…"
					emptyText="No client found."
					options={clientOptions}
					disabled={lockClient}
				/>

				<FormInput
					control={form.control}
					name="title"
					label="Project title"
					placeholder="Website redesign"
				/>

				<FormTextarea
					control={form.control}
					name="description"
					label="Description"
					placeholder="Scope, goals, or internal notes"
					rows={3}
				/>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
					placeholder="Select status…"
					options={STATUS_OPTIONS}
				/>
			</div>
		</Form>
	);
}
