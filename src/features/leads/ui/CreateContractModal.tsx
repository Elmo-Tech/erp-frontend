"use client";

/**
 * CreateContractModal
 *
 * Standalone creation modal for the Lead Details Page → Contracts tab.
 *
 * DRY GUARANTEE: This modal renders the EXACT same ContractDirectUploadTab
 * component used inside the Kanban pipeline StageModal. No new inputs are
 * created here — the form is 100% reused.
 *
 * The react-hook-form setup mirrors the pipeline's direct_upload branch of
 * contractStageModalSchema so the same Zod validation applies.
 */

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ContractDirectUploadTab } from "./PipelineModals/ContractDirectUploadTab";
import { contractStandardSchema, contractSaasSchema, type ContractDirectUploadValues } from "./PipelineModals/stageModal.schema";
import { createLeadContract } from "@/features/leads/api/leads.api";
import { z } from "zod";

// ─── Runtime schema — mirrors the pipeline's contractStageModalSchema logic ──
// We validate the base fields always, then branch on contract_model at submit.
// This is the same approach used in StageModal.tsx.

const contractFormSchema = z.object({
	upload_file: z
		.any()
		.refine((f: File | null | undefined) => f instanceof File, { message: "Please upload a PDF file" })
		.refine((f: File | null | undefined) => !(f instanceof File) || f.type === "application/pdf", { message: "Only PDF files are accepted" }),
	development_days: z.number({ message: "Required" }).int().min(1, "Must be ≥ 1"),
	review_days: z.number({ message: "Required" }).int().min(0, "Must be ≥ 0"),
	testing_days: z.number({ message: "Required" }).int().min(0, "Must be ≥ 0"),
	delay_penalty: z.number({ message: "Required" }).min(0).max(100),
	source_code_handover: z.boolean().default(false),
	execution_start_date: z.string().min(1, "Start date is required"),
	working_days_per_week: z.number({ message: "Required" }).int().min(1).max(7),
	notes: z.string().optional(),
	contract_model: z.enum(["standard", "saas_subscription"], { message: "Please select a contract model" }),
	// Optional fields — validated at runtime based on contract_model
	currency: z.enum(["USD", "EUR", "GBP", "SAR", "AED", "EGP"]).optional(),
	total_amount: z.number().min(0).optional(),
	payment_stages: z.array(z.object({ stage_name: z.string(), percentage: z.number(), amount: z.number() })).default([]),
	setup_fee: z.number().min(0).optional(),
	recurring_fee: z.number().min(0).optional(),
	billing_cycle: z.enum(["monthly", "quarterly", "semi_annual", "annual"]).optional(),
	subscription_start_date: z.string().optional(),
	apply_promo: z.boolean().default(false),
	promo_discount: z.number().min(0).max(100).optional(),
	addons: z.array(z.object({ name: z.string(), price: z.number() })).default([]),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

// ─────────────────────────────────────────────────────────────────────────────

interface CreateContractModalProps {
	leadId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated: () => void;
}

export function CreateContractModal({ leadId, open, onOpenChange, onCreated }: CreateContractModalProps) {
	const form = useForm<ContractFormValues>({
		resolver: zodResolver(contractFormSchema),
		defaultValues: {
			upload_file: undefined,
			development_days: undefined,
			review_days: undefined,
			testing_days: undefined,
			delay_penalty: undefined,
			source_code_handover: false,
			execution_start_date: "",
			working_days_per_week: undefined,
			notes: "",
			contract_model: undefined,
			currency: undefined,
			total_amount: undefined,
			payment_stages: [],
			setup_fee: undefined,
			recurring_fee: undefined,
			billing_cycle: undefined,
			subscription_start_date: "",
			apply_promo: false,
			promo_discount: undefined,
			addons: [],
		},
	});

	const {
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = form;

	const onSubmit = async (values: ContractFormValues) => {
		// Runtime branch validation — mirrors StageModal.tsx approach
		if (values.contract_model === "standard") {
			const result = contractStandardSchema.safeParse(values);
			if (!result.success) {
				toast.error("Please fill in all required standard contract fields.");
				return;
			}
		} else if (values.contract_model === "saas_subscription") {
			const result = contractSaasSchema.safeParse(values);
			if (!result.success) {
				toast.error("Please fill in all required SaaS contract fields.");
				return;
			}
		}

		try {
			await createLeadContract(leadId, {
				creation_type: "direct_upload",
				contract_model: values.contract_model,
				development_days: values.development_days,
				review_days: values.review_days,
				testing_days: values.testing_days,
				delay_penalty: values.delay_penalty,
				source_code_handover: values.source_code_handover,
				execution_start_date: values.execution_start_date,
				working_days_per_week: values.working_days_per_week,
				notes: values.notes ?? null,
				// Standard
				currency: values.currency ?? null,
				total_amount: values.total_amount ?? null,
				payment_stages: values.payment_stages,
				// SaaS
				setup_fee: values.setup_fee ?? null,
				recurring_fee: values.recurring_fee ?? null,
				billing_cycle: values.billing_cycle ?? null,
				subscription_start_date: values.subscription_start_date ?? null,
				apply_promo: values.apply_promo,
				promo_discount: values.promo_discount ?? null,
				addons: values.addons,
				file_path: null,
			});
			toast.success("Contract created successfully.");
			reset();
			onOpenChange(false);
			onCreated();
		} catch (err) {
			console.error("[CreateContractModal] Failed:", err);
			toast.error("Failed to create contract. Please try again.");
		}
	};

	const handleClose = () => {
		reset();
		onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleClose}
		>
			<DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh] p-0 gap-0">
				<DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
					<DialogTitle>Add Contract</DialogTitle>
					<DialogDescription>Upload a contract document and enter the legal and financial details.</DialogDescription>
				</DialogHeader>

				<ScrollArea className="flex-1 overflow-y-auto">
					<div className="px-6 py-5">
						{/* ── REUSED COMPONENT — zero new inputs ── */}
						<FormProvider {...form}>
							<ContractDirectUploadTab />
						</FormProvider>
					</div>
				</ScrollArea>

				<DialogFooter className="px-6 py-4 border-t shrink-0">
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit(onSubmit)}
						disabled={isSubmitting}
					>
						{isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
						Create Contract
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
