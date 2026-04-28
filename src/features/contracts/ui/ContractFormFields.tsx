"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import type { ContractFormData } from "../model/contract.schema";

interface ContractFormFieldsProps {
	form: UseFormReturn<ContractFormData>;
}

export function ContractFormFields({ form }: ContractFormFieldsProps) {
	return (
		<Form {...form}>
			<div className="grid gap-4 md:grid-cols-2">
				<FormInput control={form.control} name="title" label="Title" />
				<FormInput control={form.control} name="startDate" label="Start date" type="date" />
				<FormInput control={form.control} name="endDate" label="End date" type="date" />
				<FormInput control={form.control} name="totalAmount" label="Total amount" type="number" />
				<FormSelect
					control={form.control}
					name="currency"
					label="Currency"
					options={[
						{ value: "USD", label: "USD" },
						{ value: "EUR", label: "EUR" },
						{ value: "GBP", label: "GBP" },
						{ value: "SAR", label: "SAR" },
						{ value: "EGP", label: "EGP" },
					]}
				/>
				<FormInput control={form.control} name="paymentTerms" label="Payment terms" />
				<div className="md:col-span-2">
					<FormTextarea control={form.control} name="content" label="Contract content" />
				</div>
			</div>
		</Form>
	);
}
