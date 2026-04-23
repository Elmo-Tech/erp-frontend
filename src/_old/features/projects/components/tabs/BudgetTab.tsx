"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { useProject } from "../../hooks/useProjects";
import { useChangeRequestSummary } from "../../hooks/useChangeRequests";
import { DollarSign, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, FileEdit, Calculator } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface BudgetTabProps {
	projectId: number;
}

export function BudgetTab({ projectId }: BudgetTabProps) {
	const { data: project, isLoading: projectLoading } = useProject(projectId);
	const { data: crSummary, isLoading: crLoading } = useChangeRequestSummary(projectId);

	if (projectLoading || crLoading) {
		return (
			<div className="space-y-4">
				<div className="grid gap-4 md:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton
							key={i}
							className="h-32"
						/>
					))}
				</div>
				<Skeleton className="h-64" />
			</div>
		);
	}

	if (!project) return null;

	// Calculate budget metrics
	const originalBudget = Number(project.budget) || 0;
	const approvedCRCost = crSummary?.totalApprovedCost || 0;
	const totalBudget = originalBudget + approvedCRCost;

	// Calculate cost based on time spent (assuming average hourly rate)
	const totalMinutes = project.totalTimeSpent || 0;
	const totalHours = totalMinutes / 60;
	const averageHourlyRate = 50; // This should come from project settings or be calculated
	const estimatedCost = totalHours * averageHourlyRate;

	const remainingBudget = totalBudget - estimatedCost;
	const budgetUsedPercent = totalBudget > 0 ? (estimatedCost / totalBudget) * 100 : 0;
	const isOverBudget = remainingBudget < 0;
	const isNearBudget = budgetUsedPercent > 80 && !isOverBudget;

	// Progress metrics
	const progressPercent = project.progress || 0;
	const budgetEfficiency = progressPercent > 0 ? budgetUsedPercent / progressPercent : 0;

	return (
		<div className="space-y-6">
			{/* Budget Overview Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
							<DollarSign className="h-4 w-4" />
							Original Budget
						</div>
						<p className="text-2xl font-bold">${originalBudget.toLocaleString()}</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
							<FileEdit className="h-4 w-4" />
							CR Additions
						</div>
						<p className="text-2xl font-bold text-blue-600">+${approvedCRCost.toLocaleString()}</p>
						<p className="text-xs text-muted-foreground">{crSummary?.approved || 0} approved CRs</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
							<Calculator className="h-4 w-4" />
							Total Budget
						</div>
						<p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
					</CardContent>
				</Card>

				<Card className={cn(isOverBudget && "border-red-200 bg-red-50", isNearBudget && "border-yellow-200 bg-yellow-50")}>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2 text-sm mb-2">
							{isOverBudget ? <AlertTriangle className="h-4 w-4 text-red-600" /> : isNearBudget ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
							<span className={cn("text-muted-foreground", isOverBudget && "text-red-600", isNearBudget && "text-yellow-600")}>Remaining</span>
						</div>
						<p className={cn("text-2xl font-bold", isOverBudget ? "text-red-600" : isNearBudget ? "text-yellow-600" : "text-green-600")}>${Math.abs(remainingBudget).toLocaleString()}</p>
						{isOverBudget && <Badge variant="destructive">Over Budget</Badge>}
					</CardContent>
				</Card>
			</div>

			{/* Budget Progress */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Budget Utilization</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<div className="flex justify-between text-sm mb-2">
							<span>Budget Used</span>
							<span className={cn(isOverBudget ? "text-red-600" : isNearBudget ? "text-yellow-600" : "")}>{budgetUsedPercent.toFixed(1)}%</span>
						</div>
						<Progress
							value={Math.min(budgetUsedPercent, 100)}
							className={cn("h-3", isOverBudget && "[&>div]:bg-red-500", isNearBudget && "[&>div]:bg-yellow-500")}
						/>
						<div className="flex justify-between text-xs text-muted-foreground mt-1">
							<span>${estimatedCost.toLocaleString()} spent</span>
							<span>${totalBudget.toLocaleString()} total</span>
						</div>
					</div>

					<div>
						<div className="flex justify-between text-sm mb-2">
							<span>Project Progress</span>
							<span>{progressPercent.toFixed(1)}%</span>
						</div>
						<Progress
							value={progressPercent}
							className="h-3"
						/>
					</div>

					{/* Efficiency Indicator */}
					<div className="p-4 bg-muted/50 rounded-lg">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{budgetEfficiency <= 1 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
								<span className="font-medium">Budget Efficiency</span>
							</div>
							<Badge variant={budgetEfficiency <= 1 ? "default" : "destructive"}>{budgetEfficiency <= 1 ? "On Track" : "Behind"}</Badge>
						</div>
						<p className="text-sm text-muted-foreground mt-2">
							{budgetEfficiency <= 1 ? `You're using ${(budgetEfficiency * 100).toFixed(0)}% of budget per 1% progress - efficient!` : `You're using ${(budgetEfficiency * 100).toFixed(0)}% of budget per 1% progress - needs attention`}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Time & Cost Breakdown */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Clock className="h-5 w-5" />
							Time Tracking
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Total Time Spent</span>
							<span className="font-medium">
								{Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}m
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Estimated Cost</span>
							<span className="font-medium">${estimatedCost.toLocaleString()}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Avg. Hourly Rate</span>
							<span className="font-medium">${averageHourlyRate}/hr</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<FileEdit className="h-5 w-5" />
							Change Requests Impact
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Total CRs</span>
							<span className="font-medium">{crSummary?.total || 0}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Pending Approval</span>
							<span className="font-medium text-yellow-600">{crSummary?.pending || 0}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Additional Days</span>
							<span className="font-medium">{crSummary?.totalAdditionalDays || 0} days</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Budget Increase</span>
							<span className="font-medium text-blue-600">+{totalBudget > 0 ? ((approvedCRCost / originalBudget) * 100).toFixed(1) : 0}%</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
