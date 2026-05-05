"use client";

import type { UseFormReturn } from "react-hook-form";
import { Building2, UserRound } from "lucide-react";
import { Form } from "@/shared/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { FormInput, FormSelect, FormTextarea, type SelectOption } from "@/shared/ui/forms";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { FormMultiCombobox } from "@/shared/ui/forms/FormMultiCombobox";
import { ClientStatus, ClientStatusLabels, ClientType } from "@/entities/client/model/types";
import { useSettingsDictionary } from "@/shared/api/settings.api";
import type { AddClientFormData } from "../model/client.schema";

interface AddClientFormProps {
	form: UseFormReturn<AddClientFormData>;
	accountManagerOptions?: SelectOption[];
	isLoadingAccountManagers?: boolean;
	disabled?: boolean;
}

// Status is a 2-item enum — stays as FormSelect (no search needed)
const STATUS_OPTIONS = [ClientStatus.ACTIVE, ClientStatus.INACTIVE].map((status) => ({
	value: status,
	label: ClientStatusLabels[status],
}));

export function AddClientForm({ form, accountManagerOptions = [], isLoadingAccountManagers = false, disabled = false }: AddClientFormProps) {
	const clientType = form.watch("type");
	const accountManagerPlaceholder = isLoadingAccountManagers ? "Loading users..." : "Unassigned";

	// ── Dynamic settings dictionaries ────────────────────────────────────────
	const countriesDict = useSettingsDictionary("countries");
	const leadSourcesDict = useSettingsDictionary("lead-sources");
	const interestsDict = useSettingsDictionary("lead-interests");

	return (
		<Form {...form}>
			<div className="flex flex-col gap-6">
				{/* ── Type switcher ────────────────────────────────────────────── */}
				<Tabs
					value={clientType}
					onValueChange={(value) =>
						form.setValue("type", value as ClientType, {
							shouldDirty: true,
							shouldValidate: true,
						})
					}
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

				{/* ── Company branch ───────────────────────────────────────────── */}
				{clientType === ClientType.COMPANY && (
					<section className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<h3 className="text-sm font-medium">Company Details</h3>
							<p className="text-xs text-muted-foreground">Primary organization profile and billing contact point.</p>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormInput
								control={form.control}
								name="companyName"
								label="Company Name"
								placeholder="Acme Inc."
								disabled={disabled}
								className="md:col-span-2"
							/>
							<FormInput
								control={form.control}
								name="companyPhone"
								label="Phone"
								type="tel"
								placeholder="+1 234 567 890"
								disabled={disabled}
							/>
							<FormInput
								control={form.control}
								name="companyEmail"
								label="Email"
								type="email"
								placeholder="hello@acme.com"
								disabled={disabled}
							/>
						</div>

						<div className="flex flex-col gap-1 pt-2">
							<h3 className="text-sm font-medium">Contact Person</h3>
							<p className="text-xs text-muted-foreground">The primary person your team will coordinate with.</p>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormInput
								control={form.control}
								name="contactFirstName"
								label="First Name"
								placeholder="Jane"
								disabled={disabled}
							/>
							<FormInput
								control={form.control}
								name="contactLastName"
								label="Last Name"
								placeholder="Cooper"
								disabled={disabled}
							/>
							<FormInput
								control={form.control}
								name="contactPhone"
								label="Phone"
								type="tel"
								placeholder="+1 234 567 891"
								disabled={disabled}
							/>
							<FormInput
								control={form.control}
								name="contactEmail"
								label="Email"
								type="email"
								placeholder="jane@acme.com"
								disabled={disabled}
							/>
						</div>
					</section>
				)}

				{/* ── Individual branch ────────────────────────────────────────── */}
				{clientType === ClientType.INDIVIDUAL && (
					<section className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<h3 className="text-sm font-medium">Personal Details</h3>
							<p className="text-xs text-muted-foreground">Core profile information for an individual client.</p>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormInput
								control={form.control}
								name="firstName"
								label="First Name"
								placeholder="Alex"
								disabled={disabled}
							/>
							<FormInput
								control={form.control}
								name="lastName"
								label="Last Name"
								placeholder="Morgan"
								disabled={disabled}
							/>
							<FormInput
								control={form.control}
								name="individualPhone"
								label="Phone"
								type="tel"
								placeholder="+1 234 567 890"
								disabled={disabled}
							/>
							<FormInput
								control={form.control}
								name="individualEmail"
								label="Email"
								type="email"
								placeholder="alex@example.com"
								disabled={disabled}
							/>
						</div>
					</section>
				)}

				{/* ── Classification ───────────────────────────────────────────── */}
				<section className="flex flex-col gap-4 border-t pt-5">
					<div className="flex flex-col gap-1">
						<h3 className="text-sm font-medium">Classification</h3>
						<p className="text-xs text-muted-foreground">Ownership, source, and CRM status for segmentation.</p>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Country — dynamic from settings/countries, searchable */}
						<FormCombobox
							control={form.control}
							name="country"
							label="Country"
							placeholder={countriesDict.isLoading ? "Loading countries…" : "Select country…"}
							searchPlaceholder="Search countries…"
							emptyText="No country found."
							options={countriesDict.options}
							disabled={disabled || countriesDict.isLoading}
						/>

						{/* Status — 2-item enum, stays as FormSelect */}
						<FormSelect
							control={form.control}
							name="status"
							label="Status"
							options={STATUS_OPTIONS}
							disabled={disabled}
						/>

						{/* Account Manager — dynamic internal users */}
						<FormCombobox
							control={form.control}
							name="accountManagerId"
							label="Account Manager"
							placeholder={accountManagerPlaceholder}
							searchPlaceholder="Search users…"
							emptyText="No user found."
							options={accountManagerOptions}
							disabled={disabled || isLoadingAccountManagers || accountManagerOptions.length === 0}
							description={isLoadingAccountManagers ? "Loading internal users..." : "Optional. Leave unassigned if ownership is not decided yet."}
						/>

						{/* Lead Source — dynamic from settings/lead-sources */}
						<FormCombobox
							control={form.control}
							name="leadSource"
							label="Lead Source"
							placeholder={leadSourcesDict.isLoading ? "Loading sources…" : "Select source…"}
							searchPlaceholder="Search sources…"
							emptyText="No source found."
							options={leadSourcesDict.options}
							disabled={disabled || leadSourcesDict.isLoading}
						/>
					</div>
				</section>

				{/* ── Interests & Notes ────────────────────────────────────────── */}
				<section className="flex flex-col gap-4 border-t pt-5">
					{/* Interests — dynamic from settings/lead-interests, multi-select */}
					<FormMultiCombobox
						control={form.control}
						name="interests"
						label="Interests"
						placeholder={interestsDict.isLoading ? "Loading interests…" : "Select service areas…"}
						searchPlaceholder="Search interests…"
						emptyText="No interest found."
						options={interestsDict.options}
						disabled={disabled || interestsDict.isLoading}
						description="Select every service area that applies to this client."
					/>

					<FormTextarea
						control={form.control}
						name="notes"
						label="Notes"
						placeholder="Context, preferences, or onboarding notes"
						rows={3}
						disabled={disabled}
					/>
				</section>
			</div>
		</Form>
	);
}
