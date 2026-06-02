"use client";

import { MoreHorizontal, Pin } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { formatCurrency } from "@/shared/lib/formatters";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { cn } from "@/shared/lib/utils";
import type { Project } from "../model/types";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

interface ProjectCardProps {
	project: Project;
	canViewBudget?: boolean;
	onView?: (project: Project) => void;
	onEdit?: (project: Project) => void;
	onDelete?: (project: Project) => void;
	onTogglePin?: (project: Project) => void;
	className?: string;
}

export function ProjectCard({ project, canViewBudget = true, onView, onEdit, onDelete, onTogglePin, className }: ProjectCardProps) {
	const canShowBudget = canViewBudget && project.canViewBudget !== false;

	const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (!onView) {
			return;
		}

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onView(project);
		}
	};

	return (
		<article
			role={onView ? "button" : undefined}
			tabIndex={onView ? 0 : undefined}
			onClick={() => onView?.(project)}
			onKeyDown={handleKeyDown}
			className={cn(
				"grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 text-sm transition-colors last:border-b-0 md:grid-cols-[32px_minmax(180px,1.5fr)_minmax(150px,1fr)_120px_120px_100px_40px] md:items-center md:gap-3",
				onView && "cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className,
			)}
		>
			<div className="hidden md:block">
				{onTogglePin && (
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label={project.isPinned ? `Unpin ${project.title}` : `Pin ${project.title}`}
						className={cn("text-muted-foreground", project.isPinned && "text-foreground")}
						onClick={(event) => {
							event.stopPropagation();
							onTogglePin(project);
						}}
					>
						<Pin className={cn(project.isPinned && "fill-current")} />
					</Button>
				)}
			</div>

			<div className="min-w-0">
				<div className="flex min-w-0 items-center gap-2">
					{onTogglePin && (
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label={project.isPinned ? `Unpin ${project.title}` : `Pin ${project.title}`}
							className={cn("size-7 shrink-0 text-muted-foreground md:hidden", project.isPinned && "text-foreground")}
							onClick={(event) => {
								event.stopPropagation();
								onTogglePin(project);
							}}
						>
							<Pin className={cn(project.isPinned && "fill-current")} />
						</Button>
					)}
					<div className="truncate font-medium leading-5">{project.title}</div>
				</div>
				<div className="truncate text-xs text-muted-foreground">{project.client?.name ?? "No client"}</div>
			</div>

			<div className="min-w-0">
				<div className="truncate leading-5">{project.client?.name || "No client"}</div>
				<div className="truncate text-xs text-muted-foreground">{project.client?.email || "No email"}</div>
			</div>

			<div>
				<ProjectStatusBadge status={project.status} />
			</div>

			<div className="text-xs tabular-nums text-muted-foreground">{canShowBudget ? formatCurrency(project.budget, project.currency || "USD") : "Restricted"}</div>

			<div className="text-xs tabular-nums text-muted-foreground">{formatDateDisplay(project.deadline)}</div>

			<div className="flex justify-end">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label={`Open actions for ${project.title}`}
							onClick={(event) => event.stopPropagation()}
						>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						onClick={(event) => event.stopPropagation()}
					>
						{onView && <DropdownMenuItem onClick={() => onView(project)}>View</DropdownMenuItem>}
						{onEdit && <DropdownMenuItem onClick={() => onEdit(project)}>Edit</DropdownMenuItem>}
						{onTogglePin && <DropdownMenuItem onClick={() => onTogglePin(project)}>{project.isPinned ? "Unpin" : "Pin"}</DropdownMenuItem>}
						{onDelete && (
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => onDelete(project)}
							>
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</article>
	);
}
