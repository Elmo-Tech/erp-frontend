"use client";

/**
 * PipelineProgress
 *
 * Extracted from LeadDetailsSheet so it can be reused standalone in
 * the LeadActivityTab on the Lead Details Page.
 *
 * Renders a horizontal progress bar showing all pipeline stages with
 * colour-coded dots: completed (emerald), current (primary), pending (muted).
 */

import { cn } from "@/shared/lib/utils";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";

interface PipelineProgressProps {
	currentStage: PipelineStage;
}

export function PipelineProgress({ currentStage }: PipelineProgressProps) {
	const currentIdx = PIPELINE_STAGES.indexOf(currentStage);

	return (
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
	);
}
