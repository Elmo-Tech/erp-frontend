"use client";

import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Column } from "@/shared/ui/data-display/DataTable";
import { StatusBadge, getStatusVariant } from "@/shared/ui";
import type { EvaluationPeriod, PeriodStatus } from "../../types";
import { MoreHorizontal, Eye, Play, DollarSign } from "lucide-react";

interface EvaluationPeriodsColumnsOptions {
	onView: (period: EvaluationPeriod) => void;
	onActivate?: (period: EvaluationPeriod) => void;
	onViewBonuses?: (period: EvaluationPeriod) => void;
}

const statusLabels: Record<PeriodStatus, string> = {
	draft: "Draft",
	active: "Active",
	completed: "Completed",
};

export function getEvaluationPeriodsColumns({ onView, onActivate, onViewBonuses }: EvaluationPeriodsColumnsOptions): Column<EvaluationPeriod>[] {
	return [
		{
			key: "name",
			header: "Period Name",
			render: (period) => <span className="font-medium">{period.name}</span>,
		},
		{
			key: "startDate",
			header: "Start Date",
			render: (period) => new Date(period.startDate).toLocaleDateString(),
		},
		{
			key: "endDate",
			header: "End Date",
			render: (period) => new Date(period.endDate).toLocaleDateString(),
		},
		{
			key: "status",
			header: "Status",
			render: (period) => (
				<StatusBadge
					label={statusLabels[period.status]}
					variant={getStatusVariant(period.status)}
				/>
			),
		},
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (period) => (
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
						<DropdownMenuItem onClick={() => onView(period)}>
							<Eye className="h-4 w-4 mr-2" />
							View Evaluations
						</DropdownMenuItem>
						{onActivate && period.status === "draft" && (
							<DropdownMenuItem onClick={() => onActivate(period)}>
								<Play className="h-4 w-4 mr-2" />
								Activate Period
							</DropdownMenuItem>
						)}
						{onViewBonuses && period.status === "completed" && (
							<DropdownMenuItem onClick={() => onViewBonuses(period)}>
								<DollarSign className="h-4 w-4 mr-2" />
								View Bonuses
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}
