"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column } from "@/components/shared/data-display/DataTable";
import type { PerformanceEvaluation, EvaluationStatus, BonusTier } from "../../types";
import { MoreHorizontal, Eye, CheckCircle, Calculator } from "lucide-react";

interface EvaluationsColumnsOptions {
	onView: (evaluation: PerformanceEvaluation) => void;
	onCalculate?: (evaluation: PerformanceEvaluation) => void;
	onApprove?: (evaluation: PerformanceEvaluation) => void;
}

const statusColors: Record<EvaluationStatus, string> = {
	pending: "secondary",
	in_progress: "default",
	completed: "outline",
	approved: "default",
};

const statusLabels: Record<EvaluationStatus, string> = {
	pending: "Pending",
	in_progress: "In Progress",
	completed: "Completed",
	approved: "Approved",
};

const tierColors: Record<BonusTier, string> = {
	excellent: "bg-green-500 text-white",
	good: "bg-blue-500 text-white",
	average: "bg-yellow-500 text-white",
	poor: "bg-red-500 text-white",
};

const tierLabels: Record<BonusTier, string> = {
	excellent: "Excellent",
	good: "Good",
	average: "Average",
	poor: "Poor",
};

export function getEvaluationsColumns({ onView, onCalculate, onApprove }: EvaluationsColumnsOptions): Column<PerformanceEvaluation>[] {
	return [
		{
			key: "userName",
			header: "Employee",
			render: (evaluation) => <span className="font-medium">{evaluation.userName}</span>,
		},
		{
			key: "periodName",
			header: "Period",
			render: (evaluation) => evaluation.periodName,
		},
		{
			key: "totalScore",
			header: "Score",
			render: (evaluation) => <span className="font-medium">{evaluation.totalScore.toFixed(1)}/100</span>,
		},
		{
			key: "bonusTier",
			header: "Tier",
			render: (evaluation) => (evaluation.bonusTier ? <Badge className={tierColors[evaluation.bonusTier]}>{tierLabels[evaluation.bonusTier]}</Badge> : <span className="text-muted-foreground">-</span>),
		},
		{
			key: "bonusAmount",
			header: "Bonus",
			render: (evaluation) => <span className="font-medium text-green-600">${evaluation.bonusAmount.toLocaleString()}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (evaluation) => <Badge variant={statusColors[evaluation.status] as "default" | "secondary" | "outline"}>{statusLabels[evaluation.status]}</Badge>,
		},
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (evaluation) => (
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
						<DropdownMenuItem onClick={() => onView(evaluation)}>
							<Eye className="h-4 w-4 mr-2" />
							View Details
						</DropdownMenuItem>
						{onCalculate && evaluation.status !== "approved" && (
							<DropdownMenuItem onClick={() => onCalculate(evaluation)}>
								<Calculator className="h-4 w-4 mr-2" />
								Calculate Score
							</DropdownMenuItem>
						)}
						{onApprove && evaluation.status === "completed" && (
							<DropdownMenuItem onClick={() => onApprove(evaluation)}>
								<CheckCircle className="h-4 w-4 mr-2" />
								Approve
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}
