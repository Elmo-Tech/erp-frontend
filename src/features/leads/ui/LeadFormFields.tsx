"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { LeadSourceLabels, LeadPriorityLabels, LeadTemperatureLabels, LeadStatusLabels } from "@/entities/lead/model/types";
import type { LeadFormData } from "../model/lead.schema";

interface LeadFormFieldsProps {
	form: UseFormReturn<LeadFormData>;
}

const sourceOptions = Object.entries(LeadSourceLabels).map(([value, label]) => ({ value, label: String(label) }));
const priorityOptions = Object.entries(LeadPriorityLabels).map(([value, label]) => ({ value, label: String(label) }));
const temperatureOptions = Object.entries(LeadTemperatureLabels).map(([value, label]) => ({ value, label: String(label) }));
const statusOptions = Object.entries(LeadStatusLabels).map(([value, label]) => ({ value, label: String(label) }));

export function LeadFormFields({ form }: LeadFormFieldsProps) {
	return (
		<Form {...form}>
			<div className="grid gap-4 md:grid-cols-2">
				<FormInput control={form.control} name="name" label="Name" />
				<FormInput control={form.control} name="email" label="Email" />
				<FormInput control={form.control} name="phone" label="Phone" />
				<FormInput control={form.control} name="company" label="Company" />
				<FormInput control={form.control} name="projectName" label="Project name" />
				<FormInput control={form.control} name="country" label="Country" />
				<FormSelect control={form.control} name="source" label="Source" options={sourceOptions} placeholder="Select source" />
				<FormSelect control={form.control} name="priority" label="Priority" options={priorityOptions} placeholder="Select priority" />
				<FormSelect control={form.control} name="leadTemperature" label="Temperature" options={temperatureOptions} placeholder="Select temperature" />
				<FormSelect control={form.control} name="status" label="Status" options={statusOptions} placeholder="Select status" />
				<FormInput control={form.control} name="expectedBudget" label="Expected budget" type="number" />
				<FormInput control={form.control} name="expectedCloseDate" label="Expected close date" type="date" />
				<div className="md:col-span-2">
					<FormTextarea control={form.control} name="notes" label="Notes" />
				</div>
			</div>
		</Form>
	);
}
