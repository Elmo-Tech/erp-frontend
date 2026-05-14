"use client";

/**
 * LeadProposalsTab
 *
 * Renders the Proposals tab on the Lead Details Page.
 *
 * Features:
 *  - Shadcn Table listing all proposals for the lead
 *  - "Add Proposal" button that opens CreateProposalModal
 *  - CreateProposalModal renders the EXACT ProposalDirectUploadTab from the pipeline
 */

import { useState } from "react";
import { PlusIcon, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { useGetLeadProposals, useUpdateLeadProposal, type LeadProposal } from "@/features/leads/api/leads.api";
import { CreateProposalModal } from "@/features/leads/ui/CreateProposalModal";
import { format } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// Status badge colours
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
	draft: "bg-slate-100 text-slate-700 border-slate-200",
	sent: "bg-blue-50 text-blue-700 border-blue-200",
	accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
	rejected: "bg-red-50 text-red-700 border-red-200",
	expired: "bg-orange-50 text-orange-700 border-orange-200",
};

const CREATION_TYPE_LABEL: Record<string, string> = {
	direct_upload: "Direct Upload",
	task: "Task",
	skipped: "Skipped",
};

const PROPOSAL_STATUS_OPTIONS = ["draft", "sent", "accepted", "rejected", "skipped"] as const;

function hasRenderableProposal(proposal: LeadProposal): boolean {
	return Boolean(proposal.file_path || proposal.assigned_to || proposal.assignee || proposal.skip_reason || proposal.creation_type !== "direct_upload" || proposal.status !== "draft");
}

// ─────────────────────────────────────────────────────────────────────────────

interface LeadProposalsTabProps {
	leadId: number;
}

export function LeadProposalsTab({ leadId }: LeadProposalsTabProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const proposalsQuery = useGetLeadProposals(leadId);
	const updateProposal = useUpdateLeadProposal(leadId);
	const proposals = (proposalsQuery.data ?? []).filter(hasRenderableProposal);

	const columns: Column<LeadProposal>[] = [
		{ key: "id", header: "ID", render: (proposal) => <span className="font-mono text-xs text-muted-foreground">#{proposal.id}</span> },
		{
			key: "status",
			header: "Status",
			render: (proposal) => (
				<Select
					value={proposal.status}
					disabled={updateProposal.isPending}
					onValueChange={(status) => {
						updateProposal.mutate(
							{ proposalId: proposal.id, payload: { status } },
							{
								onSuccess: () => toast.success("Proposal status updated."),
								onError: () => toast.error("Failed to update proposal status."),
							},
						);
					}}
				>
					<SelectTrigger className="h-8 w-32">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PROPOSAL_STATUS_OPTIONS.map((status) => (
							<SelectItem
								key={status}
								value={status}
							>
								<Badge
									variant="outline"
									className={STATUS_CLASS[status] ?? "bg-muted text-muted-foreground"}
								>
									{status}
								</Badge>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			),
		},
		{ key: "type", header: "Type", render: (proposal) => <span className="text-sm text-muted-foreground">{CREATION_TYPE_LABEL[proposal.creation_type] ?? proposal.creation_type}</span> },
		{ key: "assignedTo", header: "Assigned To", render: (proposal) => <span className="text-sm">{proposal.assignee?.name ?? <span className="text-muted-foreground">—</span>}</span> },
		{
			key: "document",
			header: "Document",
			render: (proposal) =>
				proposal.file_path ? (
					<a
						href={proposal.file_path}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
					>
						<ExternalLink className="size-3" />
						View PDF
					</a>
				) : (
					<span className="text-xs text-muted-foreground">—</span>
				),
		},
		{ key: "created", header: "Created", render: (proposal) => <span className="text-sm text-muted-foreground">{format(new Date(proposal.created_at), "MMM d, yyyy")}</span> },
	];

	return (
		<div className="pt-4 space-y-4">
			{/* ── Toolbar ──────────────────────────────────────────────────── */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{proposals.length} proposal{proposals.length !== 1 ? "s" : ""}
				</p>
				<Button
					size="sm"
					className="gap-1.5"
					onClick={() => setModalOpen(true)}
				>
					<PlusIcon className="size-4" />
					Add Proposal
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={proposals}
				keyExtractor={(proposal) => proposal.id}
				isLoading={proposalsQuery.isLoading}
				error={proposalsQuery.error}
				emptyState={{
					icon: FileText,
					title: "No proposals yet",
					description: "Add the first one.",
				}}
			/>

			{/* ── Creation modal — renders ProposalDirectUploadTab exactly ── */}
			<CreateProposalModal
				leadId={leadId}
				open={modalOpen}
				onOpenChange={setModalOpen}
				onCreated={() => proposalsQuery.refetch()}
			/>
		</div>
	);
}
