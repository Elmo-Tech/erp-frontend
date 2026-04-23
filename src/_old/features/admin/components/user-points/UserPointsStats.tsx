"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Users, Trophy, TrendingUp, Activity } from "lucide-react";
import { usePointsStatistics } from "../../hooks/useUserPoints";

export function UserPointsStats() {
	const { data: stats, isLoading } = usePointsStatistics();

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Loading...</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-8 bg-muted animate-pulse rounded" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!stats) return null;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Total Users */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Employees</CardTitle>
					<Users className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.totalUsers}</div>
					<p className="text-xs text-muted-foreground">Active employees</p>
				</CardContent>
			</Card>

			{/* Total Points */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Points</CardTitle>
					<Trophy className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
					<p className="text-xs text-muted-foreground">Points distributed</p>
				</CardContent>
			</Card>

			{/* Average Points */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Average Points</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.averagePoints}</div>
					<p className="text-xs text-muted-foreground">Per employee</p>
				</CardContent>
			</Card>

			{/* Monthly Activity */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Monthly Activity</CardTitle>
					<Activity className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.monthlyActivity}</div>
					<p className="text-xs text-muted-foreground">Transactions this month</p>
				</CardContent>
			</Card>

			{/* Top Performer */}
			{stats.topUser && (
				<Card className="md:col-span-2 lg:col-span-4">
					<CardHeader>
						<CardTitle className="text-sm font-medium">Top Performer</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-3">
							<Trophy className="h-8 w-8 text-yellow-500" />
							<div>
								<div className="font-medium">{stats.topUser.name}</div>
								<div className="flex items-center gap-2">
									<Badge
										variant="default"
										className="text-sm"
									>
										{stats.topUser.points} points
									</Badge>
									<span className="text-sm text-muted-foreground">Leading the leaderboard</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
