"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column } from "@/components/shared/data-display/DataTable";
import { StatusBadge, getStatusVariant, getImpactVariant, getCategoryVariant } from "@/components/shared";
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
			render: (log) => (
				<StatusBadge
					label={categoryLabels[log.category]}
					variant={getCategoryVariant(log.category)}
				/>
			),
		},
		{
			key: "impactLevel",
			header: "Impact",
			render: (log) => (
				<StatusBadge
					label={impactLabels[log.impactLevel]}
					variant={getImpactVariant(log.impactLevel)}
				/>
			),
		},
		{
			key: "timeSavedMinutes",
			header: "Time Saved",
			render: (log) => (log.timeSavedMinutes ? `${log.timeSavedMinutes} min` : "-"),
		},
		{
			key: "isVerified",
			header: "Status",
			render: (log) => (
				<StatusBadge
					label={log.isVerified ? "Verified" : "Pending"}
					variant={getStatusVariant(log.isVerified ? "verified" : "pending")}
				/>
			),
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
