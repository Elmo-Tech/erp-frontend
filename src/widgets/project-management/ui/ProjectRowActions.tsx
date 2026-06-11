"use client";

import { MoreHorizontal } from "lucide-react";
import type { Project } from "@/entities/project/model/types";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";

interface ProjectRowActionsProps {
	project: Project;
	canDelete: boolean;
	onView: (project: Project) => void;
	onTogglePin: (project: Project) => void;
	onDelete: (project: Project) => void;
}

export function ProjectRowActions({ project, canDelete, onView, onTogglePin, onDelete }: ProjectRowActionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={`Open actions for ${project.title}`}
				>
					<MoreHorizontal />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => onView(project)}>View</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onTogglePin(project)}>{project.isPinned ? "Unpin" : "Pin"}</DropdownMenuItem>
				{canDelete && (
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={() => onDelete(project)}
					>
						Delete
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
