import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TimeTrackingData } from "../types/employeeReview";

interface TimeTrackingChartProps {
	timeTracking: TimeTrackingData;
}

export function TimeTrackingChart({ timeTracking }: TimeTrackingChartProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Chart */}
			<Card className="lg:col-span-2">
				<CardHeader>
					<CardTitle>Time Tracking Over Period</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer
						width="100%"
						height={300}
					>
						<LineChart data={timeTracking.byDate}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="date"
								tick={{ fontSize: 12 }}
								tickFormatter={(value) => {
									const date = new Date(value);
									return `${date.getMonth() + 1}/${date.getDate()}`;
								}}
							/>
							<YAxis tick={{ fontSize: 12 }} />
							<Tooltip
								labelFormatter={(value) => {
									const date = new Date(value as string);
									return date.toLocaleDateString();
								}}
								formatter={(value: number) => [`${value.toFixed(1)} hrs`, "Hours"]}
							/>
							<Legend />
							<Line
								type="monotone"
								dataKey="totalHours"
								stroke="#8884d8"
								strokeWidth={2}
								name="Hours Tracked"
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Summary */}
			<Card>
				<CardHeader>
					<CardTitle>Time Summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<p className="text-sm text-muted-foreground">Total Entries</p>
						<p className="text-2xl font-bold">{timeTracking.totalEntries}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Total Hours</p>
						<p className="text-2xl font-bold">{timeTracking.totalHours.toFixed(1)}</p>
					</div>
					<div className="pt-4 border-t">
						<p className="text-sm font-medium mb-2">By Type</p>
						<div className="space-y-2">
							{Object.entries(timeTracking.byType).map(([type, data]) => (
								<div
									key={type}
									className="flex justify-between text-sm"
								>
									<span className="text-muted-foreground capitalize">{type.split("\\").pop()}</span>
									<span className="font-medium">{data.totalHours.toFixed(1)}h</span>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
