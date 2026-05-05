"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormDatePicker, FormInput, FormSelect, FormTextarea, type SelectOption } from "@/shared/ui/forms";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { ProjectStatus, ProjectStatusLabels } from "@/entities/project/model/types";
import { PaymentStatus, PaymentStatusLabels, type AddProjectFormData } from "../model/add-project.schema";

interface AddProjectFormProps {
	form: UseFormReturn<AddProjectFormData>;
	salesRepOptions?: SelectOption[];
	isLoadingSalesReps?: boolean;
	disabled?: boolean;
}

const PROJECT_TYPE_OPTIONS: SelectOption[] = [
	{ value: "web-development", label: "Web Development" },
	{ value: "mobile-app", label: "Mobile App" },
	{ value: "branding", label: "Branding" },
	{ value: "automation", label: "Automation" },
	{ value: "consulting", label: "Consulting" },
];

const STATUS_OPTIONS = Object.values(ProjectStatus).map((status) => ({
	value: status,
	label: ProjectStatusLabels[status],
}));

const PAYMENT_STATUS_OPTIONS = Object.values(PaymentStatus).map((status) => ({
	value: status,
	label: PaymentStatusLabels[status],
}));

export function AddProjectForm({ form, salesRepOptions = [], isLoadingSalesReps = false, disabled = false }: AddProjectFormProps) {
	const salesRepPlaceholder = isLoadingSalesReps ? "Loading users..." : "Select sales rep";

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
					<FormInput
						control={form.control}
						name="projectName"
						label="Project Name"
						placeholder="Website redesign"
						disabled={disabled}
						className="md:col-span-2"
					/>
					<FormSelect
						control={form.control}
						name="projectType"
						label="Project Type"
						placeholder="Select project type"
						options={PROJECT_TYPE_OPTIONS}
						disabled={disabled}
					/>
					<FormCombobox
						control={form.control}
						name="assignedSalesRepId"
						label="Assigned Sales Rep"
						placeholder={salesRepPlaceholder}
						searchPlaceholder="Search sales reps…"
						emptyText="No sales rep found."
						options={salesRepOptions}
						disabled={disabled || isLoadingSalesReps || salesRepOptions.length === 0}
						description={isLoadingSalesReps ? "Loading internal users..." : undefined}
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FormSelect
						control={form.control}
						name="status"
						label="Status"
						options={STATUS_OPTIONS}
						disabled={disabled}
					/>
					<FormSelect
						control={form.control}
						name="paymentStatus"
						label="Payment Status"
						options={PAYMENT_STATUS_OPTIONS}
						disabled={disabled}
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FormDatePicker
						control={form.control}
						name="startDate"
						label="Start Date"
						disabled={disabled}
					/>
					<FormDatePicker
						control={form.control}
						name="deliveryDate"
						label="Delivery Date"
						disabled={disabled}
					/>
				</div>

				<FormTextarea
					control={form.control}
					name="details"
					label="Details"
					placeholder="Scope, deliverables, notes, and success criteria"
					rows={4}
					disabled={disabled}
				/>
			</div>
		</Form>
	);
}
