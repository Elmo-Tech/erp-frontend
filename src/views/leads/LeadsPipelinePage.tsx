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

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, LayoutGrid, List } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { usePipelineStore } from "@/features/leads/model/usePipelineStore";
import { getLeads } from "@/features/leads/api/leads.api";
import { CreateLeadModal } from "@/features/leads/ui/CreateLeadModal";
import { LeadsKanbanBoard } from "@/widgets/leads-management";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import type { Lead } from "@/features/leads/model/types";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";

// ─────────────────────────────────────────────────────────────────────────────
// Backend → frontend stage mapping
// ─────────────────────────────────────────────────────────────────────────────

const BACKEND_TO_FRONTEND_STAGE: Record<string, PipelineStage> = {
	new_lead: "new",
	meeting: "meeting",
	proposal: "proposal",
	quotation: "quotation",
	contract: "contract",
	won: "closed_won",
	// pass-through for already-mapped values
	new: "new",
	closed_won: "closed_won",
};

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
	if (leads.length === 0) {
		return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm border rounded-xl bg-muted/20">No leads found. Add your first lead to get started.</div>;
	}

	return (
		<div className="rounded-xl border overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						<TableHead className="font-semibold">Title</TableHead>
						<TableHead className="font-semibold">Company</TableHead>
						<TableHead className="font-semibold">Stage</TableHead>
						<TableHead className="font-semibold text-right">Expected Budget</TableHead>
						<TableHead className="font-semibold">Assigned To</TableHead>
						<TableHead className="font-semibold">Created At</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{leads.map((lead) => (
						<TableRow
							key={lead.id}
							className="cursor-pointer hover:bg-muted/30 transition-colors"
							onClick={() => onRowClick(lead.id)}
						>
							<TableCell className="font-medium">{lead.name}</TableCell>
							<TableCell className="text-muted-foreground">{lead.company ?? "—"}</TableCell>
							<TableCell>
								<Badge
									variant="outline"
									className={STAGE_BADGE_CLASS[lead.stage]}
								>
									{STAGE_LABELS[lead.stage]}
								</Badge>
							</TableCell>
							<TableCell className="text-right tabular-nums text-muted-foreground">
								{lead.expectedBudget != null
									? lead.expectedBudget.toLocaleString(undefined, {
											style: "currency",
											currency: "USD",
											maximumFractionDigits: 0,
										})
									: "—"}
							</TableCell>
							<TableCell className="text-muted-foreground">{lead.assignedTo ? `#${lead.assignedTo}` : "—"}</TableCell>
							<TableCell className="text-muted-foreground text-sm">{format(new Date(lead.createdAt), "MMM d, yyyy")}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

type ViewMode = "board" | "table";

export default function LeadsPipelinePage() {
	const router = useRouter();
	const setLeads = usePipelineStore((s) => s.setLeads);
	const leads = usePipelineStore((s) => s.leads);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [viewMode, setViewMode] = useState<ViewMode>("board");

	// Fetch leads from the server on mount and seed the Zustand store.
	useEffect(() => {
		let cancelled = false;

		async function fetchLeads() {
			setIsLoading(true);
			try {
				const response = await getLeads();
				if (cancelled) return;

				const mapped: Lead[] = response.data
					.map((item): Lead | null => {
						const stage = BACKEND_TO_FRONTEND_STAGE[item.stage];
						if (!stage || !PIPELINE_STAGES.includes(stage)) return null;

						return {
							id: item.id,
							name: item.title,
							company: item.company ?? undefined,
							email: item.email ?? undefined,
							phone: item.phone ?? undefined,
							stage,
							assignedTo: item.assignedTo ?? undefined,
							expectedBudget: item.expected_budget ?? undefined,
							createdAt: item.createdAt,
							updatedAt: item.updatedAt,
						};
					})
					.filter((l): l is Lead => l !== null);

				setLeads(mapped);
			} catch (err) {
				console.error("[LeadsPipelinePage] Failed to fetch leads:", err);
				setLeads([]);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}

		fetchLeads();
		return () => {
			cancelled = true;
		};
	}, [setLeads]);

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

			{/* ── Content area ─────────────────────────────────────────────── */}
			{isLoading ? (
				<div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">Loading pipeline…</div>
			) : viewMode === "board" ? (
				/* Board: overflow-x-auto so columns scroll horizontally.
				   No flex-1 here — the parent is a normal block flow container. */
				<div className="w-full overflow-x-auto pb-4">
					<LeadsKanbanBoard onCardClick={handleRowClick} />
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
