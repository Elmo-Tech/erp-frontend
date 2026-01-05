"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column } from "@/components/shared/data-display/DataTable";
import type { InnovationLog, InnovationCategory, ImpactLevel } from "../../types";
import { MoreHorizontal, Eye, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface InnovationLogsColumnsOptions {
	onView: (log: InnovationLog) => void;
	onVerify?: (log: InnovationLog) => void;
	onReject?: (log: InnovationLog) => void;
	onDelete?: (log: InnovationLog) => void;
}

const categoryLabels: Record<InnovationCategory, string> = {
	ai_tool: "AI Tool",
	automation: "Automation",
	new_tech: "New Technology",
	process_improvement: "Process Improvement",
};

const categoryColors: Record<InnovationCategory, string> = {
	ai_tool: "bg-purple-500 text-white",
	automation: "bg-blue-500 text-white",
	new_tech: "bg-green-500 text-white",
	process_improvement: "bg-orange-500 text-white",
};

const impactColors: Record<ImpactLevel, "default" | "secondary" | "outline"> = {
	low: "secondary",
	medium: "outline",
	high: "default",
};

const impactLabels: Record<ImpactLevel, string> = {
	low: "Low",
	medium: "Medium",
	high: "High",
};

export function getInnovationLogsColumns({ onView, onVerify, onReject, onDelete }: InnovationLogsColumnsOptions): Column<InnovationLog>[] {
	return [
		{
			key: "toolName",
			header: "Tool/Technology",
			render: (log) => <span className="font-medium">{log.toolName}</span>,
		},
		{
			key: "userName",
			header: "Employee",
			render: (log) => log.userName,
		},
		{
			key: "category",
			header: "Category",
			render: (log) => <Badge className={categoryColors[log.category]}>{categoryLabels[log.category]}</Badge>,
		},
		{
			key: "impactLevel",
			header: "Impact",
			render: (log) => <Badge variant={impactColors[log.impactLevel]}>{impactLabels[log.impactLevel]}</Badge>,
		},
		{
			key: "timeSavedMinutes",
			header: "Time Saved",
			render: (log) => (log.timeSavedMinutes ? `${log.timeSavedMinutes} min` : "-"),
		},
		{
			key: "isVerified",
			header: "Status",
			render: (log) => <Badge variant={log.isVerified ? "default" : "secondary"}>{log.isVerified ? "Verified" : "Pending"}</Badge>,
		},
		{
			key: "createdAt",
			header: "Date",
			render: (log) => new Date(log.createdAt).toLocaleDateString(),
		},
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (log) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={(e) => e.stopPropagation()}
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onView(log)}>
							<Eye className="h-4 w-4 mr-2" />
							View Details
						</DropdownMenuItem>
						{onVerify && !log.isVerified && (
							<DropdownMenuItem onClick={() => onVerify(log)}>
								<CheckCircle className="h-4 w-4 mr-2" />
								Verify
							</DropdownMenuItem>
						)}
						{onReject && !log.isVerified && (
							<DropdownMenuItem onClick={() => onReject(log)}>
								<XCircle className="h-4 w-4 mr-2" />
								Reject
							</DropdownMenuItem>
						)}
						{onDelete && !log.isVerified && (
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => onDelete(log)}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}
