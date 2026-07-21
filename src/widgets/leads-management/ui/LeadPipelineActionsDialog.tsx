"use client";

import { useState } from "react";
import { FileText, PenLine, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSalesPermissions } from "@/entities/user/model/permissions";
import {
	useConvertLeadToProject,
	useDeleteLead,
	useGetLeadContracts,
	useGetLeadProposals,
	useGetLeadQuotations,
	useSignLeadContract,
	useUpdateLeadContract,
	useUpdateLeadProposal,
	useUpdateQuotationStatus,
} from "@/features/leads/api/leads.api";
import type { Lead } from "@/features/leads/model/types";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";

interface LeadPipelineActionsDialogProps {
	lead: Lead | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface PipelineDocument {
	id: number;
	status: string;
	file_name?: string | null;
	creation_type: string;
}

interface PipelineActionListProps {
	title: string;
	singularTitle: string;
	documents: PipelineDocument[];
	isLoading: boolean;
	statuses: string[];
	canEdit: boolean;
	isPending: boolean;
	onStatusChange: (documentId: number, status: string) => void;
	canSign?: boolean;
	onSign?: (documentId: number) => void;
}

const SALES_STATUS_OPTIONS = ["draft", "sent", "accepted", "rejected", "skipped"];
const CONTRACT_STATUS_OPTIONS = ["draft", "sent", "rejected", "skipped"];

function notifyDocumentUpdated() {
	toast.success("Pipeline document updated.");
}

function notifyDocumentUpdateFailed() {
	toast.error("Could not update the pipeline document.");
}

function PipelineDocumentRow({ document, title, statuses, canEdit, isPending, onStatusChange, canSign = false, onSign }: {
	document: PipelineDocument;
	title: string;
	statuses: string[];
	canEdit: boolean;
	isPending: boolean;
	onStatusChange: (status: string) => void;
	canSign?: boolean;
	onSign?: () => void;
}) {
	return (
		<div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><FileText className="size-4" /></div>
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">{document.file_name ?? `${title} #${document.id}`}</p>
					<p className="text-xs capitalize text-muted-foreground">{document.creation_type.replaceAll("_", " ")}</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Select value={document.status} disabled={!canEdit || isPending || document.status === "signed"} onValueChange={onStatusChange}>
					<SelectTrigger className="h-8 w-32 capitalize" aria-label={`Update ${title} #${document.id} status`}><SelectValue /></SelectTrigger>
					<SelectContent>{statuses.map((status) => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}</SelectContent>
				</Select>
				{canSign && document.status !== "signed" && onSign && (
					<Button type="button" size="sm" variant="outline" disabled={isPending} onClick={onSign} aria-label={`Sign ${title} #${document.id}`}>
						<PenLine className="size-3.5" />
						Sign
					</Button>
				)}
			</div>
		</div>
	);
}

function PipelineActionList({ title, singularTitle, documents, isLoading, statuses, canEdit, isPending, onStatusChange, canSign, onSign }: PipelineActionListProps) {
	let content: React.ReactNode;
	if (isLoading) content = <Skeleton className="h-16 w-full" />;
	else if (documents.length === 0) content = <p className="rounded-lg border border-dashed px-3 py-4 text-xs text-muted-foreground">No {title.toLowerCase()} available.</p>;
	else content = documents.map((document) => (
		<PipelineDocumentRow
			key={document.id}
			document={document}
			title={singularTitle}
			statuses={statuses}
			canEdit={canEdit}
			isPending={isPending}
			onStatusChange={(status) => onStatusChange(document.id, status)}
			canSign={canSign}
			onSign={onSign ? () => onSign(document.id) : undefined}
		/>
	));

	return <section className="space-y-2.5"><h3 className="text-sm font-semibold">{title}</h3>{content}</section>;
}

function LeadPipelineActionsContent({ lead, open, onOpenChange }: { lead: Lead; open: boolean; onOpenChange: (open: boolean) => void }) {
	const permissions = useSalesPermissions();
	const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
	const proposalsQuery = useGetLeadProposals(lead.id, open && permissions.canViewLeads);
	const quotationsQuery = useGetLeadQuotations(lead.id, open && permissions.canViewQuotations);
	const contractsQuery = useGetLeadContracts(lead.id, open && permissions.canViewContracts);
	const updateProposal = useUpdateLeadProposal(lead.id);
	const updateQuotation = useUpdateQuotationStatus(lead.id);
	const updateContract = useUpdateLeadContract(lead.id);
	const signContract = useSignLeadContract(lead.id);
	const convertLead = useConvertLeadToProject();
	const deleteLead = useDeleteLead();

	const retryConversion = () => {
		convertLead.mutate(lead.id, {
			onSuccess: ({ data }) => toast.success(`Client “${data.client_name}” and project “${data.project_title}” are ready.`),
			onError: () => toast.error("Could not convert the won lead. Please try again."),
		});
	};

	const confirmDelete = () => {
		deleteLead.mutate(lead.id, {
			onSuccess: () => {
				toast.success("Lead deleted.");
				setDeleteConfirmationOpen(false);
				onOpenChange(false);
			},
			onError: () => toast.error("Could not delete the lead."),
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[88vh] w-full max-w-2xl flex-col">
				<DialogHeader className="shrink-0">
					<DialogTitle>Pipeline actions</DialogTitle>
					<DialogDescription>Update approvals and signatures for {lead.name}. Stage movement remains on the Kanban card.</DialogDescription>
				</DialogHeader>
				<ScrollArea className="min-h-0 flex-1 pr-3">
					<div className="space-y-6 py-1">
						{permissions.canViewLeads && (
							<PipelineActionList title="Proposals" singularTitle="Proposal" documents={proposalsQuery.data ?? []} isLoading={proposalsQuery.isLoading} statuses={SALES_STATUS_OPTIONS} canEdit={permissions.canEditLeads} isPending={updateProposal.isPending} onStatusChange={(proposalId, status) => updateProposal.mutate({ proposalId, payload: { status } }, { onSuccess: notifyDocumentUpdated, onError: notifyDocumentUpdateFailed })} />
						)}
						{permissions.canViewQuotations && (
							<PipelineActionList title="Quotations" singularTitle="Quotation" documents={quotationsQuery.data ?? []} isLoading={quotationsQuery.isLoading} statuses={SALES_STATUS_OPTIONS} canEdit={permissions.canEditQuotations} isPending={updateQuotation.isPending} onStatusChange={(quotationId, status) => updateQuotation.mutate({ quotationId, status }, { onSuccess: notifyDocumentUpdated, onError: notifyDocumentUpdateFailed })} />
						)}
						{permissions.canViewContracts && (
							<PipelineActionList title="Contracts" singularTitle="Contract" documents={contractsQuery.data ?? []} isLoading={contractsQuery.isLoading} statuses={CONTRACT_STATUS_OPTIONS} canEdit={permissions.canEditContracts} isPending={updateContract.isPending || signContract.isPending} onStatusChange={(contractId, status) => updateContract.mutate({ contractId, payload: { status } }, { onSuccess: notifyDocumentUpdated, onError: notifyDocumentUpdateFailed })} canSign={permissions.canSignContracts} onSign={(contractId) => signContract.mutate(contractId, { onSuccess: notifyDocumentUpdated, onError: notifyDocumentUpdateFailed })} />
						)}
					</div>
				</ScrollArea>
				{(lead.stage === "closed_won" && permissions.canConvertLeads) || permissions.canDeleteLeads ? (
					<div className="flex shrink-0 flex-wrap justify-end gap-2 border-t pt-4">
						{lead.stage === "closed_won" && permissions.canConvertLeads && (
							<Button type="button" variant="outline" disabled={convertLead.isPending} onClick={retryConversion}>
								<RefreshCw className={convertLead.isPending ? "size-4 animate-spin" : "size-4"} />
								Retry conversion
							</Button>
						)}
						{permissions.canDeleteLeads && (
							<Button type="button" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteConfirmationOpen(true)}>
								<Trash2 className="size-4" />
								Delete lead
							</Button>
						)}
					</div>
				) : null}
			</DialogContent>
			<ConfirmDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen} title="Delete lead?" description={`This will remove ${lead.name} from the sales pipeline.`} confirmLabel="Delete lead" variant="destructive" isLoading={deleteLead.isPending} onConfirm={confirmDelete} />
		</Dialog>
	);
}

export function LeadPipelineActionsDialog({ lead, open, onOpenChange }: LeadPipelineActionsDialogProps) {
	if (!lead) return null;
	return <LeadPipelineActionsContent lead={lead} open={open} onOpenChange={onOpenChange} />;
}
