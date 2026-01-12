"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBottleneckAnalysis } from "../../hooks/useSalesDashboard";
import { AlertTriangle, TrendingDown, Loader2, BarChart3 } from "lucide-react";
import type { StageMetric, ReasonCount } from "../../types/dashboard";

interface StageChartProps {
	stages: StageMetric[];
}

function StageChart({ stages }: StageChartProps) {
	const maxCount = Math.max(...stages.map((s) => s.count), 1);

	return (
		<div className="space-y-3">
			{stages.map((stage) => {
				const percentage = (stage.count / maxCount) * 100;
				return (
					<div
						key={stage.status}
						className="space-y-1"
					>
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">{stage.stage}</span>
							<Badge variant="secondary">{stage.count}</Badge>
						</div>
						<Progress
							value={percentage}
							className="h-2"
						/>
					</div>
				);
			})}
		</div>
	);
}

interface ReasonsListProps {
	title: string;
	reasons: ReasonCount[];
	emptyMessage: string;
}

function ReasonsList({ title, reasons, emptyMessage }: ReasonsListProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium flex items-center gap-2">
					<TrendingDown className="h-4 w-4 text-red-500" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{reasons.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
				) : (
					<div className="space-y-2">
						{reasons.map((reason, index) => (
							<div
								key={index}
								className="flex items-center justify-between text-sm"
							>
								<span className="text-muted-foreground truncate flex-1 mr-2">{reason.reason || "Not specified"}</span>
								<Badge
									variant="outline"
									className="flex-shrink-0"
								>
									{reason.count}
								</Badge>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function BottleneckAnalysis() {
	const { data, isLoading, error } = useBottleneckAnalysis();

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Bottleneck Analysis
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-center h-48">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</CardContent>
			</Card>
		);
	}

	if (error || !data?.data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Bottleneck Analysis
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center text-muted-foreground py-8">Failed to load analysis</CardContent>
			</Card>
		);
	}

	const analysis = data.data;

	return (
		<div className="space-y-4">
			{/* Stale Leads Alert */}
			{analysis.staleLeads > 0 && (
				<Card className="border-yellow-200 bg-yellow-50">
					<CardContent className="p-4 flex items-center gap-3">
						<AlertTriangle className="h-5 w-5 text-yellow-600" />
						<div>
							<p className="font-medium text-yellow-800">Stale Leads Detected</p>
							<p className="text-sm text-yellow-700">{analysis.staleLeads} leads have not been contacted in over 7 days</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Stage Distribution */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium flex items-center gap-2">
						<BarChart3 className="h-4 w-4" />
						Pipeline Stage Distribution
					</CardTitle>
				</CardHeader>
				<CardContent>
					<StageChart stages={analysis.stageMetrics} />
				</CardContent>
			</Card>

			{/* Rejection Reasons */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<ReasonsList
					title="Lead Loss Reasons"
					reasons={analysis.lossReasons}
					emptyMessage="No lost leads"
				/>
				<ReasonsList
					title="Proposal Rejections"
					reasons={analysis.proposalRejections}
					emptyMessage="No rejected proposals"
				/>
				<ReasonsList
					title="Quotation Rejections"
					reasons={analysis.quotationRejections}
					emptyMessage="No rejected quotations"
				/>
			</div>
		</div>
	);
}
