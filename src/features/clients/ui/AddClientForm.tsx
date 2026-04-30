"use client";

import type { UseFormReturn } from "react-hook-form";
import { Building2, UserRound } from "lucide-react";
import { Form } from "@/shared/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { FormInput, FormSelect, FormTagSelector, FormTextarea, type SelectOption } from "@/shared/ui/forms";
import { ClientStatus, ClientStatusLabels, ClientType } from "@/entities/client/model/types";
import type { AddClientFormData } from "../model/client.schema";

interface AddClientFormProps {
	form: UseFormReturn<AddClientFormData>;
	accountManagerOptions?: SelectOption[];
	isLoadingAccountManagers?: boolean;
	disabled?: boolean;
}

const STATUS_OPTIONS = [ClientStatus.ACTIVE, ClientStatus.INACTIVE].map((status) => ({
  value: status,
  label: ClientStatusLabels[status],
}));

const COUNTRY_OPTIONS: SelectOption[] = [
	{ value: "United States", label: "United States" },
	{ value: "United Kingdom", label: "United Kingdom" },
	{ value: "Egypt", label: "Egypt" },
	{ value: "Saudi Arabia", label: "Saudi Arabia" },
	{ value: "United Arab Emirates", label: "United Arab Emirates" },
];

const INTEREST_OPTIONS = [
	{ value: "web-development", label: "Web Development" },
	{ value: "mobile-app", label: "Mobile App" },
	{ value: "branding", label: "Branding" },
	{ value: "automation", label: "Automation" },
	{ value: "support-retainer", label: "Support Retainer" },
	{ value: "consulting", label: "Consulting" },
];

const LEAD_SOURCE_OPTIONS: SelectOption[] = [
	{ value: "organic", label: "Organic Search" },
	{ value: "referral", label: "Referral" },
	{ value: "social", label: "Social Media" },
	{ value: "cold_outreach", label: "Cold Outreach" },
	{ value: "event", label: "Event" },
	{ value: "other", label: "Other" },
];

export function AddClientForm({ form, accountManagerOptions = [], isLoadingAccountManagers = false, disabled = false }: AddClientFormProps) {
	const clientType = form.watch("type");
	const accountManagerPlaceholder = isLoadingAccountManagers ? "Loading users..." : "Unassigned";

	return (
		<Form {...form}>
			<div className="flex flex-col gap-6">
				<Tabs
					value={clientType}
					onValueChange={(value) => form.setValue("type", value as ClientType, { shouldDirty: true, shouldValidate: true })}
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value={ClientType.COMPANY}>
							<Building2 />
							Company
						</TabsTrigger>
						<TabsTrigger value={ClientType.INDIVIDUAL}>
							<UserRound />
							Individual
						</TabsTrigger>
					</TabsList>
				</Tabs>

				{clientType === ClientType.COMPANY && (
					<section className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<h3 className="text-sm font-medium">Company Details</h3>
							<p className="text-xs text-muted-foreground">Primary organization profile and billing contact point.</p>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormInput control={form.control} name="companyName" label="Company Name" placeholder="Acme Inc." disabled={disabled} className="md:col-span-2" />
							<FormInput control={form.control} name="companyPhone" label="Phone" type="tel" placeholder="+1 234 567 890" disabled={disabled} />
							<FormInput control={form.control} name="companyEmail" label="Email" type="email" placeholder="hello@acme.com" disabled={disabled} />
						</div>

						<div className="flex flex-col gap-1 pt-2">
							<h3 className="text-sm font-medium">Contact Person</h3>
							<p className="text-xs text-muted-foreground">The primary person your team will coordinate with.</p>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormInput control={form.control} name="contactFirstName" label="First Name" placeholder="Jane" disabled={disabled} />
							<FormInput control={form.control} name="contactLastName" label="Last Name" placeholder="Cooper" disabled={disabled} />
							<FormInput control={form.control} name="contactPhone" label="Phone" type="tel" placeholder="+1 234 567 891" disabled={disabled} />
							<FormInput control={form.control} name="contactEmail" label="Email" type="email" placeholder="jane@acme.com" disabled={disabled} />
						</div>
					</section>
				)}

				{clientType === ClientType.INDIVIDUAL && (
					<section className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<h3 className="text-sm font-medium">Personal Details</h3>
							<p className="text-xs text-muted-foreground">Core profile information for an individual client.</p>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormInput control={form.control} name="firstName" label="First Name" placeholder="Alex" disabled={disabled} />
							<FormInput control={form.control} name="lastName" label="Last Name" placeholder="Morgan" disabled={disabled} />
							<FormInput control={form.control} name="individualPhone" label="Phone" type="tel" placeholder="+1 234 567 890" disabled={disabled} />
							<FormInput control={form.control} name="individualEmail" label="Email" type="email" placeholder="alex@example.com" disabled={disabled} />
						</div>
					</section>
				)}

				<section className="flex flex-col gap-4 border-t pt-5">
					<div className="flex flex-col gap-1">
						<h3 className="text-sm font-medium">Classification</h3>
						<p className="text-xs text-muted-foreground">Ownership, source, and CRM status for segmentation.</p>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormSelect control={form.control} name="country" label="Country" placeholder="Select country" options={COUNTRY_OPTIONS} disabled={disabled} />
						<FormSelect control={form.control} name="status" label="Status" options={STATUS_OPTIONS} disabled={disabled} />
						<FormSelect control={form.control} name="accountManagerId" label="Account Manager" placeholder={accountManagerPlaceholder} options={accountManagerOptions} disabled={disabled || isLoadingAccountManagers || accountManagerOptions.length === 0} description={isLoadingAccountManagers ? "Loading internal users..." : "Optional. Leave unassigned if ownership is not decided yet."} />
						<FormSelect control={form.control} name="leadSource" label="Lead Source" placeholder="Select source" options={LEAD_SOURCE_OPTIONS} disabled={disabled} />
					</div>
				</section>

				<section className="flex flex-col gap-4 border-t pt-5">
					<FormTagSelector control={form.control} name="interests" label="Interests" options={INTEREST_OPTIONS} disabled={disabled} description="Select every service area that applies to this client." />
					<FormTextarea control={form.control} name="notes" label="Notes" placeholder="Context, preferences, or onboarding notes" rows={3} disabled={disabled} />
				</section>
			</div>
		</Form>
	);
}
