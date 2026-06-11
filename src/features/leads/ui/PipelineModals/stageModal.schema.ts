import { z } from "zod";
import { optionalNumberInput, requiredNumberInput } from "@/shared/lib/zod-number";

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

export const CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "EGP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const COMMISSION_TYPES = ["percentage", "fixed"] as const;
export type CommissionType = (typeof COMMISSION_TYPES)[number];

export const BILLING_CYCLES = ["monthly", "quarterly", "semi_annual", "annual"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const CONTRACT_MODELS = ["standard", "saas_subscription"] as const;
export type ContractModel = (typeof CONTRACT_MODELS)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Payment Stage (shared between Quotation and Contract Standard)
// ─────────────────────────────────────────────────────────────────────────────

export const paymentStageSchema = z.object({
	stage_name: z.string().min(1, "Stage name is required"),
	percentage: requiredNumberInput("Required").pipe(z.number().min(0, "Must be ≥ 0").max(100, "Must be ≤ 100")),
	amount: requiredNumberInput("Required").pipe(z.number().min(0, "Must be ≥ 0")),
});

export type PaymentStage = z.infer<typeof paymentStageSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SaaS Add-on (Contract SaaS only)
// ─────────────────────────────────────────────────────────────────────────────

export const saasAddonSchema = z.object({
	name: z.string().min(1, "Add-on name is required"),
	price: requiredNumberInput("Required").pipe(z.number().min(0, "Must be ≥ 0")),
});

export type SaasAddon = z.infer<typeof saasAddonSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Task tab
// ─────────────────────────────────────────────────────────────────────────────

export const taskTabSchema = z.object({
	assignedTo: requiredNumberInput("Please select a user").pipe(z.number().int().positive("Please select a user")),
	deadline: z.string().min(1, "Deadline is required"),
	taskNotes: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Skip tab — skip_reason is STRICTLY REQUIRED (no optional)
// BUG FIX: was z.enum(SKIP_REASONS) — now z.string() because reasons are
// managed dynamically via the settings/skip-reasons dictionary.
// ─────────────────────────────────────────────────────────────────────────────

export const skipTabSchema = z.object({
	/** REQUIRED — a skip reason must always be provided. */
	skipReason: z.string().trim().min(1, "A skip reason is required to skip this stage."),
	skipNotes: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Rejection schema — rejection_reason is STRICTLY REQUIRED
// ─────────────────────────────────────────────────────────────────────────────

export const rejectionSchema = z.object({
	/** REQUIRED — must always be provided when rejecting a task or stage. */
	rejectionReason: z.string().trim().min(1, "A rejection reason is required."),
	rejectionNotes: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Generic Direct Upload tab (fallback — no financials)
// ─────────────────────────────────────────────────────────────────────────────

export const genericDirectUploadSchema = z.object({
	upload_file: z
		.any()
		.refine((f: File | null | undefined) => f instanceof File, { message: "Please upload a PDF file" })
		.refine((f: File | null | undefined) => !(f instanceof File) || f.type === "application/pdf", { message: "Only PDF files are accepted" }),
	notes: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Direct Upload tab
// ─────────────────────────────────────────────────────────────────────────────

export const PROPOSAL_SOURCES = ["upload_new", "use_template"] as const;
export type ProposalSource = (typeof PROPOSAL_SOURCES)[number];

/**
 * Proposal schema uses a nested discriminated union on `proposal_source`:
 *   • upload_new   → upload_file is required
 *   • use_template → template_id is required
 * Both branches share validity_date and notes.
 */
export const proposalDirectUploadSchema = z.discriminatedUnion("proposal_source", [
	// ── Upload new PDF ────────────────────────────────────────────────────
	z.object({
		proposal_source: z.literal("upload_new"),
		upload_file: z
			.any()
			.refine((f: File | null | undefined) => f instanceof File, { message: "Please upload a PDF file" })
			.refine((f: File | null | undefined) => !(f instanceof File) || f.type === "application/pdf", { message: "Only PDF files are accepted" }),
		template_id: optionalNumberInput().pipe(z.number().int().positive().optional()),
		validity_date: z.string().min(1, "Validity date is required"),
		notes: z.string().optional(),
	}),
	// ── Use existing template ─────────────────────────────────────────────
	z.object({
		proposal_source: z.literal("use_template"),
		upload_file: z.any().optional(),
		template_id: requiredNumberInput("Please select a template").pipe(z.number().int().positive("Please select a template")),
		validity_date: z.string().min(1, "Validity date is required"),
		notes: z.string().optional(),
	}),
]);

export type ProposalDirectUploadValues = z.infer<typeof proposalDirectUploadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Meeting Schedule tab
// ─────────────────────────────────────────────────────────────────────────────

export const MEETING_TYPES = ["discovery", "kickoff", "review", "status", "handover", "demo", "negotiation"] as const;
export const MEETING_LOCATION_TYPES = ["online", "client_site", "our_office", "other"] as const;

export const meetingScheduleSchema = z
	.object({
		meeting_type: z.enum(MEETING_TYPES, { message: "Please select a meeting type" }),
		date: z.string().min(1, "Date is required"),
		time: z.string().min(1, "Time is required"),
		location_type: z.enum(MEETING_LOCATION_TYPES, { message: "Please select a location type" }),
		location_details: z.string().optional(),
		internal_attendees: z.array(z.string()).min(1, "Select at least one internal attendee"),
		external_attendees: z.array(z.string()).default([]),
		notes: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.location_type === "online" && (data.location_details ?? "").trim() !== "") {
			const parsed = z
				.string()
				.url()
				.safeParse(data.location_details ?? "");
			if (!parsed.success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["location_details"],
					message: "Enter a valid meeting link or leave it blank",
				});
			}
		} else if (data.location_type !== "online" && !data.location_details?.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["location_details"],
				message: "Location details are required",
			});
		}
	});

export type MeetingScheduleValues = z.infer<typeof meetingScheduleSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Quotation Direct Upload tab
// ─────────────────────────────────────────────────────────────────────────────

export const quotationDirectUploadSchema = z.object({
	upload_file: z
		.any()
		.refine((f: File | null | undefined) => f instanceof File, { message: "Please upload a PDF file" })
		.refine((f: File | null | undefined) => !(f instanceof File) || f.type === "application/pdf", { message: "Only PDF files are accepted" }),
	base_price: requiredNumberInput("Base price is required").pipe(z.number().min(0, "Must be ≥ 0")),
	commission_type: z.enum(COMMISSION_TYPES, {
		message: "Please select a commission type",
	}),
	currency: z.enum(CURRENCIES, { message: "Please select a currency" }),
	final_total: requiredNumberInput("Final total is required").pipe(z.number().min(0, "Must be ≥ 0")),
	payment_stages: z.array(paymentStageSchema),
	notes: z.string().optional(),
});

export type QuotationDirectUploadValues = z.infer<typeof quotationDirectUploadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Contract Direct Upload tab — Standard financials
// ─────────────────────────────────────────────────────────────────────────────

const contractStandardFinancialsSchema = z.object({
	contract_model: z.literal("standard"),
	currency: z.enum(CURRENCIES, { message: "Please select a currency" }),
	total_amount: requiredNumberInput("Total amount is required").pipe(z.number().min(0, "Must be ≥ 0")),
	payment_stages: z.array(paymentStageSchema).default([]),
});

// ─────────────────────────────────────────────────────────────────────────────
// Contract Direct Upload tab — SaaS Subscription financials
// ─────────────────────────────────────────────────────────────────────────────

const contractSaasFinancialsSchema = z.object({
	contract_model: z.literal("saas_subscription"),
	currency: z.enum(CURRENCIES, { message: "Please select a currency" }),
	setup_fee: requiredNumberInput("Required").pipe(z.number().min(0, "Must be ≥ 0")),
	recurring_fee: requiredNumberInput("Required").pipe(z.number().min(0, "Must be ≥ 0")),
	billing_cycle: z.enum(BILLING_CYCLES, {
		message: "Please select a billing cycle",
	}),
	subscription_start_date: z.string().min(1, "Start date is required"),
	apply_promo: z.boolean().default(false),
	promo_discount: optionalNumberInput().pipe(z.number().min(0).max(100).optional()),
	addons: z.array(saasAddonSchema).default([]),
});

// ─────────────────────────────────────────────────────────────────────────────
// Contract Direct Upload tab — base (non-financial) fields
// ─────────────────────────────────────────────────────────────────────────────

const contractBaseSchema = z.object({
	upload_file: z
		.any()
		.refine((f: File | null | undefined) => f instanceof File, { message: "Please upload a PDF file" })
		.refine((f: File | null | undefined) => !(f instanceof File) || f.type === "application/pdf", { message: "Only PDF files are accepted" }),
	development_days: requiredNumberInput("Required").pipe(z.number().int().min(1, "Must be ≥ 1")),
	review_days: requiredNumberInput("Required").pipe(z.number().int().min(0, "Must be ≥ 0")),
	testing_days: requiredNumberInput("Required").pipe(z.number().int().min(0, "Must be ≥ 0")),
	delay_penalty: requiredNumberInput("Required").pipe(z.number().min(0, "Must be ≥ 0").max(100, "Must be ≤ 100")),
	source_code_handover: z.boolean().default(false),
	execution_start_date: z.string().min(1, "Start date is required"),
	working_days_per_week: requiredNumberInput("Required").pipe(z.number().int().min(1, "Must be ≥ 1").max(7, "Must be ≤ 7")),
	notes: z.string().optional(),
});

// Standard contract = base + standard financials
// BUG FIX: added .superRefine to validate payment_stages sum equals total_amount
export const contractStandardSchema = contractBaseSchema.merge(contractStandardFinancialsSchema).superRefine((data, ctx) => {
	if (data.payment_stages.length > 0) {
		const stagesTotal = data.payment_stages.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
		const diff = Math.abs(stagesTotal - data.total_amount);
		if (diff > 0.01) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["payment_stages"],
				message: `Payment stages (${stagesTotal.toFixed(2)}) must equal the total amount (${data.total_amount.toFixed(2)}).`,
			});
		}
	}
});

// SaaS contract = base + SaaS financials
export const contractSaasSchema = contractBaseSchema.merge(contractSaasFinancialsSchema);
// Union used for validation — we validate each branch separately in StageModal
export type ContractStandardValues = z.infer<typeof contractStandardSchema>;
export type ContractSaasValues = z.infer<typeof contractSaasSchema>;
export type ContractDirectUploadValues = ContractStandardValues | ContractSaasValues;

// ─────────────────────────────────────────────────────────────────────────────
// Per-stage modal schemas (discriminated by `mode`)
// ─────────────────────────────────────────────────────────────────────────────

// Generic stages (fallback — meeting has its own schema, proposal has its own)
export const genericStageModalSchema = z.discriminatedUnion("mode", [
	z.object({ mode: z.literal("task") }).merge(taskTabSchema),
	z.object({ mode: z.literal("direct_upload") }).merge(genericDirectUploadSchema),
	z.object({ mode: z.literal("skip") }).merge(skipTabSchema),
]);

// Meeting stage — 2-mode only: schedule a meeting OR skip
// No "task" or "direct_upload" tabs — a meeting is not a document.
export const meetingStageModalSchema = z.discriminatedUnion("mode", [z.object({ mode: z.literal("schedule") }).merge(meetingScheduleSchema), z.object({ mode: z.literal("skip") }).merge(skipTabSchema)]);

// Proposal stage — upload_new vs use_template switcher + validity_date
//
// The direct_upload branch cannot use `.and(proposalDirectUploadSchema)` because
// Zod's discriminatedUnion requires all members to be plain ZodObject shapes —
// intersections break the discriminator lookup. Instead we flatten the proposal
// fields directly into the direct_upload object using `.merge()` on a base that
// carries all possible fields as optional, then enforce the conditional
// requirement at the component level (the segmented control makes it obvious).
export const proposalDirectUploadBranchSchema = z.object({
	mode: z.literal("direct_upload"),
	proposal_source: z.enum(PROPOSAL_SOURCES, { message: "Please select a proposal source" }),
	upload_file: z
		.any()
		.optional()
		.superRefine((f, ctx) => {
			if (f !== undefined && f !== null && !(f instanceof File)) {
				ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be a file" });
			}
			if (f instanceof File && f.type !== "application/pdf") {
				ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Only PDF files are accepted" });
			}
		}),
	template_id: optionalNumberInput().pipe(z.number().int().positive().optional()),
	validity_date: z.string().min(1, "Validity date is required"),
	notes: z.string().optional(),
});

export const proposalStageModalSchema = z.discriminatedUnion("mode", [
	z.object({ mode: z.literal("task") }).merge(taskTabSchema),
	proposalDirectUploadBranchSchema,
	z.object({ mode: z.literal("skip") }).merge(skipTabSchema),
]);

// Quotation stage
export const quotationStageModalSchema = z.discriminatedUnion("mode", [
	z.object({ mode: z.literal("task") }).merge(taskTabSchema),
	z.object({ mode: z.literal("direct_upload") }).merge(quotationDirectUploadSchema),
	z.object({ mode: z.literal("skip") }).merge(skipTabSchema),
]);

// Contract stage — we use a custom superRefine approach because the financials
// are themselves a discriminated union (standard vs saas). We validate the
// base fields always, then branch on contract_model.
export const contractStageModalSchema = z.discriminatedUnion("mode", [
	z.object({ mode: z.literal("task") }).merge(taskTabSchema),
	// For direct_upload we use the standard schema as the "base" validator;
	// the SaaS branch is handled by a runtime switch in StageModal.
	z
		.object({ mode: z.literal("direct_upload") })
		.merge(contractBaseSchema)
		.merge(
			z.object({
				contract_model: z.enum(CONTRACT_MODELS, { message: "Please select a contract model" }),
				// Optional fields that exist in one branch or the other — validated at runtime
				currency: z.enum(CURRENCIES, { message: "Please select a currency" }).optional(),
				total_amount: optionalNumberInput().pipe(z.number().min(0).optional()),
payment_stages: z.array(paymentStageSchema),
				setup_fee: optionalNumberInput().pipe(z.number().min(0).optional()),
				recurring_fee: optionalNumberInput().pipe(z.number().min(0).optional()),
				billing_cycle: z.enum(BILLING_CYCLES).optional(),
				subscription_start_date: z.string().optional(),
apply_promo: z.boolean(),
				promo_discount: optionalNumberInput().pipe(z.number().min(0).max(100).optional()),
addons: z.array(saasAddonSchema),
			}),
		),
	z.object({ mode: z.literal("skip") }).merge(skipTabSchema),
]);

export type GenericStageModalValues = z.infer<typeof genericStageModalSchema>;
export type MeetingStageModalValues = z.infer<typeof meetingStageModalSchema>;
export type ProposalStageModalValues = z.infer<typeof proposalStageModalSchema>;
export type QuotationStageModalValues = z.infer<typeof quotationStageModalSchema>;
export type ContractStageModalValues = z.infer<typeof contractStageModalSchema>;

// Legacy aliases kept for backward compat with TaskTab / SkipTab
export type StageModalFormValues = GenericStageModalValues;
export type TaskTabFormValues = z.infer<typeof taskTabSchema>;
export type DirectUploadTabFormValues = z.infer<typeof genericDirectUploadSchema>;
export type SkipTabFormValues = z.infer<typeof skipTabSchema>;
