"use client";

import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { CreateInvoiceFormData } from "../../../schemas/invoiceSchema";

const currencyOptions = [
	{ value: "USD", label: "USD - US Dollar" },
	{ value: "EUR", label: "EUR - Euro" },
	{ value: "GBP", label: "GBP - British Pound" },
	{ value: "SAR", label: "SAR - Saudi Riyal" },
	{ value: "AED", label: "AED - UAE Dirham" },
	{ value: "EGP", label: "EGP - Egyptian Pound" },
];

interface InvoiceFormFieldsProps {
	form: UseFormReturn<CreateInvoiceFormData>;
	projectOptions: { value: string; label: string }[];
}

export function InvoiceFormFields({ form, projectOptions }: InvoiceFormFieldsProps) {
	return (
		<Form {...form}>
			<div className="space-y-4">
				<FormSelect<CreateInvoiceFormData>
					control={form.control}
					name="projectId"
					label="Project"
					placeholder="Select project"
					options={projectOptions}
					onValueChange={(value: string) => form.setValue("projectId", Number(value))}
				/>

				<FormInput<CreateInvoiceFormData>
					control={form.control}
					name="amount"
					label="Amount"
					type="number"
					placeholder="0.00"
				/>

				<FormSelect<CreateInvoiceFormData>
					control={form.control}
					name="currency"
					label="Currency"
					placeholder="Select currency"
					options={currencyOptions}
				/>

				<FormInput<CreateInvoiceFormData>
					control={form.control}
					name="dueDate"
					label="Due Date"
					type="date"
				/>

				<FormTextarea<CreateInvoiceFormData>
					control={form.control}
					name="notes"
					label="Notes"
					placeholder="Enter invoice notes (optional)"
				/>
			</div>
		</Form>
	);
}
