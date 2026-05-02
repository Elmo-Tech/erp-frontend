"use client";

/**
 * CreateLeadModal
 *
 * Mirrors the AddClientModal / AddClientForm pattern exactly:
 *  - Company vs Individual segmented tab at the top
 *  - Company: Company Details + Contact Person sections
 *  - Individual: Personal Details section
 *  - Lead-specific section: Expected Budget, Currency, Lead Source, Account Manager
 *  - Notes at the bottom
 *
 * Uses FormDialog (shared wrapper), useGetInternalUsers for account manager,
 * and the same grid/spacing conventions as AddClientForm.
 */

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, UserRound } from "lucide-react";

import { Form } from "@/shared/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import type { SelectOption } from "@/shared/ui/forms/FormSelect";

import { useGetInternalUsers } from "@/entities/user/api/user.api";
import { createLead } from "../api/leads.api";
import { usePipelineStore } from "../model/usePipelineStore";
import type { Lead } from "../model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const LEAD_TYPE = {
	COMPANY: "company",
	INDIVIDUAL: "individual",
} as const;
type LeadType = (typeof LEAD_TYPE)[keyof typeof LEAD_TYPE];

const SOURCE_OPTIONS: SelectOption[] = [
	{ value: "referral", label: "Referral" },
	{ value: "website", label: "Website" },
	{ value: "social_media", label: "Social Media" },
	{ value: "cold_outreach", label: "Cold Outreach" },
	{ value: "event", label: "Event / Conference" },
	{ value: "partner", label: "Partner" },
	{ value: "other", label: "Other" },
];

