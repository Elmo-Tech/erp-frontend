"use client";

/**
 * CreateQuotationModal
 *
 * Standalone creation modal for the Lead Details Page → Quotations tab.
 *
 * DRY GUARANTEE: This modal renders the EXACT same QuotationDirectUploadTab
 * component used inside the Kanban pipeline StageModal. No new inputs are
 * created here — the form is 100% reused.
 *
 * The react-hook-form setup mirrors the pipeline's direct_upload branch of
 * quotationStageModalSchema so the same Zod validation applies.
 */

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { QuotationDirectUploadTab } from "./PipelineModals/QuotationDirectUploadTab";
import { quotationDirectUploadSchema, type QuotationDirectUploadValues } from "./PipelineModals/stageModal.schema";
import { createLeadQuotation } from "@/features/leads/api/leads.api";
import { useSalesPermissions } from "@/entities/user/model/permissions";

// ─────────────────────────────────────────────────────────────────────────────

type QuotationDirectUploadInput = z.input<typeof quotationDirectUploadSchema>;

interface CreateQuotationModalProps {
	leadId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated: () => void;
}

export function CreateQuotationModal({ leadId, open, onOpenChange, onCreated }: CreateQuotationModalProps) {
	const { canCreateQuotations } = useSalesPermissions();
	const form = useForm<QuotationDirectUploadInput, unknown, QuotationDirectUploadValues>({
		resolver: zodResolver(quotationDirectUploadSchema),
		defaultValues: {
			upload_file: undefined,
			base_price: undefined,
			commission_type: undefined,
			currency: undefined,
			final_total: undefined,
			payment_stages: [],
			notes: "",
		},
	});

	const {
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = form;

	const onSubmit = async (values: QuotationDirectUploadValues) => {
		if (!canCreateQuotations) {
			toast.error("You do not have permission to create quotations");
			return;
		}

		try {
			await createLeadQuotation(leadId, {
				creation_type: "direct_upload",
				currency: values.currency,
				base_price: values.base_price,
				commission_type: values.commission_type,
				final_total: values.final_total,
				payment_stages: values.payment_stages,
				notes: values.notes ?? null,
				upload_file: values.upload_file,
			});
			toast.success("Quotation created successfully.");
			reset();
			onOpenChange(false);
			onCreated();
		} catch (err) {
			console.error("[CreateQuotationModal] Failed:", err);
			toast.error("Failed to create quotation. Please try again.");
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
			<DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh] p-0 gap-0">
				<DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
					<DialogTitle>Add Quotation</DialogTitle>
					<DialogDescription>Upload a quotation document and enter the financial details.</DialogDescription>
				</DialogHeader>

				<ScrollArea className="flex-1 overflow-y-auto">
					<div className="px-6 py-5">
						{/* ── REUSED COMPONENT — zero new inputs ── */}
						<FormProvider {...form}>
							<QuotationDirectUploadTab />
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
						Create Quotation
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
