"use client";

/**
 * Shared lead UI primitives — extracted from LeadDetailsSheet so both
 * lead detail surfaces use identical visuals.
 */

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import { PIPELINE_STAGES, STAGE_LABELS } from "../model/pipelineConstants";
import type { PipelineStage } from "../model/pipelineConstants";

// ─────────────────────────────────────────────────────────────────────────────
// Stage colour map — single source of truth
// ─────────────────────────────────────────────────────────────────────────────

export const STAGE_COLORS: Record<PipelineStage, string> = {
	new: "bg-muted text-muted-foreground border-border",
	meeting: "bg-blue-50 text-blue-700 border-blue-200",
	proposal: "bg-violet-50 text-violet-700 border-violet-200",
	quotation: "bg-amber-50 text-amber-700 border-amber-200",
	contract: "bg-orange-50 text-orange-700 border-orange-200",
	closed_won: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow
// ─────────────────────────────────────────────────────────────────────────────

export function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number | null }) {
	if (!value) return null;
	return (
		<div className="flex items-start gap-3">
			<div className="flex items-center justify-center size-7 rounded-md bg-muted shrink-0 mt-0.5">
				<Icon className="size-3.5 text-muted-foreground" />
			</div>
			<div className="min-w-0">
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className="text-sm font-medium text-foreground truncate">{value}</p>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// PipelineProgress
// ─────────────────────────────────────────────────────────────────────────────

export function PipelineProgress({ currentStage }: { currentStage: PipelineStage }) {
	const currentIdx = PIPELINE_STAGES.indexOf(currentStage);

	return (
		<div className="space-y-2">
			<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pipeline Progress</p>
			<div className="flex items-center gap-1">
				{PIPELINE_STAGES.map((stage, idx) => {
					const isCompleted = idx < currentIdx;
					const isCurrent = idx === currentIdx;
					const isLast = idx === PIPELINE_STAGES.length - 1;

					return (
						<div
							key={stage}
							className="flex items-center gap-1 flex-1 min-w-0"
						>
							<div className="flex flex-col items-center gap-1 flex-1 min-w-0">
								<div className={cn("size-2 rounded-full shrink-0 transition-colors", isCompleted && "bg-emerald-500", isCurrent && "bg-primary ring-2 ring-primary/30", !isCompleted && !isCurrent && "bg-muted-foreground/30")} />
								<p className={cn("text-[9px] text-center leading-tight truncate w-full", isCurrent ? "text-primary font-semibold" : "text-muted-foreground")}>{STAGE_LABELS[stage]}</p>
							</div>
							{!isLast && <div className={cn("h-px flex-1 mb-3 transition-colors", isCompleted ? "bg-emerald-400" : "bg-muted-foreground/20")} />}
						</div>
					);
				})}
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ActivityTimeline
// ─────────────────────────────────────────────────────────────────────────────

export function ActivityTimeline({ currentStage }: { currentStage: PipelineStage }) {
	const currentIdx = PIPELINE_STAGES.indexOf(currentStage);

	const events = PIPELINE_STAGES.filter((s) => s !== "new").map((stage) => {
		const stageIdx = PIPELINE_STAGES.indexOf(stage);
		return {
			stage,
			label: STAGE_LABELS[stage],
			completed: stageIdx < currentIdx,
			current: stageIdx === currentIdx,
		};
	});

	return (
		<div className="space-y-1">
			{events.map((event, idx) => (
				<div
					key={event.stage}
					className="flex items-start gap-3"
				>
					{/* Timeline connector */}
					<div className="flex flex-col items-center shrink-0">
						<div
							className={cn(
								"flex items-center justify-center size-6 rounded-full border-2 transition-colors",
								event.completed && "bg-emerald-500 border-emerald-500 text-white",
								event.current && "bg-primary border-primary text-primary-foreground",
								!event.completed && !event.current && "bg-background border-muted-foreground/30 text-muted-foreground/50",
							)}
						>
							{event.completed ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3" />}
						</div>
						{idx < events.length - 1 && <div className={cn("w-px h-6 mt-0.5 transition-colors", event.completed ? "bg-emerald-300" : "bg-muted-foreground/20")} />}
					</div>

					{/* Event content */}
					<div className="pb-2 min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<p className={cn("text-sm font-medium", event.completed && "text-foreground", event.current && "text-primary", !event.completed && !event.current && "text-muted-foreground")}>{event.label}</p>
							{event.current && (
								<Badge
									variant="outline"
									className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary"
								>
									Current
								</Badge>
							)}
							{event.completed && (
								<Badge
									variant="outline"
									className="text-[10px] px-1.5 py-0 h-4 border-emerald-400/60 text-emerald-600"
								>
									Done
								</Badge>
							)}
						</div>
						{event.completed && <p className="text-xs text-muted-foreground mt-0.5">Stage completed</p>}
						{event.current && <p className="text-xs text-muted-foreground mt-0.5">Lead is currently here</p>}
						{!event.completed && !event.current && <p className="text-xs text-muted-foreground/60 mt-0.5">Pending</p>}
					</div>
				</div>
			))}
		</div>
	);
}