const CURRENCY_OPTIONS: SelectOption[] = [
	{ value: "USD", label: "USD — US Dollar" },
	{ value: "EUR", label: "EUR — Euro" },
	{ value: "GBP", label: "GBP — British Pound" },
	{ value: "SAR", label: "SAR — Saudi Riyal" },
	{ value: "AED", label: "AED — UAE Dirham" },
	{ value: "EGP", label: "EGP — Egyptian Pound" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Schema — mirrors addClientSchema structure
// ─────────────────────────────────────────────────────────────────────────────

const formText = z.string().trim();
const optionalEmail = z.string().trim().email("Invalid email").optional().or(z.literal(""));

const leadClassificationSchema = z.object({
	budget_currency: formText,
	expected_budget: z.union([z.number().min(0, "Budget must be ≥ 0"), z.literal("")]).optional(),
	source: formText,
	account_manager_id: formText.optional(),
	notes: formText,
});

const companyLeadSchema = leadClassificationSchema.extend({
	type: z.literal(LEAD_TYPE.COMPANY),
	// Company details
	companyName: z.string().trim().min(1, "Company name is required"),
	companyPhone: formText,
	companyEmail: optionalEmail,
	// Contact person
	contactFirstName: z.string().trim().min(1, "Contact first name is required"),
	contactLastName: z.string().trim().min(1, "Contact last name is required"),
	contactPhone: formText,
	contactEmail: optionalEmail,
	// Inactive individual fields
	firstName: formText.optional(),
	lastName: formText.optional(),
	individualPhone: formText.optional(),
	individualEmail: optionalEmail,
});

const individualLeadSchema = leadClassificationSchema.extend({
	type: z.literal(LEAD_TYPE.INDIVIDUAL),
	firstName: z.string().trim().min(1, "First name is required"),
	lastName: z.string().trim().min(1, "Last name is required"),
	individualPhone: formText,
	individualEmail: optionalEmail,
	// Inactive company fields
	companyName: formText.optional(),
	companyPhone: formText.optional(),
	companyEmail: optionalEmail,
	contactFirstName: formText.optional(),
	contactLastName: formText.optional(),
	contactPhone: formText.optional(),
	contactEmail: optionalEmail,
});

const createLeadSchema = z.discriminatedUnion("type", [companyLeadSchema, individualLeadSchema]);

type CreateLeadFormInput = z.input<typeof createLeadSchema>;
type CreateLeadFormOutput = z.output<typeof createLeadSchema>;

const DEFAULT_VALUES: CreateLeadFormInput = {
	type: LEAD_TYPE.COMPANY,
	companyName: "",
	companyPhone: "",
	companyEmail: "",
	contactFirstName: "",
	contactLastName: "",
	contactPhone: "",
	contactEmail: "",
	firstName: "",
	lastName: "",
	individualPhone: "",
	individualEmail: "",
	budget_currency: "USD",
	expected_budget: "",
	source: "",
	account_manager_id: "",
	notes: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface CreateLeadModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CreateLeadModal({ open, onOpenChange }: CreateLeadModalProps) {
	const addLead = usePipelineStore((s) => s.addLead);

	const form = useForm<CreateLeadFormInput, unknown, CreateLeadFormOutput>({
		resolver: zodResolver(createLeadSchema),
		defaultValues: DEFAULT_VALUES,
		shouldUnregister: true,
	});

	// Fetch internal users for account manager — same hook as AddClientModal
	const usersQuery = useGetInternalUsers(open);
	const accountManagerOptions = useMemo<SelectOption[]>(
		() =>
			(usersQuery.data?.users ?? []).map((user) => ({
				value: String(user.id),
				label: user.name,
			})),
		[usersQuery.data?.users],
	);

	const leadType = form.watch("type") as "company" | "individual";
	const isSubmitting = form.formState.isSubmitting;

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) form.reset(DEFAULT_VALUES);
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateLeadFormOutput) => {
		// Build the title and contact fields from the type-specific fields
		let title: string;
		let company_name: string | null = null;
		let contact_name: string | null = null;
		let primary_email: string | null = null;
		let primary_phone: string | null = null;

		if (data.type === LEAD_TYPE.COMPANY) {
			title = data.companyName.trim();
			company_name = data.companyName.trim() || null;
			const fullName = [data.contactFirstName, data.contactLastName]
				.map((s) => s?.trim())
				.filter(Boolean)
				.join(" ");
			contact_name = fullName || null;
			primary_email = data.companyEmail?.trim() || null;
			primary_phone = data.companyPhone?.trim() || null;
		} else {
			const fullName = [data.firstName, data.lastName]
				.map((s) => s?.trim())
				.filter(Boolean)
				.join(" ");
			title = fullName;
			contact_name = fullName || null;
			primary_email = data.individualEmail?.trim() || null;
			primary_phone = data.individualPhone?.trim() || null;
		}

		try {
			const response = await createLead({
				title,
				company_name,
				contact_name,
				primary_email,
				primary_phone,
				expected_budget: data.expected_budget !== undefined && data.expected_budget !== "" ? Number(data.expected_budget) : null,
				source: data.source?.trim() || null,
				notes: data.notes?.trim() || null,
			});

			const newLead: Lead = {
				id: response.data.id,
				name: response.data.title,
				company: response.data.company ?? undefined,
				email: response.data.email ?? undefined,
				phone: response.data.phone ?? undefined,
				stage: "new",
				assignedTo: response.data.assignedTo ?? undefined,
				createdAt: response.data.createdAt,
				updatedAt: response.data.updatedAt,
			};

			addLead(newLead);
			toast.success(`Lead "${response.data.title}" added to the pipeline!`);
			handleOpenChange(false);
		} catch (err) {
			console.error("[CreateLeadModal] Failed to create lead:", err);
			toast.error("Failed to create lead. Please try again.");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Add New Lead"
			description="Create a company or individual lead and drop it into the pipeline."
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Add Lead"
			isLoading={isSubmitting}
			size="4xl"
		>
			<Form {...form}>
				<div className="flex flex-col gap-6">
					{/* ── Type switcher — identical to AddClientForm ──────────── */}
					<Tabs
						value={leadType}
						onValueChange={(value) =>
							form.setValue("type", value as LeadType, {
								shouldDirty: true,
								shouldValidate: true,
							})
						}
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value={LEAD_TYPE.COMPANY}>
								<Building2 className="mr-2 size-4" />
								Company
							</TabsTrigger>
							<TabsTrigger value={LEAD_TYPE.INDIVIDUAL}>
								<UserRound className="mr-2 size-4" />
								Individual
							</TabsTrigger>
						</TabsList>
					</Tabs>

					{/* ── Company branch ──────────────────────────────────────── */}
					{leadType === LEAD_TYPE.COMPANY && (
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
									disabled={isSubmitting}
									className="md:col-span-2"
								/>
								<FormInput
									control={form.control}
									name="companyPhone"
									label="Phone"
									type="tel"
									placeholder="+1 234 567 890"
									disabled={isSubmitting}
								/>
								<FormInput
									control={form.control}
									name="companyEmail"
									label="Email"
									type="email"
									placeholder="hello@acme.com"
									disabled={isSubmitting}
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
									disabled={isSubmitting}
								/>
								<FormInput
									control={form.control}
									name="contactLastName"
									label="Last Name"
									placeholder="Cooper"
									disabled={isSubmitting}
								/>
								<FormInput
									control={form.control}
									name="contactPhone"
									label="Phone"
									type="tel"
									placeholder="+1 234 567 891"
									disabled={isSubmitting}
								/>
								<FormInput
									control={form.control}
									name="contactEmail"
									label="Email"
									type="email"
									placeholder="jane@acme.com"
									disabled={isSubmitting}
								/>
							</div>
						</section>
					)}

					{/* ── Individual branch ───────────────────────────────────── */}
					{leadType === LEAD_TYPE.INDIVIDUAL && (
						<section className="flex flex-col gap-4">
							<div className="flex flex-col gap-1">
								<h3 className="text-sm font-medium">Personal Details</h3>
								<p className="text-xs text-muted-foreground">Core profile information for an individual lead.</p>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormInput
									control={form.control}
									name="firstName"
									label="First Name"
									placeholder="Alex"
									disabled={isSubmitting}
								/>
								<FormInput
									control={form.control}
									name="lastName"
									label="Last Name"
									placeholder="Morgan"
									disabled={isSubmitting}
								/>
								<FormInput
									control={form.control}
									name="individualPhone"
									label="Phone"
									type="tel"
									placeholder="+1 234 567 890"
									disabled={isSubmitting}
								/>
								<FormInput
									control={form.control}
									name="individualEmail"
									label="Email"
									type="email"
									placeholder="alex@example.com"
									disabled={isSubmitting}
								/>
							</div>
						</section>
					)}

					{/* ── Lead-specific classification ────────────────────────── */}
					<section className="flex flex-col gap-4 border-t pt-5">
						<div className="flex flex-col gap-1">
							<h3 className="text-sm font-medium">Deal Details</h3>
							<p className="text-xs text-muted-foreground">Budget, source, and ownership for pipeline tracking.</p>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormSelect
								control={form.control}
								name="budget_currency"
								label="Currency"
								placeholder="Select currency…"
								options={CURRENCY_OPTIONS}
								disabled={isSubmitting}
							/>
							<FormInput
								control={form.control}
								name="expected_budget"
								label="Expected Budget"
								type="number"
								placeholder="0.00"
								min={0}
								step={0.01}
								disabled={isSubmitting}
							/>
							<FormSelect
								control={form.control}
								name="source"
								label="Lead Source"
								placeholder="Select source…"
								options={SOURCE_OPTIONS}
								disabled={isSubmitting}
							/>
							<FormSelect
								control={form.control}
								name="account_manager_id"
								label="Account Manager"
								placeholder={usersQuery.isLoading ? "Loading users…" : "Unassigned"}
								options={accountManagerOptions}
								disabled={isSubmitting || usersQuery.isLoading || accountManagerOptions.length === 0}
								description={usersQuery.isLoading ? "Loading internal users…" : "Optional. Leave unassigned if ownership is not decided yet."}
							/>
						</div>
					</section>

					{/* ── Notes ───────────────────────────────────────────────── */}
					<section className="flex flex-col gap-4 border-t pt-5">
						<FormTextarea
							control={form.control}
							name="notes"
							label="Notes"
							placeholder="Context, preferences, or any additional information"
							rows={3}
							disabled={isSubmitting}
						/>
					</section>
				</div>
			</Form>
		</FormDialog>
	);
}
