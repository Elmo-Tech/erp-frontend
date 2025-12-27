"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Building2, Mail, User, GripVertical, Calendar, MoreHorizontal, Phone, MapPin } from "lucide-react";
import { Lead, LeadStatus } from "../types/lead";
import { cn } from "@/lib/utils";

interface LeadCardProps {
	lead: Lead;
	onClick?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	isDragging?: boolean;
	className?: string;
	showActions?: boolean;
	compact?: boolean;
}

// Status color mapping
const STATUS_COLORS: Record<LeadStatus, string> = {
	[LeadStatus.NEW]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
	[LeadStatus.CONTACTED]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
	[LeadStatus.QUALIFIED]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
	[LeadStatus.PROPOSAL]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
	[LeadStatus.NEGOTIATION]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
	[LeadStatus.WON]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
	[LeadStatus.LOST]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

/**
 * LeadCard component for displaying lead information in kanban board
 * Requirements: 10.2 - Display lead name, company, email and make draggable for kanban
 */
export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, onEdit, onDelete, isDragging = false, className = "", showActions = false, compact = false }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging: isSortableDragging,
	} = useSortable({
		id: lead.leadId.toString(),
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	// Generate initials for avatar
	const getInitials = (name: string): string => {
		return name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	// Format date for display
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	// Get status display text
	const getStatusText = (status: LeadStatus): string => {
		return status.charAt(0).toUpperCase() + status.slice(1);
	};

	const cardContent = (
		<CardContent className={cn("p-3", compact && "p-2")}>
			<div className="space-y-3">
				{/* Header with avatar and drag handle */}
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2 flex-1 min-w-0">
						<Avatar className={cn("h-8 w-8", compact && "h-6 w-6")}>
							<AvatarFallback className="text-xs font-medium">{getInitials(lead.name)}</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<h4 className={cn("font-medium text-sm truncate", compact && "text-xs")}>{lead.name}</h4>
							{lead.company && <p className={cn("text-xs text-muted-foreground truncate", compact && "text-[10px]")}>{lead.company}</p>}
						</div>
					</div>

					{/* Drag handle */}
					<div
						{...attributes}
						{...listeners}
						className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded opacity-50 hover:opacity-100 transition-opacity"
					>
						<GripVertical className="h-3 w-3" />
					</div>
				</div>

				{/* Contact Information */}
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Mail className="h-3 w-3 shrink-0" />
						<span className="truncate">{lead.email}</span>
					</div>

					{lead.source && (
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<MapPin className="h-3 w-3 shrink-0" />
							<span className="truncate">{lead.source}</span>
						</div>
					)}
				</div>

				{/* Status and Date */}
				<div className="flex items-center justify-between">
					<Badge
						variant="secondary"
						className={cn("text-xs px-2 py-0.5", STATUS_COLORS[lead.status], compact && "text-[10px] px-1.5 py-0")}
					>
						{getStatusText(lead.status)}
					</Badge>

					<div className="flex items-center gap-1 text-xs text-muted-foreground">
						<Calendar className="h-3 w-3" />
						<span>{formatDate(lead.createdAt)}</span>
					</div>
				</div>

				{/* Actions (if enabled) */}
				{showActions && (
					<div className="flex items-center justify-end pt-1 border-t">
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={(e) => {
								e.stopPropagation();
								// Actions menu would go here
							}}
						>
							<MoreHorizontal className="h-3 w-3" />
						</Button>
					</div>
				)}
			</div>
		</CardContent>
	);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn("transition-all duration-200", (isDragging || isSortableDragging) && "opacity-50 rotate-2 scale-105", className)}
		>
			<Card
				className={cn("cursor-pointer hover:shadow-md transition-all duration-200 border-l-2", "hover:border-l-primary hover:bg-accent/50", (isDragging || isSortableDragging) && "shadow-lg border-primary", compact && "shadow-sm")}
				onClick={onClick}
			>
				{cardContent}
			</Card>
		</div>
	);
};

// Compact version for smaller spaces
export const CompactLeadCard: React.FC<Omit<LeadCardProps, "compact">> = (props) => {
	return (
		<LeadCard
			{...props}
			compact={true}
		/>
	);
};
