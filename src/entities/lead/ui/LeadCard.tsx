"use client";

import { MoreHorizontal } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { LeadStatusBadge } from "@/shared/ui/StatusBadge";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";
import { LeadTemperatureLabels } from "../model/types";
import type { Lead } from "../model/types";

interface LeadCardProps {
	lead: Lead;
	onView?: (lead: Lead) => void;
	onEdit?: (lead: Lead) => void;
	onDelete?: (lead: Lead) => void;
	className?: string;
}

function fallback(value: string | null | undefined) {
	return value?.trim() || "Not set";
}

export function LeadCard({ lead, onView, onEdit, onDelete, className }: LeadCardProps) {
	const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (!onView) return;
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onView(lead);
		}
	};

	return (
		<article
			role={onView ? "button" : undefined}
			tabIndex={onView ? 0 : undefined}
			onClick={() => onView?.(lead)}
			onKeyDown={handleKeyDown}
			className={cn(
				"grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 text-sm transition-colors last:border-b-0 md:grid-cols-[minmax(180px,1.5fr)_minmax(140px,1fr)_90px_100px_90px_40px] md:items-center md:gap-3",
				onView && "cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className
			)}
		>
			<div className="min-w-0">
				<div className="truncate font-medium leading-5">{lead.name}</div>
				<div className="truncate text-xs text-muted-foreground">{lead.email}</div>
			</div>

			<div className="min-w-0">
				<div className="truncate leading-5">{fallback(lead.company)}</div>
				<div className="truncate text-xs text-muted-foreground">{fallback(lead.projectName)}</div>
			</div>

			<div className="flex min-w-0 items-center gap-2">
				<LeadStatusBadge status={lead.status} size="sm" className="shrink-0" />
			</div>

			<div className="hidden md:block">
				<Badge variant="outline" className="font-mono text-xs">
					{lead.leadTemperature ? LeadTemperatureLabels[lead.leadTemperature] : "—"}
				</Badge>
			</div>

			<div className="hidden text-xs tabular-nums text-muted-foreground md:block">
				{lead.expectedBudget ? formatCurrency(lead.expectedBudget) : "—"}
			</div>

			<div className="flex justify-end">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label={`Open actions for ${lead.name}`}
							onClick={(event) => event.stopPropagation()}
						>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
						{onView && <DropdownMenuItem onClick={() => onView(lead)}>View</DropdownMenuItem>}
						{onEdit && <DropdownMenuItem onClick={() => onEdit(lead)}>Edit</DropdownMenuItem>}
						{onDelete && (
							<DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(lead)}>
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</article>
	);
}
