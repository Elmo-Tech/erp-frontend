import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProductivityMetrics as ProductivityMetricsType } from "../types/employeeReview";

interface ProductivityMetricsProps {
	productivity: ProductivityMetricsType;
}

export function ProductivityMetrics({ productivity }: ProductivityMetricsProps) {
	const metrics = [
		{
			label: "Efficiency",
			value: parseFloat(productivity.efficiency),
			description: "Tracked time vs total work time",
			color: "bg-blue-600",
		},
		{
			label: "Quality Score",
			value: parseFloat(productivity.qualityScore),
			description: "Based on bounce rate",
			color: "bg-green-600",
		},
		{
			label: "Completion Rate",
			value: parseFloat(productivity.completionRate),
			description: "Tasks completed vs assigned",
			color: "bg-purple-600",
		},
		{
			label: "Overall Productivity",
			value: parseFloat(productivity.productivityScore),
			description: "Weighted average of all metrics",
			color: "bg-indigo-600",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Productivity Metrics</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{metrics.map((metric, index) => (
					<div
						key={index}
						className="space-y-2"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">{metric.label}</p>
								<p className="text-xs text-muted-foreground">{metric.description}</p>
							</div>
							<span className="text-2xl font-bold">{metric.value.toFixed(1)}%</span>
						</div>
						<Progress
							value={metric.value}
							className="h-2"
						/>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
