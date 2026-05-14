"use client";

/**
 * LeadContractsTab
 *
 * Renders the Contracts tab on the Lead Details Page.
 *
 * Features:
 *  - Shadcn Table showing Contract Model, Total/Recurring Fee, Status
 *  - "Add Contract" button that opens CreateContractModal
 *  - CreateContractModal renders the EXACT ContractDirectUploadTab from the pipeline
 */

import { useState } from "react";
import { PlusIcon, FileSignature, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { useGetLeadContracts, useUpdateLeadContract, type LeadContract } from "@/features/leads/api/leads.api";
import { CreateContractModal } from "@/features/leads/ui/CreateContractModal";
import { format } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
	draft: "bg-slate-100 text-slate-700 border-slate-200",
	active: "bg-emerald-50 text-emerald-700 border-emerald-200",
	signed: "bg-blue-50 text-blue-700 border-blue-200",
	terminated: "bg-red-50 text-red-700 border-red-200",
	expired: "bg-orange-50 text-orange-700 border-orange-200",
};

const MODEL_CLASS: Record<string, string> = {
	standard: "bg-violet-50 text-violet-700 border-violet-200",
	saas_subscription: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

const MODEL_LABEL: Record<string, string> = {
	standard: "Standard",
	saas_subscription: "SaaS",
};

const CONTRACT_STATUS_OPTIONS = ["draft", "sent", "signed", "rejected", "skipped"] as const;

function hasRenderableContract(contract: LeadContract): boolean {
	return Boolean(
		contract.file_path ||
			contract.assigned_to ||
			contract.assignee ||
			contract.skip_reason ||
			contract.total_amount != null ||
			contract.setup_fee != null ||
			contract.recurring_fee != null ||
			contract.development_days != null ||
			contract.status !== "draft",
	);
}

function formatMoney(amount: number | null, currency: string | null): string {
	if (amount == null) return "—";
	return `${currency ?? ""} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────

interface LeadContractsTabProps {
	leadId: number;
}

export function LeadContractsTab({ leadId }: LeadContractsTabProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const contractsQuery = useGetLeadContracts(leadId);
	const updateContract = useUpdateLeadContract(leadId);
	const contracts = (contractsQuery.data ?? []).filter(hasRenderableContract);

	const columns: Column<LeadContract>[] = [
		{ key: "id", header: "ID", render: (c) => <span className="font-mono text-xs text-muted-foreground">#{c.id}</span> },
		{
			key: "status",
			header: "Status",
			render: (c) => (
				<Select
					value={c.status}
					disabled={updateContract.isPending}
					onValueChange={(status) => {
						updateContract.mutate(
							{ contractId: c.id, payload: { status } },
							{
								onSuccess: () => toast.success("Contract status updated."),
								onError: () => toast.error("Failed to update contract status."),
							},
						);
					}}
				>
					<SelectTrigger className="h-8 w-32">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{CONTRACT_STATUS_OPTIONS.map((status) => (
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
		{
			key: "model",
			header: "Model",
			render: (c) =>
				c.contract_model ? (
					<Badge
						variant="outline"
						className={MODEL_CLASS[c.contract_model] ?? "bg-muted text-muted-foreground"}
					>
						{MODEL_LABEL[c.contract_model] ?? c.contract_model}
					</Badge>
				) : (
					<span className="text-xs text-muted-foreground">—</span>
				),
		},
		{ key: "total", header: "Total / Setup Fee", render: (c) => <span className="text-sm font-medium">{c.contract_model === "standard" ? formatMoney(c.total_amount, c.currency) : formatMoney(c.setup_fee, c.currency)}</span> },
		{ key: "recurring", header: "Recurring Fee", render: (c) => <span className="text-sm text-muted-foreground">{c.contract_model === "saas_subscription" ? formatMoney(c.recurring_fee, c.currency) : "—"}</span> },
		{ key: "devDays", header: "Dev Days", render: (c) => <span className="text-sm text-muted-foreground">{c.development_days != null ? `${c.development_days}d` : "—"}</span> },
		{
			key: "document",
			header: "Document",
			render: (c) =>
				c.file_path ? (
					<a
						href={c.file_path}
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
		{ key: "created", header: "Created", render: (c) => <span className="text-sm text-muted-foreground">{format(new Date(c.created_at), "MMM d, yyyy")}</span> },
	];

	return (
		<div className="pt-4 space-y-4">
			{/* ── Toolbar ──────────────────────────────────────────────────── */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{contracts.length} contract{contracts.length !== 1 ? "s" : ""}
				</p>
				<Button
					size="sm"
					className="gap-1.5"
					onClick={() => setModalOpen(true)}
				>
					<PlusIcon className="size-4" />
					Add Contract
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={contracts}
				keyExtractor={(contract) => contract.id}
				isLoading={contractsQuery.isLoading}
				error={contractsQuery.error}
				emptyState={{
					icon: FileSignature,
					title: "No contracts yet",
					description: "Add the first one.",
				}}
			/>

			{/* ── Creation modal — renders ContractDirectUploadTab exactly ── */}
			<CreateContractModal
				leadId={leadId}
				open={modalOpen}
				onOpenChange={setModalOpen}
				onCreated={() => contractsQuery.refetch()}
			/>
		</div>
	);
}
