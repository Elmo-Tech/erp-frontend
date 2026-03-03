"use client";

import { useState } from "react";
import { MoreHorizontal, Copy, Pencil, Trash2, Tag, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskTemplate } from "../../types/taskTemplate";
import { cn } from "@/lib/utils";

interface TaskTemplateCardProps {
	template: TaskTemplate;
	onEdit?: (template: TaskTemplate) => void;
	onDelete?: (template: TaskTemplate) => void;
	onInstantiate?: (template: TaskTemplate) => void;
}

export function TaskTemplateCard({ template, onEdit, onDelete, onInstantiate }: TaskTemplateCardProps) {
	const [isHovered, setIsHovered] = useState(false);

	const subtasksCount = template.subtasks?.length || 0;
	const hasDefaultValues = template.defaultValues && Object.keys(template.defaultValues).length > 0;

	return (
		<Card
			className={cn("transition-all duration-200 cursor-pointer hover:shadow-md", !template.isActive && "opacity-60")}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1 space-y-1">
						<div className="flex items-center gap-2">
							<CardTitle className="text-base">{template.name}</CardTitle>
							{!template.isActive && (
								<Badge
									variant="outline"
									className="text-xs"
								>
									Inactive
								</Badge>
							)}
						</div>
						{template.description && <CardDescription className="text-sm line-clamp-2">{template.description}</CardDescription>}
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className={cn("h-8 w-8 p-0 transition-opacity", !isHovered && "opacity-0")}
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onInstantiate?.(template)}>
								<Copy className="h-4 w-4 mr-2" />
								Create Task
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => onEdit?.(template)}>
								<Pencil className="h-4 w-4 mr-2" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDelete?.(template)}
								className="text-destructive"
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Category & Code */}
				<div className="flex items-center gap-2 flex-wrap">
					{template.category && (
						<Badge
							variant="secondary"
							className="text-xs"
						>
							<Tag className="h-3 w-3 mr-1" />
							{template.category}
						</Badge>
					)}
					{template.code && (
						<Badge
							variant="outline"
							className="text-xs font-mono"
						>
							{template.code}
						</Badge>
					)}
				</div>

				{/* Stats */}
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					{subtasksCount > 0 && (
						<div className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							<span>
								{subtasksCount} subtask{subtasksCount > 1 ? "s" : ""}
							</span>
						</div>
					)}
					{hasDefaultValues && (
						<div className="flex items-center gap-1">
							<span className="text-xs">✓ Default values</span>
						</div>
					)}
					<div className="flex items-center gap-1 ml-auto">
						<span className="text-xs">Used {template.usageCount}x</span>
					</div>
				</div>

				{/* Quick Action */}
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onClick={() => onInstantiate?.(template)}
				>
					<Copy className="h-4 w-4 mr-2" />
					Create Task from Template
				</Button>
			</CardContent>
		</Card>
	);
}
