import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target, TrendingUp, Calendar, AlertTriangle, Award, Plus, Minus } from "lucide-react";
import { OverviewMetrics } from "../types/employeeReview";

interface OverviewCardsProps {
	overview: OverviewMetrics;
}

export function OverviewCards({ overview }: OverviewCardsProps) {
	const cards = [
		{
			title: "Total Tracked Hours",
			value: overview.totalTrackedHours.toFixed(1),
			subtitle: "hours",
			icon: Clock,
			color: "text-blue-600",
			bgColor: "bg-blue-100 dark:bg-blue-900/20",
		},
		{
			title: "Task Completion Rate",
			value: `${parseFloat(overview.taskCompletionRate).toFixed(1)}%`,
			subtitle: "completed",
			icon: Target,
			color: "text-green-600",
			bgColor: "bg-green-100 dark:bg-green-900/20",
		},
		{
			title: "Productivity Score",
			value: parseFloat(overview.productivityScore).toFixed(1),
			subtitle: "out of 100",
			icon: TrendingUp,
			color: "text-purple-600",
			bgColor: "bg-purple-100 dark:bg-purple-900/20",
		},
		{
			title: "Points Earned",
			value: `+${overview.pointsEarned}`,
			subtitle: "this period",
			icon: Plus,
			color: "text-green-600",
			bgColor: "bg-green-100 dark:bg-green-900/20",
		},
		{
			title: "Points Deducted",
			value: `-${overview.pointsDeducted}`,
			subtitle: "this period",
			icon: Minus,
			color: "text-red-600",
			bgColor: "bg-red-100 dark:bg-red-900/20",
		},
		{
			title: "Net Points Change",
			value: overview.netPointsChange >= 0 ? `+${overview.netPointsChange}` : `${overview.netPointsChange}`,
			subtitle: "net change",
			icon: Award,
			color: overview.netPointsChange >= 0 ? "text-green-600" : "text-red-600",
			bgColor: overview.netPointsChange >= 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20",
		},
		{
			title: "Attendance Days",
			value: overview.attendanceDays,
			subtitle: "days",
			icon: Calendar,
			color: "text-indigo-600",
			bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
		},
		{
			title: "Average Bounce Rate",
			value: parseFloat(overview.averageBounceRate).toFixed(2),
			subtitle: "per task",
			icon: AlertTriangle,
			color: "text-orange-600",
			bgColor: "bg-orange-100 dark:bg-orange-900/20",
		},
		{
			title: "Idle Hours",
			value: overview.totalIdleHours.toFixed(1),
			subtitle: "hours",
			icon: Clock,
			color: "text-red-600",
			bgColor: "bg-red-100 dark:bg-red-900/20",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{cards.map((card, index) => {
				const Icon = card.icon;
				return (
					<Card key={index}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{card.title}</CardTitle>
							<div className={`p-2 rounded-lg ${card.bgColor}`}>
								<Icon className={`h-4 w-4 ${card.color}`} />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{card.value}</div>
							<p className="text-xs text-muted-foreground">{card.subtitle}</p>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
