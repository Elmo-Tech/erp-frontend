import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { QualityMetrics } from "../types/employeeReview";
import { Shield, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

interface QualityMetricsSectionProps {
	data: QualityMetrics;
}

export function QualityMetricsSection({ data }: QualityMetricsSectionProps) {
	const firstTimePassRate = parseFloat(data.firstTimePassRate);
	const averageBounceRate = parseFloat(data.averageBounceRate);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="h-5 w-5" />
					Code Quality Metrics
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Summary Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Total Tasks</p>
						<p className="text-2xl font-bold">{data.totalTasks}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">First-Time Pass</p>
						<p className="text-2xl font-bold text-green-500">{data.tasksWithoutBounces}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">With Bounces</p>
						<p className="text-2xl font-bold text-orange-500">{data.tasksWithBounces}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Total Bounces</p>
						<p className="text-2xl font-bold text-destructive">{data.totalBounces}</p>
					</div>
				</div>

				{/* First-Time Pass Rate */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-green-500" />
							<span className="font-semibold">First-Time Pass Rate</span>
						</div>
						<Badge
							variant={firstTimePassRate >= 80 ? "default" : firstTimePassRate >= 60 ? "secondary" : "destructive"}
							className={firstTimePassRate >= 80 ? "bg-green-500" : ""}
						>
							{data.firstTimePassRate}%
						</Badge>
					</div>
					<Progress
						value={firstTimePassRate}
						className="h-3"
					/>
					<p className="text-xs text-muted-foreground">Percentage of tasks that passed testing without needing rework</p>
				</div>

				{/* Average Bounce Rate */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-orange-500" />
							<span className="font-semibold">Average Bug Bounce Rate</span>
						</div>
						<Badge
							variant={averageBounceRate <= 0.2 ? "default" : averageBounceRate <= 0.5 ? "secondary" : "destructive"}
							className={averageBounceRate <= 0.2 ? "bg-green-500" : ""}
						>
							{data.averageBounceRate}
						</Badge>
					</div>
					<div className="bg-muted/50 rounded-lg p-3">
						<p className="text-sm text-muted-foreground">Average number of times tasks were returned from testing per task</p>
					</div>
				</div>

				{/* Quality Score Breakdown */}
				<div className="grid grid-cols-2 gap-4">
					<div className="border rounded-lg p-4 space-y-2">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-green-500" />
							<span className="text-sm font-medium">Clean Tasks</span>
						</div>
						<p className="text-2xl font-bold">{data.tasksWithoutBounces}</p>
						<p className="text-xs text-muted-foreground">Passed first time</p>
					</div>
					<div className="border rounded-lg p-4 space-y-2">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-orange-500" />
							<span className="text-sm font-medium">Reworked Tasks</span>
						</div>
						<p className="text-2xl font-bold">{data.tasksWithBounces}</p>
						<p className="text-xs text-muted-foreground">Needed fixes</p>
					</div>
				</div>

				{/* Quality Assessment */}
				<div
					className={`rounded-lg p-4 ${firstTimePassRate >= 80 ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" : firstTimePassRate >= 60 ? "bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800" : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"}`}
				>
					<div className="flex items-start gap-3">
						<TrendingUp className={`h-5 w-5 mt-0.5 ${firstTimePassRate >= 80 ? "text-green-600" : firstTimePassRate >= 60 ? "text-yellow-600" : "text-red-600"}`} />
						<div className="flex-1">
							<p className={`font-semibold ${firstTimePassRate >= 80 ? "text-green-900 dark:text-green-100" : firstTimePassRate >= 60 ? "text-yellow-900 dark:text-yellow-100" : "text-red-900 dark:text-red-100"}`}>
								{firstTimePassRate >= 80 ? "Excellent Code Quality" : firstTimePassRate >= 60 ? "Good Code Quality" : "Code Quality Needs Improvement"}
							</p>
							<p className={`text-sm mt-1 ${firstTimePassRate >= 80 ? "text-green-700 dark:text-green-300" : firstTimePassRate >= 60 ? "text-yellow-700 dark:text-yellow-300" : "text-red-700 dark:text-red-300"}`}>
								{firstTimePassRate >= 80
									? "High first-time pass rate indicates strong attention to detail and thorough self-testing."
									: firstTimePassRate >= 60
										? "Decent quality, but consider more thorough testing before submission to reduce rework."
										: "High bounce rate suggests need for better testing practices and code review before submission."}
							</p>
						</div>
					</div>
				</div>

				{/* Recommendations */}
				{firstTimePassRate < 80 && (
					<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Recommendations</p>
						<ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
							<li>Implement more thorough self-testing before submission</li>
							<li>Use a checklist to verify all requirements are met</li>
							<li>Consider pair programming for complex features</li>
							<li>Review common bug patterns and avoid them</li>
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
