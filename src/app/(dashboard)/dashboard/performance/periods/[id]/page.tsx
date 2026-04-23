"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { ArrowLeft, Calendar, Users, DollarSign, TrendingUp } from "lucide-react";
import { usePeriodBonuses } from "@/_old/features/performance/hooks";
import { BonusSummaryTable } from "@/_old/features/performance/components/BonusSummaryTable";

interface PageProps {
	params: Promise<{ id: string }>;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	draft: "secondary",
	active: "default",
	completed: "outline",
};

export default function EvaluationPeriodDetailPage({ params }: PageProps) {
	const { id } = use(params);
	const router = useRouter();
	const periodId = parseInt(id, 10);

	const { data, isLoading, error } = usePeriodBonuses(periodId);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-10" />
					<Skeleton className="h-8 w-64" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton
							key={i}
							className="h-32"
						/>
					))}
				</div>
				<Skeleton className="h-96" />
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="space-y-6">
				<Button
					variant="ghost"
					onClick={() => router.back()}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<p className="text-muted-foreground">Failed to load evaluation period details</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => router.back()}
						>
							Go Back
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{data.periodName}</h1>
						<p className="text-muted-foreground">Evaluation Period Details</p>
					</div>
				</div>
				<Badge variant={statusColors["active"] || "default"}>Active</Badge>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Employees</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.summary.totalEmployees}</div>
						<p className="text-xs text-muted-foreground">Evaluated this period</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Bonus</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${data.summary.totalBonusAmount.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">To be distributed</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Score</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.summary.averageScore.toFixed(1)}</div>
						<p className="text-xs text-muted-foreground">Out of 100 points</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Period</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-lg font-bold">Bi-Monthly</div>
						<p className="text-xs text-muted-foreground">Evaluation cycle</p>
					</CardContent>
				</Card>
			</div>

			{/* Bonus Summary Table */}
			<Card>
				<CardHeader>
					<CardTitle>Employee Bonuses</CardTitle>
					<CardDescription>Detailed breakdown of performance scores and bonus calculations</CardDescription>
				</CardHeader>
				<CardContent>
					<BonusSummaryTable data={data} />
				</CardContent>
			</Card>
		</div>
	);
}
