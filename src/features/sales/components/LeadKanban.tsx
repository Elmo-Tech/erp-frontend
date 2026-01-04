"use client";

import React, { useState, useMemo } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Users, AlertCircle } from "lucide-react";
import { useLeads, useUpdateLead } from "../hooks/useLeads";
import { Lead, LeadStatus } from "../types/lead";
import { LeadCard } from "./LeadCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LEAD_STATUS_COLUMNS: Array<{
	status: LeadStatus;
	title: string;
	color: string;
	borderColor: string;
	bgColor: string;
}> = [
	{
		status: LeadStatus.NEW,
		title: "New",
		color: "text-blue-600",
		borderColor: "border-l-blue-500",
		bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
	},
	{
		status: LeadStatus.CONTACTED,
		title: "Contacted",
		color: "text-purple-600",
		borderColor: "border-l-purple-500",
		bgColor: "bg-purple-50/50 dark:bg-purple-950/20",
	},
	{
		status: LeadStatus.QUALIFIED,
		title: "Qualified",
		color: "text-amber-600",
		borderColor: "border-l-amber-500",
		bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
	},
	{
		status: LeadStatus.PROPOSAL,
		title: "Proposal",
		color: "text-orange-600",
		borderColor: "border-l-orange-500",
		bgColor: "bg-orange-50/50 dark:bg-orange-950/20",
	},
	{
		status: LeadStatus.NEGOTIATION,
		title: "Negotiation",
		color: "text-indigo-600",
		borderColor: "border-l-indigo-500",
		bgColor: "bg-indigo-50/50 dark:bg-indigo-950/20",
	},
	{
		status: LeadStatus.WON,
		title: "Won",
		color: "text-green-600",
		borderColor: "border-l-green-500",
		bgColor: "bg-green-50/50 dark:bg-green-950/20",
	},
	{
		status: LeadStatus.LOST,
		title: "Lost",
		color: "text-red-600",
		borderColor: "border-l-red-500",
		bgColor: "bg-red-50/50 dark:bg-red-950/20",
	},
];

// Droppable Column Component
function DroppableColumn({ column, leads, activeId, onLeadClick, onCreateLead }: { column: (typeof LEAD_STATUS_COLUMNS)[0]; leads: Lead[]; activeId: string | null; onLeadClick?: (lead: Lead) => void; onCreateLead?: (status?: LeadStatus) => void }) {
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
								<div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted rounded-lg">
									<Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
									<p className="text-sm text-muted-foreground">No leads</p>
								</div>
							) : (
								leads.map((lead) => (
									<LeadCard
										key={lead.leadId}
										lead={lead}
										onClick={() => onLeadClick?.(lead)}
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

interface LeadKanbanProps {
	onLeadClick?: (lead: Lead) => void;
	onCreateLead?: (status?: LeadStatus) => void;
	className?: string;
}

export const LeadKanban: React.FC<LeadKanbanProps> = ({ onLeadClick, onCreateLead, className = "" }) => {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

	const { data: leadsResponse, isLoading, error } = useLeads();
	const updateLeadMutation = useUpdateLead();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	);

	const leadsByStatus = useMemo(() => {
		const grouped: Record<LeadStatus, Lead[]> = {
			[LeadStatus.NEW]: [],
			[LeadStatus.CONTACTED]: [],
			[LeadStatus.QUALIFIED]: [],
			[LeadStatus.PROPOSAL]: [],
			[LeadStatus.NEGOTIATION]: [],
			[LeadStatus.WON]: [],
			[LeadStatus.LOST]: [],
		};

		if (!leadsResponse?.leads) return grouped;

		leadsResponse.leads.forEach((lead) => {
			if (grouped[lead.status]) {
				grouped[lead.status].push(lead);
			}
		});

		return grouped;
	}, [leadsResponse]);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		setActiveId(active.id as string);
		const leadId = parseInt(active.id as string);
		const lead = leadsResponse?.leads.find((l) => l.leadId === leadId);
		setDraggedLead(lead || null);
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);
		setDraggedLead(null);

		if (!over) return;

		const leadId = parseInt(active.id as string);

		// Get the target status - could be a column or another lead
		let newStatus: LeadStatus | null = null;

		// Check if dropped on a column
		if (Object.values(LeadStatus).includes(over.id as LeadStatus)) {
			newStatus = over.id as LeadStatus;
		} else {
			// Dropped on another lead - find which column that lead is in
			const targetLeadId = parseInt(over.id as string);
			const targetLead = leadsResponse?.leads.find((l) => l.leadId === targetLeadId);
			if (targetLead) {
				newStatus = targetLead.status;
			}
		}

		if (!newStatus) return;

		const lead = leadsResponse?.leads.find((l) => l.leadId === leadId);
		if (!lead || lead.status === newStatus) return;

		try {
			await updateLeadMutation.mutateAsync({
				id: leadId,
				payload: { status: newStatus },
			});
			toast.success(`Lead moved to ${newStatus}`);
		} catch (error) {
			console.error("Failed to update lead status:", error);
			toast.error("Failed to update lead status");
		}
	};

	if (isLoading) {
		return (
			<div className={cn("overflow-x-auto pb-4", className)}>
				<div className="flex gap-4 min-w-max">
					{LEAD_STATUS_COLUMNS.map((column) => (
						<Card
							key={column.status}
							className="w-[300px] shrink-0"
						>
							<CardHeader className="pb-3">
								<Skeleton className="h-5 w-20" />
								<Skeleton className="h-4 w-12" />
							</CardHeader>
							<CardContent className="space-y-3">
								{[1, 2, 3].map((i) => (
									<Skeleton
										key={i}
										className="h-32 w-full"
									/>
								))}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={cn("flex items-center justify-center h-64", className)}>
				<div className="text-center space-y-2">
					<AlertCircle className="h-8 w-8 text-destructive mx-auto" />
					<p className="text-sm text-muted-foreground">Failed to load leads</p>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("overflow-x-auto pb-4", className)}>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="flex gap-4 min-w-max">
					{LEAD_STATUS_COLUMNS.map((column) => (
						<DroppableColumn
							key={column.status}
							column={column}
							leads={leadsByStatus[column.status] || []}
							activeId={activeId}
							onLeadClick={onLeadClick}
							onCreateLead={onCreateLead}
						/>
					))}
				</div>

				<DragOverlay>
					{draggedLead && (
						<div className="w-[280px]">
							<LeadCard
								lead={draggedLead}
								isDragging={true}
								className="rotate-3 shadow-2xl"
							/>
						</div>
					)}
				</DragOverlay>
			</DndContext>
		</div>
	);
};
