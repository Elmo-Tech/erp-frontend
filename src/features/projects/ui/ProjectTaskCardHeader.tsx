"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CardHeader } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import type { ProjectTask } from "../api/execution.api";
import type { TaskCardView } from "../model/task-card-view";

interface ProjectTaskCardHeaderProps {
	task: ProjectTask;
	view: TaskCardView;
	canEdit: boolean;
	canDelete: boolean;
	onEditClick: (event: React.MouseEvent) => void;
	onDeleteClick: (event: React.MouseEvent) => void;
}

export function ProjectTaskCardHeader({ task, view, canEdit, canDelete, onEditClick, onDeleteClick }: ProjectTaskCardHeaderProps) {
	return (
		<CardHeader className="px-4 pt-4 pb-0">
			<div className="flex items-start justify-between gap-2">
				<p className={cn("text-sm font-medium leading-snug", view.isCompleted && "line-through text-muted-foreground")}>{task.title}</p>
				<div className="flex shrink-0 items-center gap-1">
					<Badge
						variant="outline"
						className={cn("rounded-sm border px-1.5 py-0 font-mono text-[10px] uppercase tracking-wide", view.statusColorClass)}
					>
						{view.statusLabel}
					</Badge>
					{canEdit && (
						<Button
							type="button"
							size="icon-sm"
							variant="ghost"
							onClick={onEditClick}
							aria-label={`Edit task: ${task.title}`}
						>
							<Pencil className="size-3.5" />
						</Button>
					)}
					{canDelete && (
						<Button
							type="button"
							size="icon-sm"
							variant="ghost"
							className="text-destructive hover:text-destructive"
							onClick={onDeleteClick}
							aria-label={`Delete task: ${task.title}`}
						>
							<Trash2 className="size-3.5" />
						</Button>
					)}
				</div>
			</div>
		</CardHeader>
	);
}
