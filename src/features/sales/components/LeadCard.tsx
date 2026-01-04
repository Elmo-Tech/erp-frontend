"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GripVertical, Mail, Building2, MapPin, Calendar } from "lucide-react";
import { Lead, LeadStatus } from "../types/lead";
import { cn } from "@/lib/utils";

interface LeadCardProps {
	lead: Lead;
	onClick?: () => void;
	isDragging?: boolean;
	className?: string;
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

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, isDragging = false, className = "" }) => {
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

	const getInitials = (name: string): string => {
		return name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn("transition-all duration-200", (isDragging || isSortableDragging) && "opacity-50 rotate-2 scale-105", className)}
		>
			<Card
				className={cn("cursor-pointer hover:shadow-md transition-all duration-200", "hover:border-primary/50 hover:bg-accent/30", (isDragging || isSortableDragging) && "shadow-lg border-primary")}
				onClick={onClick}
			>
				<CardContent className="p-4">
					{/* Header: Avatar, Name, Drag Handle */}
					<div className="flex items-start gap-3 mb-3">
						<Avatar className="h-10 w-10 shrink-0">
							<AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">{getInitials(lead.name)}</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<h4 className="font-semibold text-sm leading-tight truncate">{lead.name}</h4>
							{lead.company && (
								<div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
									<Building2 className="h-3.5 w-3.5 shrink-0" />
									<span className="text-xs truncate">{lead.company}</span>
								</div>
							)}
						</div>
						<div
							{...attributes}
							{...listeners}
							className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded-md opacity-40 hover:opacity-100 transition-opacity shrink-0"
						>
							<GripVertical className="h-4 w-4" />
						</div>
					</div>

					{/* Contact Info */}
					<div className="space-y-2 mb-3">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Mail className="h-3.5 w-3.5 shrink-0" />
							<span className="text-xs truncate">{lead.email}</span>
						</div>
						{lead.source && (
							<div className="flex items-center gap-2 text-muted-foreground">
								<MapPin className="h-3.5 w-3.5 shrink-0" />
								<span className="text-xs truncate capitalize">{lead.source.replace("_", " ")}</span>
							</div>
						)}
					</div>

					{/* Footer: Status & Date */}
					<div className="flex items-center justify-between pt-2 border-t">
						<Badge
							variant="secondary"
							className={cn("text-xs font-medium", STATUS_COLORS[lead.status])}
						>
							{lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
						</Badge>
						<div className="flex items-center gap-1.5 text-muted-foreground">
							<Calendar className="h-3.5 w-3.5" />
							<span className="text-xs">{formatDate(lead.createdAt)}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

// Compact version for smaller spaces
export const CompactLeadCard: React.FC<LeadCardProps> = (props) => {
	return <LeadCard {...props} />;
};
