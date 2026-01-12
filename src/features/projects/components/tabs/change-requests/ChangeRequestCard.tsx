/**
 * Change Request Card Component
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChangeRequest, ChangeRequestStatusLabels, ChangeRequestStatusColors } from "../../../types/changeRequest";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChangeRequestCardProps {
	cr: ChangeRequest;
	onClick: () => void;
}

export function ChangeRequestCard({ cr, onClick }: ChangeRequestCardProps) {
	return (
		<Card
			className="hover:shadow-md transition-shadow cursor-pointer"
			onClick={onClick}
		>
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm text-muted-foreground">{cr.crNumber}</span>
							<Badge className={cn("text-xs", ChangeRequestStatusColors[cr.status])}>{ChangeRequestStatusLabels[cr.status]}</Badge>
							{cr.isBillable && <Badge variant="outline">Billable</Badge>}
						</div>
						<h4 className="font-medium">{cr.title}</h4>
						<p className="text-sm text-muted-foreground line-clamp-1">{cr.description}</p>
					</div>
					<div className="text-right text-sm">
						<p className="font-medium">${cr.estimatedCost}</p>
						<p className="text-muted-foreground">{cr.estimatedHours}h estimated</p>
					</div>
				</div>
				<div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
					<span>By {cr.requester?.name || "Unknown"}</span>
					<span>{format(new Date(cr.createdAt), "MMM d, yyyy")}</span>
				</div>
			</CardContent>
		</Card>
	);
}
