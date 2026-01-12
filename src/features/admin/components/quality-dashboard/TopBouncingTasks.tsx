/**
 * Top Bouncing Tasks Component
 * Requirement 15.2: List top 10 bouncing tasks
 */

"use client";

import { TaskStatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";
import { BouncingTask } from "../../types";

interface TopBouncingTasksProps {
	tasks: BouncingTask[];
	onTaskClick?: (taskId: number) => void;
}

export function TopBouncingTasks({ tasks, onTaskClick }: TopBouncingTasksProps) {
	if (!tasks.length) {
		return (
			<div className="flex items-center justify-center h-32 text-muted-foreground">
				<CheckCircle className="h-8 w-8 mr-2" />
				No bouncing tasks found
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{tasks.slice(0, 10).map((task, index) => (
				<div
					key={task.taskId}
					className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
				>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className="text-xs"
							>
								#{index + 1}
							</Badge>
							<h4 className="font-medium text-sm truncate">{task.title}</h4>
						</div>
						<div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
							<span>Project: {task.projectTitle}</span>
							<span>Assigned to: {task.assignedTo}</span>
							<TaskStatusBadge
								status={task.status}
								size="sm"
							/>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge
							variant="destructive"
							className="text-xs"
						>
							{task.reopenCount} bounces
						</Badge>
						{onTaskClick && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onTaskClick(task.taskId)}
								className="h-8 w-8 p-0"
							>
								<ExternalLink className="h-3 w-3" />
							</Button>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
