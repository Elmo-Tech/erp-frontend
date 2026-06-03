"use client";

/**
 * LeadsPipelinePage
 *
 * Top-level view for the Sales Pipeline.
 * Supports two views:
 *  - Board (Kanban) — drag-and-drop pipeline
 *  - Table — sortable data table with row-click navigation
 *
 * Layout fix: the page itself is a flex-col container that fills the
 * available height given by DashboardLayout's scrollable <main>. The
 * Kanban board uses overflow-x-auto internally so it never bleeds outside.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, LayoutGrid, List } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { useGetLeads } from "@/features/leads/api/leads.api";
import type { LeadFilters } from "@/features/leads/api/leads.api";
import { CreateLeadModal } from "@/features/leads/ui/CreateLeadModal";
import { LeadsKanbanBoard } from "@/widgets/leads-management";
import { STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import type { Lead } from "@/features/leads/model/types";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";

// ─────────────────────────────────────────────────────────────────────────────
// Stage badge colours
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_BADGE_CLASS: Record<PipelineStage, string> = {
	new: "bg-slate-100 text-slate-700 border-slate-200",
	meeting: "bg-blue-50 text-blue-700 border-blue-200",
	proposal: "bg-violet-50 text-violet-700 border-violet-200",
	quotation: "bg-amber-50 text-amber-700 border-amber-200",
	contract: "bg-orange-50 text-orange-700 border-orange-200",
	closed_won: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ─────────────────────────────────────────────────────────────────────────────
// Table view
// ─────────────────────────────────────────────────────────────────────────────

interface LeadsTableProps {
	leads: Lead[];
	onRowClick: (id: number) => void;
}

function LeadsTable({ leads, onRowClick }: LeadsTableProps) {
	const columns: Column<Lead>[] = [
		{
			key: "title",
			header: "Title",
			render: (lead) => <span className="font-medium">{lead.name}</span>,
		},
		{
			key: "company",
			header: "Company",
			render: (lead) => <span className="text-muted-foreground">{lead.company ?? "—"}</span>,
		},
		{
			key: "stage",
			header: "Stage",
			render: (lead) => (
				<Badge
					variant="outline"
					className={STAGE_BADGE_CLASS[lead.stage]}
				>
					{STAGE_LABELS[lead.stage]}
				</Badge>
			),
		},
		{
			key: "expectedBudget",
			header: "Expected Budget",
			className: "text-right",
			render: (lead) => (
				<span className="tabular-nums text-muted-foreground">
					{lead.expectedBudget != null
						? lead.expectedBudget.toLocaleString(undefined, {
								style: "currency",
								currency: "USD",
								maximumFractionDigits: 0,
							})
						: "—"}
				</span>
			),
		},
		{
			key: "assignedTo",
			header: "Assigned To",
			render: (lead) => <span className="text-muted-foreground">{lead.assignedTo ? `#${lead.assignedTo}` : "—"}</span>,
		},
		{
			key: "createdAt",
			header: "Created At",
			render: (lead) => <span className="text-sm text-muted-foreground">{format(new Date(lead.createdAt), "MMM d, yyyy")}</span>,
		},
	];

	return (
		<DataTable
			columns={columns}
			data={leads}
			keyExtractor={(lead) => lead.id}
			onRowClick={(lead) => onRowClick(lead.id)}
			emptyState={{
				title: "No leads found",
				description: "Add your first lead to get started.",
			}}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

type ViewMode = "board" | "table";

export default function LeadsPipelinePage() {
	const router = useRouter();
	const [filters, setFilters] = useState<LeadFilters>({});
	const leadsQuery = useGetLeads(filters);
	const leads = leadsQuery.data ?? [];
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [viewMode, setViewMode] = useState<ViewMode>("board");

	const handleRowClick = (id: number) => {
		router.push(`/dashboard/leads/${id}`);
	};

	return (
		<div className="mx-auto flex w-full flex-col gap-4">
			{/* ── Page header ──────────────────────────────────────────────── */}
			<div className="flex items-center justify-between flex-wrap gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Sales Pipeline</h1>
					<p className="text-sm text-muted-foreground mt-0.5">{viewMode === "board" ? "Drag leads across stages to advance them through the pipeline." : "Click a row to open the lead details page."}</p>
				</div>

				<div className="flex items-center gap-2">
					{/* View toggle */}
					<ToggleGroup
						type="single"
						value={viewMode}
						onValueChange={(v) => v && setViewMode(v as ViewMode)}
						className="border rounded-lg p-0.5 bg-muted/30"
					>
						<ToggleGroupItem
							value="board"
							aria-label="Board view"
							className="h-8 w-8 data-[state=on]:bg-background data-[state=on]:shadow-sm"
						>
							<LayoutGrid className="size-4" />
						</ToggleGroupItem>
						<ToggleGroupItem
							value="table"
							aria-label="Table view"
							className="h-8 w-8 data-[state=on]:bg-background data-[state=on]:shadow-sm"
						>
							<List className="size-4" />
						</ToggleGroupItem>
					</ToggleGroup>

					<Button onClick={() => setIsModalOpen(true)}>
						<PlusIcon className="mr-2 size-4" />
						Add Lead
					</Button>
				</div>
			</div>

			<div className="grid gap-3 border-y py-3 md:grid-cols-2 xl:grid-cols-5">
				<SearchInput
					value={filters.search}
					onChange={(search) => setFilters((current) => ({ ...current, search: search || undefined }))}
					placeholder="Search leads"
					className="w-full"
					autoSearch={false}
				/>
				<FilterSelect
					value={filters.stage}
					onChange={(stage) => setFilters((current) => ({ ...current, stage: stage as PipelineStage | undefined }))}
					options={Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }))}
					allLabel="All stages"
					className="w-full"
				/>
				<FilterSelect
					value={filters.status}
					onChange={(status) => setFilters((current) => ({ ...current, status }))}
					options={[
						{ value: "active", label: "Active" },
						{ value: "won", label: "Won" },
						{ value: "lost", label: "Lost" },
					]}
					allLabel="All statuses"
					className="w-full"
				/>
				<SearchInput
					value={filters.source}
					onChange={(source) => setFilters((current) => ({ ...current, source: source || undefined }))}
					placeholder="Source"
					className="w-full"
					autoSearch={false}
				/>
				<SearchInput
					value={filters.assigneeId ? String(filters.assigneeId) : ""}
					onChange={(assigneeId) => setFilters((current) => ({ ...current, assigneeId: assigneeId ? Number(assigneeId) : undefined }))}
					placeholder="Assignee ID"
					className="w-full"
					autoSearch={false}
				/>
			</div>

			{/* ── Content area ─────────────────────────────────────────────── */}
			{leadsQuery.isLoading ? (
				<div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">Loading pipeline…</div>
			) : leadsQuery.isError ? (
				<div className="flex items-center justify-center flex-1 rounded-md border bg-background px-4 py-10 text-sm text-muted-foreground">Unable to load leads.</div>
			) : viewMode === "board" ? (
				/* Board: overflow-x-auto so columns scroll horizontally.
				   No flex-1 here — the parent is a normal block flow container. */
				<div className="w-full overflow-x-auto pb-4">
					<LeadsKanbanBoard
						leads={leads}
						onCardClick={handleRowClick}
					/>
				</div>
			) : (
				<LeadsTable
					leads={leads}
					onRowClick={handleRowClick}
				/>
			)}

			{/* ── Create lead modal ────────────────────────────────────────── */}
			<CreateLeadModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
			/>
		</div>
	);
}
