"use client";

import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/lib/utils";
import type { Milestone } from "../api/execution.api";
import type { MilestoneSwimlaneView } from "../model/milestone-swimlane-view";

interface MilestoneSwimlaneHeaderProps {
	milestone: Milestone;
	view: MilestoneSwimlaneView;
	isCollapsed: boolean;
	onToggleCollapse?: () => void;
}

export function MilestoneSwimlaneHeader({ milestone, view, isCollapsed, onToggleCollapse }: MilestoneSwimlaneHeaderProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-2">
					<button
						type="button"
						className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
						onClick={onToggleCollapse}
						aria-label={isCollapsed ? `Expand ${milestone.title}` : `Collapse ${milestone.title}`}
					>
						{isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
					</button>
					<Layers className="size-4 shrink-0 text-muted-foreground" />
					<h3 className="truncate text-sm font-semibold">{milestone.title}</h3>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<span className="text-xs text-muted-foreground">{view.taskCountLabel}</span>
					<Badge
						variant="outline"
						className={cn("rounded-sm border px-1.5 py-0 font-mono text-[10px] uppercase tracking-wide", view.statusColorClass)}
					>
						{view.statusLabel}
					</Badge>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<Progress
					value={view.progress}
					className="h-1.5 flex-1"
					aria-label={`Milestone progress: ${view.progress}%`}
				/>
				<span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{view.progressLabel}</span>
			</div>
		</div>
	);
}
