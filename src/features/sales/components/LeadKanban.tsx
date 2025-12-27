"use client";

import React, { useState, useMemo } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Users, AlertCircle } from "lucide-react";
import { useLeads, useUpdateLead } from "../hooks/useLeads";
import { Lead, LeadStatus } from "../types/lead";
import { LeadCard } from "./LeadCard";

// Define the lead status columns and their display properties
const LEAD_STATUS_COLUMNS: Array<{
	status: LeadStatus;
	title: string;
	description: string;
	color: string;
	bgColor: string;
}> = [
	{
		status: LeadStatus.NEW,
		title: "New Leads",
		description: "Recently captured leads",
		color: "text-blue-600",
		bgColor: "bg-blue-50 dark:bg-blue-950/20",
	},
	{
		status: LeadStatus.CONTACTED,
		title: "Contacted",
		description: "Initial contact made",
		color: "text-purple-600",
		bgColor: "bg-purple-50 dark:bg-purple-950/20",
	},
	{
		status: LeadStatus.QUALIFIED,
		title: "Qualified",
		description: "Potential confirmed",
		color: "text-yellow-600",
		bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
	},
	{
		status: LeadStatus.PROPOSAL,
		title: "Proposal",
		description: "Quotation sent",
		color: "text-orange-600",
		bgColor: "bg-orange-50 dark:bg-orange-950/20",
	},
	{
		status: LeadStatus.NEGOTIATION,
		title: "Negotiation",
		description: "Terms discussion",
		color: "text-indigo-600",
		bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
	},
	{
		status: LeadStatus.WON,
		title: "Won",
		description: "Deal closed successfully",
		color: "text-green-600",
		bgColor: "bg-green-50 dark:bg-green-950/20",
	},
	{
		status: LeadStatus.LOST,
		title: "Lost",
		description: "Deal not successful",
		color: "text-red-600",
		bgColor: "bg-red-50 dark:bg-red-950/20",
	},
];

interface LeadKanbanProps {
	onLeadClick?: (lead: Lead) => void;
	onCreateLead?: (status?: LeadStatus) => void;
	className?: string;
}

/**
 * LeadKanban component for visual lead pipeline management with drag-and-drop
 * Requirements: 10.1, 10.2, 10.3, 10.4 - Display columns, cards, drag-and-drop, API updates
 */
export const LeadKanban: React.FC<LeadKanbanProps> = ({ onLeadClick, onCreateLead, className = "" }) => {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

	// Fetch leads data
	const { data: leadsResponse, isLoading, error } = useLeads();
	const updateLeadMutation = useUpdateLead();

	// Configure drag sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // 8px movement required to start drag
			},
		})
	);

	// Group leads by status
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
	}, [leadsResponse?.leads]);

	// Handle drag start
	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		setActiveId(active.id as string);

		// Find the dragged lead
		const leadId = parseInt(active.id as string);
		const lead = leadsResponse?.leads.find((l) => l.leadId === leadId);
		setDraggedLead(lead || null);
	};

	// Handle drag end
	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		setActiveId(null);
		setDraggedLead(null);

		if (!over) return;

		const leadId = parseInt(active.id as string);
		const newStatus = over.id as LeadStatus;

		// Find the lead being moved
		const lead = leadsResponse?.leads.find((l) => l.leadId === leadId);
		if (!lead || lead.status === newStatus) return;

		try {
			// Update lead status via API
			await updateLeadMutation.mutateAsync({
				id: leadId,
				payload: { status: newStatus },
			});
		} catch (error) {
			console.error("Failed to update lead status:", error);
			// Error handling would show a toast notification here
		}
	};

	// Handle drag over (for visual feedback)
	const handleDragOver = (event: DragOverEvent) => {
		// Could add visual feedback here if needed
	};

	// Loading state
	if (isLoading) {
		return (
			<div className={`space-y-4 ${className}`}>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
					{LEAD_STATUS_COLUMNS.map((column) => (
						<Card
							key={column.status}
							className="h-[600px]"
						>
							<CardHeader className="pb-3">
								<Skeleton className="h-6 w-24" />
								<Skeleton className="h-4 w-32" />
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{[1, 2, 3].map((i) => (
										<Skeleton
											key={i}
											className="h-20 w-full"
										/>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className={`flex items-center justify-center h-64 ${className}`}>
				<div className="text-center space-y-2">
					<AlertCircle className="h-8 w-8 text-destructive mx-auto" />
					<p className="text-sm text-muted-foreground">Failed to load leads</p>
				</div>
			</div>
		);
	}

	// Empty state
	if (!leadsResponse?.leads || leadsResponse.leads.length === 0) {
		return (
			<div className={`space-y-4 ${className}`}>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
					{LEAD_STATUS_COLUMNS.map((column) => (
						<Card
							key={column.status}
							className="h-[600px]"
						>
							<CardHeader className="pb-3">
								<CardTitle className={`text-sm ${column.color}`}>{column.title}</CardTitle>
								<p className="text-xs text-muted-foreground">{column.description}</p>
								<Badge
									variant="secondary"
									className="w-fit"
								>
									0 leads
								</Badge>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-center h-40 border-2 border-dashed border-muted rounded-lg">
									<div className="text-center space-y-2">
										<Users className="h-6 w-6 text-muted-foreground mx-auto" />
										<p className="text-xs text-muted-foreground">No leads yet</p>
										{onCreateLead && (
											<button
												onClick={() => onCreateLead(column.status)}
												className="text-xs text-primary hover:underline"
											>
												Add first lead
											</button>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-4 ${className}`}>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
					{LEAD_STATUS_COLUMNS.map((column) => {
						const columnLeads = leadsByStatus[column.status] || [];

						return (
							<Card
								key={column.status}
								className={`h-[600px] ${column.bgColor} border-l-4 ${column.color.replace("text-", "border-")}`}
							>
								<CardHeader className="pb-3">
									<CardTitle className={`text-sm ${column.color}`}>{column.title}</CardTitle>
									<p className="text-xs text-muted-foreground">{column.description}</p>
									<div className="flex items-center justify-between">
										<Badge
											variant="secondary"
											className="w-fit"
										>
											{columnLeads.length} {columnLeads.length === 1 ? "lead" : "leads"}
										</Badge>
										{onCreateLead && (
											<button
												onClick={() => onCreateLead(column.status)}
												className="p-1 hover:bg-background/50 rounded"
												title={`Add lead to ${column.title}`}
											>
												<Plus className="h-4 w-4 text-muted-foreground" />
											</button>
										)}
									</div>
								</CardHeader>
								<CardContent className="p-3">
									<ScrollArea className="h-[480px]">
										<SortableContext
											id={column.status}
											items={columnLeads.map((lead) => lead.leadId.toString())}
											strategy={verticalListSortingStrategy}
										>
											<div className="space-y-3">
												{columnLeads.map((lead) => (
													<LeadCard
														key={lead.leadId}
														lead={lead}
														onClick={() => onLeadClick?.(lead)}
														isDragging={activeId === lead.leadId.toString()}
													/>
												))}
											</div>
										</SortableContext>
									</ScrollArea>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Drag Overlay */}
				<DragOverlay>
					{draggedLead && (
						<LeadCard
							lead={draggedLead}
							isDragging={true}
							className="rotate-3 shadow-lg"
						/>
					)}
				</DragOverlay>
			</DndContext>
		</div>
	);
};
