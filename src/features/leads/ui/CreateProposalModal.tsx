"use client";

/**
 * CreateProposalModal
 *
 * Standalone creation modal for the Lead Details Page → Proposals tab.
 *
 * DRY GUARANTEE: This modal renders the EXACT same ProposalDirectUploadTab
 * component used inside the Kanban pipeline StageModal. No new inputs are
 * created here — the form is 100% reused.
 *
 * The react-hook-form setup mirrors the pipeline's direct_upload branch of
 * proposalStageModalSchema so the same Zod validation applies.
 */

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ProposalDirectUploadTab } from "./PipelineModals/ProposalDirectUploadTab";
import { proposalDirectUploadBranchSchema } from "./PipelineModals/stageModal.schema";
import { useCreateLeadProposal } from "@/features/leads/api/leads.api";

// ─── Extract the direct_upload branch for this standalone form ────────────────

type ProposalDirectUploadInput = z.input<typeof proposalDirectUploadBranchSchema>;
type ProposalDirectUploadMode = z.output<typeof proposalDirectUploadBranchSchema>;

// ─────────────────────────────────────────────────────────────────────────────

interface CreateProposalModalProps {
	leadId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Called after a successful creation so the parent can refresh the list. */
	onCreated: () => void;
}

export function CreateProposalModal({ leadId, open, onOpenChange, onCreated }: CreateProposalModalProps) {
	const createProposal = useCreateLeadProposal(leadId);
	const form = useForm<ProposalDirectUploadInput, unknown, ProposalDirectUploadMode>({
		resolver: zodResolver(proposalDirectUploadBranchSchema),
		defaultValues: {
			mode: "direct_upload",
			proposal_source: "upload_new",
			upload_file: undefined,
			template_id: undefined,
			validity_date: "",
			notes: "",
		},
	});

	const {
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = form;

	const onSubmit = async (values: ProposalDirectUploadMode) => {
		try {
			await createProposal.mutateAsync({
				creation_type: "direct_upload",
				proposal_source: values.proposal_source,
				template_id: values.template_id ?? null,
				validity_date: values.validity_date,
				notes: values.notes ?? null,
				// file_path: handled by a dedicated upload endpoint when wired up
				file_path: null,
			});
			toast.success("Proposal created successfully.");
			reset();
			onOpenChange(false);
			onCreated();
		} catch (err) {
			console.error("[CreateProposalModal] Failed:", err);
			toast.error("Failed to create proposal. Please try again.");
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
					<DialogTitle>Add Proposal</DialogTitle>
					<DialogDescription>Upload a proposal document or generate one from a template.</DialogDescription>
				</DialogHeader>

				<ScrollArea className="flex-1 overflow-y-auto">
					<div className="px-6 py-5">
						{/* ── REUSED COMPONENT — zero new inputs ── */}
						<FormProvider {...form}>
							<ProposalDirectUploadTab />
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
						disabled={isSubmitting || createProposal.isPending}
					>
						{(isSubmitting || createProposal.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
						Create Proposal
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
