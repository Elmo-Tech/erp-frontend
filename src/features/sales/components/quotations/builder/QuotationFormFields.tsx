"use client";

import { UseFormReturn } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { FormInput, FormSelect } from "@/components/shared";
import { QuotationFormData, CURRENCY_OPTIONS, STATUS_OPTIONS } from "./quotationBuilderSchema";

interface LeadOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface QuotationFormFieldsProps {
	form: UseFormReturn<QuotationFormData>;
	leadOptions: LeadOption[];
}

export function QuotationFormFields({ form, leadOptions }: QuotationFormFieldsProps) {
	return (
		<div className="space-y-6">
			{/* Lead Selection & Status */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormSelect
					control={form.control}
					name="leadId"
					label="Select Lead *"
					placeholder="Choose a lead..."
					options={leadOptions}
					onValueChange={(value) => form.setValue("leadId", parseInt(value))}
				/>
				<FormSelect
					control={form.control}
					name="status"
					label="Status"
					placeholder="Select status"
					options={STATUS_OPTIONS}
				/>
			</div>

			<Separator />

			{/* Estimation Hours */}
			<EstimationFields form={form} />

			<Separator />

			{/* Pricing Configuration */}
			<PricingFields form={form} />
		</div>
	);
}

function EstimationFields({ form }: { form: UseFormReturn<QuotationFormData> }) {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Project Estimations</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<FormInput
					control={form.control}
					name="frontendHours"
					label="Frontend Hours"
					type="number"
					placeholder="0"
					min={0}
					step="0.5"
				/>
				<FormInput
					control={form.control}
					name="backendHours"
					label="Backend Hours"
					type="number"
					placeholder="0"
					min={0}
					step="0.5"
				/>
				<FormInput
					control={form.control}
					name="uiUxHours"
					label="UI/UX Hours"
					type="number"
					placeholder="0"
					min={0}
					step="0.5"
				/>
				<FormInput
					control={form.control}
					name="testingHours"
					label="Testing Hours"
					type="number"
					placeholder="0"
					min={0}
					step="0.5"
				/>
				<FormInput
					control={form.control}
					name="pmHours"
					label="Project Management Hours"
					type="number"
					placeholder="0"
					min={0}
					step="0.5"
				/>
			</div>
		</div>
	);
}

function PricingFields({ form }: { form: UseFormReturn<QuotationFormData> }) {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Pricing Configuration</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<FormInput
					control={form.control}
					name="hourlyRate"
					label="Hourly Rate *"
					type="number"
					placeholder="100.00"
					min={0.01}
					step="0.01"
				/>
				<FormInput
					control={form.control}
					name="discountPercentage"
					label="Discount (%)"
					type="number"
					placeholder="0"
					min={0}
					max={100}
					step="0.1"
				/>
				<FormSelect
					control={form.control}
					name="currency"
					label="Currency"
					placeholder="Select currency"
					options={CURRENCY_OPTIONS}
				/>
			</div>
		</div>
	);
}
