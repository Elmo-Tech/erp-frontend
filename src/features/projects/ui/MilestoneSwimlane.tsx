"use client";

/**
 * MilestoneSwimlane
 *
 * Renders a single milestone as a swimlane section:
 *  - Header: milestone title, progress bar, status badge, task count
 *  - Body:   responsive 3-column grid of ProjectTaskCards
 *
 * Accepts the full task list for the project and filters internally
 * so the parent (ProjectTasksTab) doesn't need to pre-filter.
 */

import { Layers } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/lib/utils";
import { MilestoneStatusColors, MilestoneStatusLabels, MilestoneStatus } from "@/shared/lib/statusHelpers";
import { ProjectTaskCard } from "./ProjectTaskCard";
import type { Milestone, ProjectTask } from "../api/execution.api";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface MilestoneSwimlaneProps {
	milestone: Milestone;
	tasks: ProjectTask[];
	projectId: number;
	onTaskClick: (task: ProjectTask) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MilestoneSwimlane({ milestone, tasks, projectId, onTaskClick }: MilestoneSwimlaneProps) {
	const progress = milestone.progressPercentage ?? 0;
	const statusColorClass = MilestoneStatusColors[milestone.status as MilestoneStatus] ?? "bg-gray-100 text-gray-800 border-gray-200";
	const statusLabel = MilestoneStatusLabels[milestone.status as MilestoneStatus] ?? milestone.statusLabel ?? milestone.status ?? "Pending";

	return (
		<div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
			{/* ── Swimlane header ──────────────────────────────────────────────── */}
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-2">
						<Layers className="size-4 shrink-0 text-muted-foreground" />
						<h3 className="truncate text-sm font-semibold">{milestone.title}</h3>
					</div>

					<div className="flex shrink-0 items-center gap-2">
						{/* Task count */}
						<span className="text-xs text-muted-foreground">
							{tasks.length} {tasks.length === 1 ? "task" : "tasks"}
						</span>

						{/* Status badge */}
						<Badge
							variant="outline"
							className={cn("rounded-sm border px-1.5 py-0 font-mono text-[10px] uppercase tracking-wide", statusColorClass)}
						>
							{statusLabel}
						</Badge>
					</div>
				</div>

				{/* Progress bar */}
				<div className="flex items-center gap-3">
					<Progress
						value={progress}
						className="h-1.5 flex-1"
						aria-label={`Milestone progress: ${progress}%`}
					/>
					<span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{Math.round(progress)}%</span>
				</div>
			</div>

			{/* ── Task grid ────────────────────────────────────────────────────── */}
			{tasks.length > 0 ? (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
					{tasks.map((task) => (
						<ProjectTaskCard
							key={task.taskId}
							task={task}
							projectId={projectId}
							onClick={onTaskClick}
						/>
					))}
				</div>
			) : (
				<div className="flex min-h-20 items-center justify-center rounded-md border border-dashed">
					<p className="text-xs text-muted-foreground">No tasks in this milestone yet.</p>
				</div>
			)}
		</div>
	);
}
