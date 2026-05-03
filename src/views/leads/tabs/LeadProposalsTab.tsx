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

import { useEffect, useState, useCallback } from "react";
import { PlusIcon, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { getLeadProposals, type LeadProposal } from "@/features/leads/api/leads.api";
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

// ─────────────────────────────────────────────────────────────────────────────

interface LeadProposalsTabProps {
	leadId: number;
}

export function LeadProposalsTab({ leadId }: LeadProposalsTabProps) {
	const [proposals, setProposals] = useState<LeadProposal[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);

	const fetchProposals = useCallback(async () => {
		setIsLoading(true);
		try {
			const res = await getLeadProposals(leadId);
			setProposals(res.data);
		} catch (err) {
			console.error("[LeadProposalsTab] Failed to fetch proposals:", err);
			toast.error("Failed to load proposals.");
		} finally {
			setIsLoading(false);
		}
	}, [leadId]);

	useEffect(() => {
		fetchProposals();
	}, [fetchProposals]);

	// ── Loading skeleton ──────────────────────────────────────────────────────
	if (isLoading) {
		return (
			<div className="pt-4 space-y-3">
				<Skeleton className="h-9 w-36 ml-auto" />
				<Skeleton className="h-48 w-full rounded-xl" />
			</div>
		);
	}

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

			{/* ── Table ────────────────────────────────────────────────────── */}
			{proposals.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-48 rounded-xl border bg-muted/20 gap-3">
					<FileText className="size-8 text-muted-foreground/40" />
					<p className="text-sm text-muted-foreground">No proposals yet. Add the first one.</p>
				</div>
			) : (
				<div className="rounded-xl border overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/40 hover:bg-muted/40">
								<TableHead className="font-semibold">ID</TableHead>
								<TableHead className="font-semibold">Status</TableHead>
								<TableHead className="font-semibold">Type</TableHead>
								<TableHead className="font-semibold">Assigned To</TableHead>
								<TableHead className="font-semibold">Document</TableHead>
								<TableHead className="font-semibold">Created</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{proposals.map((proposal) => (
								<TableRow
									key={proposal.id}
									className="hover:bg-muted/30"
								>
									<TableCell className="font-mono text-xs text-muted-foreground">#{proposal.id}</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={STATUS_CLASS[proposal.status] ?? "bg-muted text-muted-foreground"}
										>
											{proposal.status}
										</Badge>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">{CREATION_TYPE_LABEL[proposal.creation_type] ?? proposal.creation_type}</TableCell>
									<TableCell className="text-sm">{proposal.assignee?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
									<TableCell>
										{proposal.file_path ? (
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
										)}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">{format(new Date(proposal.created_at), "MMM d, yyyy")}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* ── Creation modal — renders ProposalDirectUploadTab exactly ── */}
			<CreateProposalModal
				leadId={leadId}
				open={modalOpen}
				onOpenChange={setModalOpen}
				onCreated={fetchProposals}
			/>
		</div>
	);
}
