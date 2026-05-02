"use client";

/**
 * LeadsPipelinePage
 *
 * Top-level view for the Sales Pipeline Kanban Board.
 * Responsible for:
 *  - Fetching leads from the server and seeding the Zustand store.
 *  - Rendering the <LeadsKanbanBoard /> widget.
 *  - Hosting the "+ Add Lead" button and <CreateLeadModal />.
 */

import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { usePipelineStore } from "@/features/leads/model/usePipelineStore";
import { getLeads } from "@/features/leads/api/leads.api";
import { CreateLeadModal } from "@/features/leads/ui/CreateLeadModal";
import { LeadsKanbanBoard } from "@/widgets/leads-management";
import type { Lead } from "@/features/leads/model/types";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";
import { PIPELINE_STAGES } from "@/features/leads/model/pipelineConstants";

// Map backend stage strings to frontend PipelineStage keys
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

export default function LeadsPipelinePage() {
	const setLeads = usePipelineStore((s) => s.setLeads);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch leads from the server on mount and seed the Zustand store.
	useEffect(() => {
		let cancelled = false;

		async function fetchLeads() {
			setIsLoading(true);
			try {
				const response = await getLeads();
				if (cancelled) return;

				const leads: Lead[] = response.data
					.map((item): Lead | null => {
						const stage = BACKEND_TO_FRONTEND_STAGE[item.stage];
						// Skip leads with unknown stages so they don't break the board
						if (!stage || !PIPELINE_STAGES.includes(stage)) return null;

						return {
							id: item.id,
							name: item.title,
							company: item.company ?? undefined,
							email: item.email ?? undefined,
							phone: item.phone ?? undefined,
							stage,
							assignedTo: item.assignedTo ?? undefined,
							createdAt: item.createdAt,
							updatedAt: item.updatedAt,
						};
					})
					.filter((l): l is Lead => l !== null);

				setLeads(leads);
			} catch (err) {
				console.error("[LeadsPipelinePage] Failed to fetch leads:", err);
				// Keep the board empty rather than crashing
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

	return (
		<div className="flex flex-col gap-4 w-full">
			{/* ── Page header ──────────────────────────────────────────────── */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Sales Pipeline</h1>
					<p className="text-sm text-muted-foreground mt-0.5">Drag leads across stages to advance them through the pipeline.</p>
				</div>

				<Button onClick={() => setIsModalOpen(true)}>
					<PlusIcon className="mr-2 size-4" />
					Add Lead
				</Button>
			</div>

			{/* ── Kanban board ─────────────────────────────────────────────── */}
			{isLoading ? <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] text-muted-foreground text-sm">Loading pipeline…</div> : <LeadsKanbanBoard />}

			{/* ── Create lead modal ────────────────────────────────────────── */}
			<CreateLeadModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
			/>
		</div>
	);
}
