import { MilestoneStatus, MilestoneStatusColors, MilestoneStatusLabels } from "@/shared/lib/statusHelpers";
import type { Milestone } from "../api/execution.api";

const DEFAULT_STATUS_COLOR = "bg-muted text-muted-foreground border-border";

export interface MilestoneSwimlaneView {
	progress: number;
	progressLabel: string;
	taskCountLabel: string;
	statusColorClass: string;
	statusLabel: string;
}

export function buildMilestoneSwimlaneView(milestone: Milestone, taskCount: number): MilestoneSwimlaneView {
	const progress = milestone.progressPercentage ?? 0;

	return {
		progress,
		progressLabel: `${Math.round(progress)}%`,
		taskCountLabel: `${taskCount} ${taskCount === 1 ? "task" : "tasks"}`,
		statusColorClass: MilestoneStatusColors[milestone.status as MilestoneStatus] ?? DEFAULT_STATUS_COLOR,
		statusLabel: MilestoneStatusLabels[milestone.status as MilestoneStatus] ?? milestone.statusLabel ?? milestone.status ?? "Pending",
	};
}
