"use client";

/**
 * KanbanColumn — A single pipeline stage column.
 *
 * Visual design:
 *  - Subtle muted background with rounded-xl corners
 *  - Clean header: stage label + pill badge with count
 *  - Drop zone highlights with a primary tint on drag-over
 */

import { Droppable } from "@hello-pangea/dnd";
import { cn } from "@/shared/lib/utils";
import { STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";
import type { Lead } from "@/features/leads/model/types";
import { LeadCard } from "./LeadCard";

interface KanbanColumnProps {
	stage: PipelineStage;
	leads: Lead[];
	onCardClick?: (leadId: number) => void;
}

// Subtle accent colour per stage for the header dot
const STAGE_ACCENT: Record<PipelineStage, string> = {
	new: "bg-slate-400",
	meeting: "bg-blue-400",
	proposal: "bg-violet-400",
	quotation: "bg-amber-400",
	contract: "bg-orange-400",
	closed_won: "bg-emerald-500",
};

export function KanbanColumn({ stage, leads, onCardClick }: KanbanColumnProps) {
	return (
		<div className="flex flex-col w-[272px] shrink-0">
			{/* ── Column header ──────────────────────────────────────────────── */}
			<div className="flex items-center justify-between mb-2.5 px-1">
				<div className="flex items-center gap-2">
					<span className={cn("inline-block size-2 rounded-full shrink-0", STAGE_ACCENT[stage])} />
					<h3 className="text-sm font-semibold text-foreground tracking-tight">{STAGE_LABELS[stage]}</h3>
				</div>
				<span className={cn("text-xs font-medium tabular-nums rounded-full px-2 py-0.5", "bg-muted text-muted-foreground")}>{leads.length}</span>
			</div>

			{/* ── Drop zone ──────────────────────────────────────────────────── */}
			<Droppable droppableId={stage}>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className={cn("flex-1 min-h-[200px] rounded-xl p-2.5 transition-colors duration-150", "bg-muted/30 border border-border/60", snapshot.isDraggingOver && "bg-primary/5 border-primary/30 ring-1 ring-primary/20")}
					>
						{leads.map((lead, index) => (
							<LeadCard
								key={lead.id}
								lead={lead}
								index={index}
								onCardClick={onCardClick}
							/>
						))}
						{provided.placeholder}

						{/* Empty state */}
						{leads.length === 0 && !snapshot.isDraggingOver && (
							<div className="flex items-center justify-center h-16 mt-1">
								<p className="text-xs text-muted-foreground/50 select-none">Drop leads here</p>
							</div>
						)}
					</div>
				)}
			</Droppable>
		</div>
	);
}
