"use client";

/**
 * LeadActivityTab
 *
 * Renders the Activity Log tab on the Lead Details Page.
 *
 * Reuses the ActivityTimeline component extracted from LeadDetailsSheet —
 * the EXACT same visual timeline that appears in the Kanban side panel.
 *
 * Shows a chronological view of the lead's pipeline progression:
 * completed stages (emerald), current stage (primary), pending (muted).
 */

import { ActivityTimeline } from "@/features/leads/ui/ActivityTimeline";
import { PipelineProgress } from "@/features/leads/ui/PipelineProgress";
import { Separator } from "@/shared/ui/separator";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";

// ─────────────────────────────────────────────────────────────────────────────

interface LeadActivityTabProps {
	currentStage: PipelineStage;
	leadId: number;
	createdAt: string;
	updatedAt: string;
}

export function LeadActivityTab({ currentStage, leadId, createdAt, updatedAt }: LeadActivityTabProps) {
	return (
		<div className="pt-4 space-y-6">
			{/* ── Pipeline Progress ─────────────────────────────────────────── */}
			<div className="rounded-xl border bg-card p-5 space-y-4">
				<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pipeline Progress</h3>
				<PipelineProgress currentStage={currentStage} />
			</div>

			<Separator />

			{/* ── Stage History Timeline ────────────────────────────────────── */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Stage History</h3>
					<p className="text-xs text-muted-foreground">Lead #{leadId}</p>
				</div>

				{/* REUSED COMPONENT — exact same ActivityTimeline from LeadDetailsSheet */}
				<ActivityTimeline currentStage={currentStage} />
			</div>

			<Separator />

			{/* ── Timestamps ───────────────────────────────────────────────── */}
			<div className="rounded-xl border bg-card p-5 space-y-3">
				<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Record Info</h3>
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<p className="text-xs text-muted-foreground mb-0.5">Created</p>
						<p className="font-medium">
							{new Date(createdAt).toLocaleDateString(undefined, {
								year: "numeric",
								month: "short",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground mb-0.5">Last Updated</p>
						<p className="font-medium">
							{new Date(updatedAt).toLocaleDateString(undefined, {
								year: "numeric",
								month: "short",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
