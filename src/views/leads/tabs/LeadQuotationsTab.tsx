"use client";

/**
 * LeadQuotationsTab
 *
 * Renders the Quotations tab on the Lead Details Page.
 *
 * Features:
 *  - Shadcn Table showing Base Price, Final Total, Currency, Status
 *  - "Add Quotation" button that opens CreateQuotationModal
 *  - CreateQuotationModal renders the EXACT QuotationDirectUploadTab from the pipeline
 */

import { useEffect, useState, useCallback } from "react";
import { PlusIcon, Receipt, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { getLeadQuotations, type LeadQuotation } from "@/features/leads/api/leads.api";
import { CreateQuotationModal } from "@/features/leads/ui/CreateQuotationModal";
import { format } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
	draft: "bg-slate-100 text-slate-700 border-slate-200",
	sent: "bg-blue-50 text-blue-700 border-blue-200",
	accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
	rejected: "bg-red-50 text-red-700 border-red-200",
	expired: "bg-orange-50 text-orange-700 border-orange-200",
};

function formatMoney(amount: number | null, currency: string | null): string {
	if (amount == null) return "—";
	return `${currency ?? ""} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────

interface LeadQuotationsTabProps {
	leadId: number;
}

export function LeadQuotationsTab({ leadId }: LeadQuotationsTabProps) {
	const [quotations, setQuotations] = useState<LeadQuotation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);

	const fetchQuotations = useCallback(async () => {
		setIsLoading(true);
		try {
			const res = await getLeadQuotations(leadId);
			setQuotations(res.data);
		} catch (err) {
			console.error("[LeadQuotationsTab] Failed to fetch quotations:", err);
			toast.error("Failed to load quotations.");
		} finally {
			setIsLoading(false);
		}
	}, [leadId]);

	useEffect(() => {
		fetchQuotations();
	}, [fetchQuotations]);

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
					{quotations.length} quotation{quotations.length !== 1 ? "s" : ""}
				</p>
				<Button
					size="sm"
					className="gap-1.5"
					onClick={() => setModalOpen(true)}
				>
					<PlusIcon className="size-4" />
					Add Quotation
				</Button>
			</div>

			{/* ── Table ────────────────────────────────────────────────────── */}
			{quotations.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-48 rounded-xl border bg-muted/20 gap-3">
					<Receipt className="size-8 text-muted-foreground/40" />
					<p className="text-sm text-muted-foreground">No quotations yet. Add the first one.</p>
				</div>
			) : (
				<div className="rounded-xl border overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/40 hover:bg-muted/40">
								<TableHead className="font-semibold">ID</TableHead>
								<TableHead className="font-semibold">Status</TableHead>
								<TableHead className="font-semibold">Base Price</TableHead>
								<TableHead className="font-semibold">Final Total</TableHead>
								<TableHead className="font-semibold">Commission</TableHead>
								<TableHead className="font-semibold">Document</TableHead>
								<TableHead className="font-semibold">Created</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{quotations.map((q) => (
								<TableRow
									key={q.id}
									className="hover:bg-muted/30"
								>
									<TableCell className="font-mono text-xs text-muted-foreground">#{q.id}</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={STATUS_CLASS[q.status] ?? "bg-muted text-muted-foreground"}
										>
											{q.status}
										</Badge>
									</TableCell>
									<TableCell className="text-sm font-medium">{formatMoney(q.base_price, q.currency)}</TableCell>
									<TableCell className="text-sm font-semibold text-foreground">{formatMoney(q.final_total, q.currency)}</TableCell>
									<TableCell className="text-sm text-muted-foreground capitalize">{q.commission_type ?? "—"}</TableCell>
									<TableCell>
										{q.file_path ? (
											<a
												href={q.file_path}
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
									<TableCell className="text-sm text-muted-foreground">{format(new Date(q.created_at), "MMM d, yyyy")}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* ── Creation modal — renders QuotationDirectUploadTab exactly ── */}
			<CreateQuotationModal
				leadId={leadId}
				open={modalOpen}
				onOpenChange={setModalOpen}
				onCreated={fetchQuotations}
			/>
		</div>
	);
}
