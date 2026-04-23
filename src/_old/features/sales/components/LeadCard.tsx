"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/shared/ui/card";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { GripVertical, Mail, Building2, MapPin, Calendar } from "lucide-react";
import { Lead } from "../types/lead";
import { LeadStatusBadge } from "@/shared/ui/StatusBadge";
import { cn } from "@/shared/lib/utils";

interface LeadCardProps {
	lead: Lead;
	onClick?: () => void;
	isDragging?: boolean;
	className?: string;
}

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
						<LeadStatusBadge
							status={lead.status}
							size="sm"
						/>
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
