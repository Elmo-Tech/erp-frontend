"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useLeads, useUpdateLead } from "../hooks/useLeads";
import { useConvertLead } from "../hooks/useLeadConversion";
import { Lead, LeadStatus } from "../types/lead";
import { LeadCard } from "./LeadCard";
import { KanbanColumn, LEAD_STATUS_COLUMNS } from "./leads/kanban";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

interface LeadKanbanProps {
	onCreateLead?: (status?: LeadStatus) => void;
	className?: string;
}

export const LeadKanban: React.FC<LeadKanbanProps> = ({ onCreateLead, className = "" }) => {
	const router = useRouter();
	const [activeId, setActiveId] = useState<string | null>(null);
	const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

	const { data: leadsResponse, isLoading, error } = useLeads();
	const updateLeadMutation = useUpdateLead();
	const convertLeadMutation = useConvertLead();

	const { canCreateLeads, canEditLeads } = usePermissions();

	const handleLeadClick = (lead: Lead) => {
		router.push(`/dashboard/sales/leads/${lead.leadId}`);
	};

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
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
		let newStatus: LeadStatus | null = null;

		if (Object.values(LeadStatus).includes(over.id as LeadStatus)) {
			newStatus = over.id as LeadStatus;
		} else {
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

			if (newStatus === LeadStatus.WON && !lead.isConverted) {
				try {
					const result = await convertLeadMutation.mutateAsync({ leadId });
					toast.success(result.message || "Lead converted to client successfully");
				} catch {
					toast.error("Lead status updated but failed to convert to client.");
				}
			}
		} catch {
			toast.error("Failed to update lead status");
		}
	};

	if (isLoading) {
		return <KanbanSkeleton className={className} />;
	}

	if (error) {
		return <KanbanError className={className} />;
	}

	return (
		<div className={cn("overflow-x-auto pb-4", className)}>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={canEditLeads ? handleDragStart : undefined}
				onDragEnd={canEditLeads ? handleDragEnd : undefined}
			>
				<div className="flex gap-4 min-w-max">
					{LEAD_STATUS_COLUMNS.map((column) => (
						<KanbanColumn
							key={column.status}
							column={column}
							leads={leadsByStatus[column.status] || []}
							activeId={activeId}
							onLeadClick={handleLeadClick}
							onCreateLead={canCreateLeads ? onCreateLead : undefined}
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

function KanbanSkeleton({ className }: { className?: string }) {
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

function KanbanError({ className }: { className?: string }) {
	return (
		<div className={cn("flex items-center justify-center h-64", className)}>
			<div className="text-center space-y-2">
				<AlertCircle className="h-8 w-8 text-destructive mx-auto" />
				<p className="text-sm text-muted-foreground">Failed to load leads</p>
			</div>
		</div>
	);
}
