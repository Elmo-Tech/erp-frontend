"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { StatusBadge, getStatusVariant } from "@/shared/ui";
import { usePipelineHealth } from "../../hooks/useSalesDashboard";
import { Loader2, TrendingUp, TrendingDown, Users, FileText, Receipt } from "lucide-react";
import type { PipelineHealth } from "../../types/dashboard";

interface StatCardProps {
	title: string;
	value: number | string;
	icon: React.ReactNode;
	subtitle?: string;
	trend?: { value: number; isPositive: boolean };
}

function StatCard({ title, value, icon, subtitle, trend }: StatCardProps) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">{title}</p>
						<p className="text-2xl font-bold">{value}</p>
						{subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
					</div>
					<div className="flex flex-col items-end gap-1">
						<div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
						{trend && (
							<div className={`flex items-center text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
								{trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
								{trend.value}%
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

interface StatusBreakdownProps {
	title: string;
	data: Record<string, number>;
	total: number;
}

function StatusBreakdown({ title, data, total }: StatusBreakdownProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{Object.entries(data).map(([status, count]) => {
					const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
					return (
						<div
							key={status}
							className="space-y-1"
						>
							<div className="flex items-center justify-between text-sm">
								<StatusBadge
									label={status.replace(/_/g, " ")}
									variant={getStatusVariant(status)}
								/>
								<span className="text-muted-foreground">
									{count} ({percentage}%)
								</span>
							</div>
							<Progress
								value={percentage}
								className="h-1.5"
							/>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}

export function PipelineOverview() {
	const { data, isLoading, error } = usePipelineHealth();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error || !data?.data) {
		return (
			<Card>
				<CardContent className="p-6 text-center text-muted-foreground">Failed to load pipeline data</CardContent>
			</Card>
		);
	}

	const pipeline: PipelineHealth = data.data;

	return (
		<div className="space-y-6">
			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					title="Active Leads"
					value={pipeline.leads.total}
					icon={<Users className="h-5 w-5 text-primary" />}
					trend={{ value: pipeline.conversionRate, isPositive: pipeline.conversionRate > 20 }}
				/>
				<StatCard
					title="Open Proposals"
					value={pipeline.proposals.total}
					icon={<FileText className="h-5 w-5 text-primary" />}
				/>
				<StatCard
					title="Pending Quotations"
					value={pipeline.quotations.total}
					icon={<Receipt className="h-5 w-5 text-primary" />}
					subtitle={`$${pipeline.quotations.totalPendingValue.toLocaleString()}`}
				/>
				<StatCard
					title="Conversion Rate"
					value={`${pipeline.conversionRate}%`}
					icon={<TrendingUp className="h-5 w-5 text-primary" />}
					subtitle={`Loss: ${pipeline.lossRate}%`}
					trend={{ value: pipeline.conversionRate, isPositive: pipeline.conversionRate > 15 }}
				/>
			</div>

			{/* Status Breakdowns */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<StatusBreakdown
					title="Leads by Status"
					data={pipeline.leads.byStatus}
					total={pipeline.leads.total}
				/>
				<StatusBreakdown
					title="Proposals by Status"
					data={pipeline.proposals.byStatus}
					total={pipeline.proposals.total}
				/>
				<StatusBreakdown
					title="Quotations by Status"
					data={Object.fromEntries(Object.entries(pipeline.quotations.byStatus).map(([k, v]) => [k, v.count]))}
					total={pipeline.quotations.total}
				/>
			</div>
		</div>
	);
}
