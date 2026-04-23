"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Plus, Users } from "lucide-react";
import { Lead, LeadStatus } from "../../../types/lead";
import { LeadCard } from "../../LeadCard";
import { KanbanColumn as KanbanColumnType } from "./kanbanConfig";
import { cn } from "@/shared/lib/utils";

interface KanbanColumnProps {
	column: KanbanColumnType;
	leads: Lead[];
	activeId: string | null;
	onLeadClick: (lead: Lead) => void;
	onCreateLead?: (status?: LeadStatus) => void;
}

export function KanbanColumn({ column, leads, activeId, onLeadClick, onCreateLead }: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: column.status,
	});

	return (
		<Card
			ref={setNodeRef}
			className={cn("w-[300px] shrink-0 border-l-4 transition-all", column.borderColor, column.bgColor, isOver && "ring-2 ring-primary ring-offset-2")}
		>
			<CardHeader className="pb-3 space-y-2">
				<div className="flex items-center justify-between">
					<CardTitle className={cn("text-base font-semibold", column.color)}>{column.title}</CardTitle>
					<Badge
						variant="secondary"
						className="font-medium"
					>
						{leads.length}
					</Badge>
				</div>
				{onCreateLead && (
					<Button
						variant="ghost"
						size="sm"
						className="w-full justify-start text-muted-foreground hover:text-foreground"
						onClick={() => onCreateLead(column.status)}
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Lead
					</Button>
				)}
			</CardHeader>
			<CardContent className="px-3 pb-3">
				<ScrollArea className="h-[500px] pr-2">
					<SortableContext
						id={column.status}
						items={leads.map((lead) => lead.leadId.toString())}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-3">
							{leads.length === 0 ? (
								<EmptyColumn />
							) : (
								leads.map((lead) => (
									<LeadCard
										key={lead.leadId}
										lead={lead}
										onClick={() => onLeadClick(lead)}
										isDragging={activeId === lead.leadId.toString()}
									/>
								))
							)}
						</div>
					</SortableContext>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

function EmptyColumn() {
	return (
		<div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted rounded-lg">
			<Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
			<p className="text-sm text-muted-foreground">No leads</p>
		</div>
	);
}
