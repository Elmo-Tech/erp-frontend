"use client";

/**
 * ActivityTimeline
 *
 * Extracted from LeadDetailsSheet so it can be reused standalone in
 * the LeadActivityTab on the Lead Details Page.
 *
 * Shows a vertical timeline of pipeline stages — completed (emerald),
 * current (primary), and pending (muted) — with status badges.
 */

import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TimelineEvent {
	stage: PipelineStage;
	label: string;
	completed: boolean;
	current: boolean;
}

interface ActivityTimelineProps {
	/** The lead's current pipeline stage. */
	currentStage: PipelineStage;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ActivityTimeline({ currentStage }: ActivityTimelineProps) {
	const currentIdx = PIPELINE_STAGES.indexOf(currentStage);

	// Exclude "new" — it's the starting point, not a meaningful activity event
	const events: TimelineEvent[] = PIPELINE_STAGES.filter((s) => s !== "new").map((stage) => {
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
					{/* ── Timeline connector ──────────────────────────────── */}
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

					{/* ── Event content ───────────────────────────────────── */}
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
