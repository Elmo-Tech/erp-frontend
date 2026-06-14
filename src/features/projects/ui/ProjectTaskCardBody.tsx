"use client";

import { CheckSquare, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import type { ProjectTask } from "../api/execution.api";
import { getTaskAssigneeInitials, type TaskCardView } from "../model/task-card-view";

interface ProjectTaskCardBodyProps {
	task: ProjectTask;
	view: TaskCardView;
}

export function ProjectTaskCardBody({ task, view }: ProjectTaskCardBodyProps) {
	return (
		<CardContent className="px-4 py-0">
			<div className="flex items-center justify-between gap-3">
				{view.totalDeliverables > 0 ? (
					<div className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs", view.allDeliverablesDone ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted/50 text-muted-foreground")}>
						<CheckSquare className="size-3" />
						<span>
							{view.completedDeliverables}/{view.totalDeliverables}
						</span>
					</div>
				) : (
					<div className="flex items-center gap-1 text-xs text-muted-foreground/50">
						<CheckSquare className="size-3" />
						<span>No deliverables</span>
					</div>
				)}

				{task.assignee ? (
					<div className="flex items-center gap-1.5">
						<Avatar className="size-5">
							{task.assignee.avatar && (
								<AvatarImage
									src={task.assignee.avatar}
									alt={task.assignee.name}
								/>
							)}
							<AvatarFallback className="text-[9px]">{getTaskAssigneeInitials(task.assignee.name)}</AvatarFallback>
						</Avatar>
						<span className="max-w-[80px] truncate text-xs text-muted-foreground">{task.assignee.name}</span>
					</div>
				) : (
					<div className="flex items-center gap-1 text-xs text-muted-foreground/40">
						<User className="size-3" />
						<span>Unassigned</span>
					</div>
				)}
			</div>
		</CardContent>
	);
}
