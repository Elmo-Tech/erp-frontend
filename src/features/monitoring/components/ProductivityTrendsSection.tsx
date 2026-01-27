import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductivityTrends } from "../types/employeeReview";
import { TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";

interface ProductivityTrendsSectionProps {
	data: ProductivityTrends;
}

export function ProductivityTrendsSection({ data }: ProductivityTrendsSectionProps) {
	// Combine data for dual-axis chart
	const combinedData = data.weeklyTimeTracking.map((timeData) => {
		const taskData = data.weeklyTaskCompletion.find((t) => t.week === timeData.week);
		return {
			week: timeData.week,
			hours: timeData.totalHours,
			entries: timeData.entries,
			completed: taskData?.completed || 0,
			onTime: taskData?.onTime || 0,
		};
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					Productivity Trends
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Weekly Time Tracking Chart */}
				<div className="space-y-3">
					<h4 className="font-semibold flex items-center gap-2">
						<Clock className="h-4 w-4" />
						Weekly Time Tracking
					</h4>
					<div className="h-[300px]">
						<ResponsiveContainer
							width="100%"
							height="100%"
						>
							<LineChart data={combinedData}>
								<CartesianGrid
									strokeDasharray="3 3"
									className="stroke-muted"
								/>
								<XAxis
									dataKey="week"
									className="text-xs"
								/>
								<YAxis className="text-xs" />
								<Tooltip
									contentStyle={{
										backgroundColor: "hsl(var(--background))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "6px",
									}}
								/>
								<Legend />
								<Line
									type="monotone"
									dataKey="hours"
									stroke="hsl(var(--primary))"
									strokeWidth={2}
									name="Hours Tracked"
									dot={{ r: 4 }}
									activeDot={{ r: 6 }}
								/>
								<Line
									type="monotone"
									dataKey="entries"
									stroke="hsl(var(--chart-2))"
									strokeWidth={2}
									name="Time Entries"
									dot={{ r: 4 }}
									activeDot={{ r: 6 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Weekly Task Completion Chart */}
				<div className="space-y-3">
					<h4 className="font-semibold flex items-center gap-2">
						<CheckCircle2 className="h-4 w-4" />
						Weekly Task Completion
					</h4>
					<div className="h-[300px]">
						<ResponsiveContainer
							width="100%"
							height="100%"
						>
							<BarChart data={combinedData}>
								<CartesianGrid
									strokeDasharray="3 3"
									className="stroke-muted"
								/>
								<XAxis
									dataKey="week"
									className="text-xs"
								/>
								<YAxis className="text-xs" />
								<Tooltip
									contentStyle={{
										backgroundColor: "hsl(var(--background))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "6px",
									}}
								/>
								<Legend />
								<Bar
									dataKey="completed"
									fill="hsl(var(--primary))"
									name="Total Completed"
									radius={[4, 4, 0, 0]}
								/>
								<Bar
									dataKey="onTime"
									fill="hsl(var(--chart-1))"
									name="On Time"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Summary Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Total Weeks</p>
						<p className="text-2xl font-bold">{combinedData.length}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Avg Hours/Week</p>
						<p className="text-2xl font-bold">{combinedData.length > 0 ? (combinedData.reduce((sum, d) => sum + d.hours, 0) / combinedData.length).toFixed(1) : 0}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Avg Tasks/Week</p>
						<p className="text-2xl font-bold">{combinedData.length > 0 ? (combinedData.reduce((sum, d) => sum + d.completed, 0) / combinedData.length).toFixed(1) : 0}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">On-Time Rate</p>
						<p className="text-2xl font-bold text-green-500">{combinedData.length > 0 ? ((combinedData.reduce((sum, d) => sum + d.onTime, 0) / combinedData.reduce((sum, d) => sum + d.completed, 0)) * 100).toFixed(0) : 0}%</p>
					</div>
				</div>

				{/* Trend Analysis */}
				{combinedData.length >= 2 && (
					<div className="bg-muted/50 rounded-lg p-4">
						<p className="font-semibold mb-2">📊 Trend Analysis</p>
						<div className="space-y-2 text-sm">
							{(() => {
								const firstWeek = combinedData[0];
								const lastWeek = combinedData[combinedData.length - 1];
								const hoursTrend = lastWeek.hours - firstWeek.hours;
								const tasksTrend = lastWeek.completed - firstWeek.completed;

								return (
									<>
										<p className="text-muted-foreground">
											<span className="font-medium">Time Tracking:</span>{" "}
											{hoursTrend > 0 ? (
												<span className="text-green-600">↑ Increased by {hoursTrend.toFixed(1)} hours/week</span>
											) : hoursTrend < 0 ? (
												<span className="text-red-600">↓ Decreased by {Math.abs(hoursTrend).toFixed(1)} hours/week</span>
											) : (
												<span>→ Stable</span>
											)}
										</p>
										<p className="text-muted-foreground">
											<span className="font-medium">Task Completion:</span>{" "}
											{tasksTrend > 0 ? (
												<span className="text-green-600">↑ Increased by {tasksTrend} tasks/week</span>
											) : tasksTrend < 0 ? (
												<span className="text-red-600">↓ Decreased by {Math.abs(tasksTrend)} tasks/week</span>
											) : (
												<span>→ Stable</span>
											)}
										</p>
									</>
								);
							})()}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
