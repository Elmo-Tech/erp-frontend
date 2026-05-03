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

import { useEffect, useState, useCallback } from "react";
import { PlusIcon, FileSignature, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { getLeadContracts, type LeadContract } from "@/features/leads/api/leads.api";
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

function formatMoney(amount: number | null, currency: string | null): string {
	if (amount == null) return "—";
	return `${currency ?? ""} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────

interface LeadContractsTabProps {
	leadId: number;
}

export function LeadContractsTab({ leadId }: LeadContractsTabProps) {
	const [contracts, setContracts] = useState<LeadContract[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);

	const fetchContracts = useCallback(async () => {
		setIsLoading(true);
		try {
			const res = await getLeadContracts(leadId);
			setContracts(res.data);
		} catch (err) {
			console.error("[LeadContractsTab] Failed to fetch contracts:", err);
			toast.error("Failed to load contracts.");
		} finally {
			setIsLoading(false);
		}
	}, [leadId]);

	useEffect(() => {
		fetchContracts();
	}, [fetchContracts]);

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

			{/* ── Table ────────────────────────────────────────────────────── */}
			{contracts.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-48 rounded-xl border bg-muted/20 gap-3">
					<FileSignature className="size-8 text-muted-foreground/40" />
					<p className="text-sm text-muted-foreground">No contracts yet. Add the first one.</p>
				</div>
			) : (
				<div className="rounded-xl border overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/40 hover:bg-muted/40">
								<TableHead className="font-semibold">ID</TableHead>
								<TableHead className="font-semibold">Status</TableHead>
								<TableHead className="font-semibold">Model</TableHead>
								<TableHead className="font-semibold">Total / Setup Fee</TableHead>
								<TableHead className="font-semibold">Recurring Fee</TableHead>
								<TableHead className="font-semibold">Dev Days</TableHead>
								<TableHead className="font-semibold">Document</TableHead>
								<TableHead className="font-semibold">Created</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{contracts.map((c) => (
								<TableRow
									key={c.id}
									className="hover:bg-muted/30"
								>
									<TableCell className="font-mono text-xs text-muted-foreground">#{c.id}</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={STATUS_CLASS[c.status] ?? "bg-muted text-muted-foreground"}
										>
											{c.status}
										</Badge>
									</TableCell>
									<TableCell>
										{c.contract_model ? (
											<Badge
												variant="outline"
												className={MODEL_CLASS[c.contract_model] ?? "bg-muted text-muted-foreground"}
											>
												{MODEL_LABEL[c.contract_model] ?? c.contract_model}
											</Badge>
										) : (
											<span className="text-xs text-muted-foreground">—</span>
										)}
									</TableCell>
									<TableCell className="text-sm font-medium">{c.contract_model === "standard" ? formatMoney(c.total_amount, c.currency) : formatMoney(c.setup_fee, c.currency)}</TableCell>
									<TableCell className="text-sm text-muted-foreground">{c.contract_model === "saas_subscription" ? formatMoney(c.recurring_fee, c.currency) : <span>—</span>}</TableCell>
									<TableCell className="text-sm text-muted-foreground">{c.development_days != null ? `${c.development_days}d` : "—"}</TableCell>
									<TableCell>
										{c.file_path ? (
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
										)}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* ── Creation modal — renders ContractDirectUploadTab exactly ── */}
			<CreateContractModal
				leadId={leadId}
				open={modalOpen}
				onOpenChange={setModalOpen}
				onCreated={fetchContracts}
			/>
		</div>
	);
}
