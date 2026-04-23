"use client";

import { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect } from "@/shared/ui";
import { CreateLeadFormData } from "../../../schemas/leadSchema";
import { LeadStatus, LeadSource } from "../../../types/lead";

const STATUS_OPTIONS = [
	{ value: LeadStatus.NEW, label: "New" },
	{ value: LeadStatus.CONTACTED, label: "Contacted" },
	{ value: LeadStatus.QUALIFIED, label: "Qualified" },
	{ value: LeadStatus.PROPOSAL, label: "Proposal" },
	{ value: LeadStatus.NEGOTIATION, label: "Negotiation" },
	{ value: LeadStatus.WON, label: "Won" },
	{ value: LeadStatus.LOST, label: "Lost" },
];

const SOURCE_OPTIONS = [
	{ value: LeadSource.WEBSITE, label: "Website" },
	{ value: LeadSource.REFERRAL, label: "Referral" },
	{ value: LeadSource.LINKEDIN, label: "LinkedIn" },
	{ value: LeadSource.FACEBOOK, label: "Facebook" },
	{ value: LeadSource.GOOGLE, label: "Google" },
	{ value: LeadSource.DIRECT, label: "Direct" },
	{ value: LeadSource.OTHER, label: "Other" },
];

interface LeadFormFieldsProps {
	form: UseFormReturn<CreateLeadFormData>;
}

export function LeadFormFields({ form }: LeadFormFieldsProps) {
	return (
		<Form {...form}>
			<div className="space-y-4">
				<FormInput
					control={form.control}
					name="name"
					label="Name"
					placeholder="Enter lead name"
				/>

				<FormInput
					control={form.control}
					name="email"
					label="Email"
					type="email"
					placeholder="Enter email address"
				/>

				<FormInput
					control={form.control}
					name="company"
					label="Company"
					placeholder="Enter company name (optional)"
				/>

				<FormSelect
					control={form.control}
					name="source"
					label="Source"
					placeholder="Select lead source"
					options={SOURCE_OPTIONS}
				/>

				<FormSelect
					control={form.control}
					name="status"
					label="Status"
					placeholder="Select status"
					options={STATUS_OPTIONS}
				/>
			</div>
		</Form>
	);
}
