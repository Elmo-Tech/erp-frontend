"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Award } from "lucide-react";
import { useMyCodeReviewStats } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";

interface CodeReviewStatsCardProps {
	startDate?: string;
	endDate?: string;
}

export function CodeReviewStatsCard({ startDate, endDate }: CodeReviewStatsCardProps) {
	const { data: stats, isLoading } = useMyCodeReviewStats(startDate, endDate);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Award className="h-5 w-5" />
						Code Review Stats
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!stats) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Award className="h-5 w-5" />
						Code Review Stats
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-muted-foreground">
						<Target className="h-8 w-8 mx-auto mb-2" />
						<p>No stats available</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const formatScore = (score: number) => score.toFixed(1);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Award className="h-5 w-5" />
						Code Review Stats
					</CardTitle>
					<Badge variant="outline">{stats.totalReviews} reviews</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Overview Stats */}
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600">{stats.approved}</div>
						<div className="text-sm text-muted-foreground">Approved</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
						<div className="text-sm text-muted-foreground">Rejected</div>
					</div>
				</div>

				{/* Approval Rate */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">Approval Rate</span>
						<div className="flex items-center gap-1">
							{stats.approvalRate >= 80 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
							<span className="text-sm font-medium">{stats.approvalRate.toFixed(1)}%</span>
						</div>
					</div>
					<Progress
						value={stats.approvalRate}
						className="h-2"
					/>
				</div>

				{/* Average Scores */}
				<div className="space-y-3">
					<h4 className="text-sm font-medium">Average Scores</h4>

					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Overall</span>
							<Badge variant={stats.averageScores.overall >= 7 ? "default" : "secondary"}>{formatScore(stats.averageScores.overall)}/10</Badge>
						</div>

						<div className="grid grid-cols-2 gap-2 text-xs">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Code Quality:</span>
								<span>{formatScore(stats.averageScores.codeQuality)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Readability:</span>
								<span>{formatScore(stats.averageScores.readability)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Scalability:</span>
								<span>{formatScore(stats.averageScores.scalability)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Testing:</span>
								<span>{formatScore(stats.averageScores.testing)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Documentation:</span>
								<span>{formatScore(stats.averageScores.documentation)}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Status Breakdown */}
				{stats.needsRevision > 0 && (
					<div className="pt-2 border-t">
						<div className="text-sm text-muted-foreground">{stats.needsRevision} reviews need revision</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
