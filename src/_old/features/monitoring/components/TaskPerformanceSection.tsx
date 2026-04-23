import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { TaskPerformanceAnalysis } from "../types/employeeReview";
import { Target, CheckCircle2, TrendingUp, Calendar } from "lucide-react";

interface TaskPerformanceSectionProps {
	data: TaskPerformanceAnalysis;
}

export function TaskPerformanceSection({ data }: TaskPerformanceSectionProps) {
	const onTimeRate = parseFloat(data.onTimeRate);
	const monthlyEntries = Object.entries(data.byMonth);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Target className="h-5 w-5" />
					Task Delivery Performance
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Summary Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Total Completed</p>
						<p className="text-2xl font-bold">{data.totalCompleted}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">On Time</p>
						<p className="text-2xl font-bold text-green-500">{data.onTimeCount}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Late</p>
						<p className="text-2xl font-bold text-orange-500">{data.lateCount}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Avg Delay</p>
						<p className="text-2xl font-bold text-destructive">{data.averageDelayDays}d</p>
					</div>
				</div>

				{/* On-Time Rate */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-green-500" />
							<span className="font-semibold">On-Time Delivery Rate</span>
						</div>
						<Badge
							variant={onTimeRate >= 80 ? "default" : onTimeRate >= 60 ? "secondary" : "destructive"}
							className={onTimeRate >= 80 ? "bg-green-500" : ""}
						>
							{data.onTimeRate}%
						</Badge>
					</div>
					<Progress
						value={onTimeRate}
						className="h-3"
					/>
					<p className="text-xs text-muted-foreground">{onTimeRate >= 80 ? "🎉 Excellent delivery performance!" : onTimeRate >= 60 ? "⚠️ Good, but room for improvement" : "❌ Needs significant improvement"}</p>
				</div>

				{/* Monthly Breakdown */}
				{monthlyEntries.length > 0 && (
					<div className="space-y-3">
						<h4 className="font-semibold flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Monthly Performance
						</h4>
						<div className="space-y-3">
							{monthlyEntries.map(([month, stats]) => {
								const monthRate = stats.onTimeRate;
								return (
									<div
										key={month}
										className="border rounded-lg p-4 space-y-3"
									>
										<div className="flex items-center justify-between">
											<span className="font-medium">{month}</span>
											<Badge
												variant={monthRate >= 80 ? "default" : monthRate >= 60 ? "secondary" : "destructive"}
												className={monthRate >= 80 ? "bg-green-500" : ""}
											>
												{monthRate.toFixed(1)}%
											</Badge>
										</div>
										<Progress
											value={monthRate}
											className="h-2"
										/>
										<div className="grid grid-cols-3 gap-2 text-sm">
											<div className="text-center">
												<p className="text-muted-foreground text-xs">Total</p>
												<p className="font-bold">{stats.total}</p>
											</div>
											<div className="text-center">
												<p className="text-muted-foreground text-xs">On Time</p>
												<p className="font-bold text-green-500">{stats.onTime}</p>
											</div>
											<div className="text-center">
												<p className="text-muted-foreground text-xs">Late</p>
												<p className="font-bold text-orange-500">{stats.late}</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Performance Indicator */}
				<div
					className={`rounded-lg p-4 ${onTimeRate >= 80 ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" : onTimeRate >= 60 ? "bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800" : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"}`}
				>
					<div className="flex items-start gap-3">
						<TrendingUp className={`h-5 w-5 mt-0.5 ${onTimeRate >= 80 ? "text-green-600" : onTimeRate >= 60 ? "text-yellow-600" : "text-red-600"}`} />
						<div className="flex-1">
							<p className={`font-semibold ${onTimeRate >= 80 ? "text-green-900 dark:text-green-100" : onTimeRate >= 60 ? "text-yellow-900 dark:text-yellow-100" : "text-red-900 dark:text-red-100"}`}>
								{onTimeRate >= 80 ? "Outstanding Performance" : onTimeRate >= 60 ? "Satisfactory Performance" : "Performance Needs Improvement"}
							</p>
							<p className={`text-sm mt-1 ${onTimeRate >= 80 ? "text-green-700 dark:text-green-300" : onTimeRate >= 60 ? "text-yellow-700 dark:text-yellow-300" : "text-red-700 dark:text-red-300"}`}>
								{onTimeRate >= 80
									? "Consistently delivering tasks on time. Keep up the excellent work!"
									: onTimeRate >= 60
										? "Most tasks delivered on time, but there's room for improvement in time management."
										: "Frequent delays in task delivery. Consider reviewing workload and time estimation."}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
