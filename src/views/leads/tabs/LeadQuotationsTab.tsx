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

import { useState } from "react";
import { PlusIcon, Receipt, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { useGetLeadQuotations, type LeadQuotation } from "@/features/leads/api/leads.api";
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
	const [modalOpen, setModalOpen] = useState(false);
	const quotationsQuery = useGetLeadQuotations(leadId);
	const quotations = quotationsQuery.data ?? [];

	const columns: Column<LeadQuotation>[] = [
		{ key: "id", header: "ID", render: (q) => <span className="font-mono text-xs text-muted-foreground">#{q.id}</span> },
		{
			key: "status",
			header: "Status",
			render: (q) => (
				<Badge
					variant="outline"
					className={STATUS_CLASS[q.status] ?? "bg-muted text-muted-foreground"}
				>
					{q.status}
				</Badge>
			),
		},
		{ key: "basePrice", header: "Base Price", render: (q) => <span className="text-sm font-medium">{formatMoney(q.base_price, q.currency)}</span> },
		{ key: "finalTotal", header: "Final Total", render: (q) => <span className="text-sm font-semibold text-foreground">{formatMoney(q.final_total, q.currency)}</span> },
		{ key: "commission", header: "Commission", render: (q) => <span className="text-sm text-muted-foreground capitalize">{q.commission_type ?? "—"}</span> },
		{
			key: "document",
			header: "Document",
			render: (q) =>
				q.file_path ? (
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
				),
		},
		{ key: "created", header: "Created", render: (q) => <span className="text-sm text-muted-foreground">{format(new Date(q.created_at), "MMM d, yyyy")}</span> },
	];

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

			<DataTable
				columns={columns}
				data={quotations}
				keyExtractor={(quotation) => quotation.id}
				isLoading={quotationsQuery.isLoading}
				error={quotationsQuery.error}
				emptyState={{
					icon: Receipt,
					title: "No quotations yet",
					description: "Add the first one.",
				}}
			/>

			{/* ── Creation modal — renders QuotationDirectUploadTab exactly ── */}
			<CreateQuotationModal
				leadId={leadId}
				open={modalOpen}
				onOpenChange={setModalOpen}
				onCreated={() => quotationsQuery.refetch()}
			/>
		</div>
	);
}
