/**
 * Quality Metrics Cards Component
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Target, Users } from "lucide-react";

interface MetricsCardsProps {
	overallBounceRate: number;
	qualityScore: number;
	totalBounces: number;
	tasksWithBounces: number;
}

export function MetricsCards({ overallBounceRate, qualityScore, totalBounces, tasksWithBounces }: MetricsCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Overall Bounce Rate</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{overallBounceRate.toFixed(2)}</div>
					<p className="text-xs text-muted-foreground">Average bounces per task</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Quality Score</CardTitle>
					<Target className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold flex items-center gap-2">
						{qualityScore.toFixed(1)}
						<Badge variant={qualityScore >= 8 ? "default" : qualityScore >= 6 ? "secondary" : "destructive"}>{qualityScore >= 8 ? "Excellent" : qualityScore >= 6 ? "Good" : "Poor"}</Badge>
					</div>
					<p className="text-xs text-muted-foreground">Inverse of bounce rate</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Total Bounces</CardTitle>
					<AlertTriangle className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{totalBounces}</div>
					<p className="text-xs text-muted-foreground">Across all tasks</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Tasks with Bounces</CardTitle>
					<Users className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{tasksWithBounces}</div>
					<p className="text-xs text-muted-foreground">Tasks that bounced back</p>
				</CardContent>
			</Card>
		</div>
	);
}
