"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { useMyEvaluations } from "../hooks";
import type { PerformanceEvaluation, BonusTier, EvaluationStatus } from "../types";
import { ClipboardList, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

const tierColors: Record<BonusTier, string> = {
	excellent: "bg-green-500 text-white",
	good: "bg-blue-500 text-white",
	average: "bg-yellow-500 text-white",
	poor: "bg-red-500 text-white",
};

const tierLabels: Record<BonusTier, string> = {
	excellent: "Excellent",
	good: "Good",
	average: "Average",
	poor: "Poor",
};

const statusLabels: Record<EvaluationStatus, string> = {
	pending: "Pending",
	in_progress: "In Progress",
	completed: "Completed",
	approved: "Approved",
};

function EvaluationItem({ evaluation }: { evaluation: PerformanceEvaluation }) {
	const router = useRouter();

	return (
		<div className="flex items-center justify-between p-4 border rounded-lg">
			<div className="space-y-1">
				<p className="font-medium">{evaluation.periodName}</p>
				<div className="flex items-center gap-2">
					<Badge variant="outline">{statusLabels[evaluation.status]}</Badge>
					{evaluation.bonusTier && <Badge className={tierColors[evaluation.bonusTier]}>{tierLabels[evaluation.bonusTier]}</Badge>}
				</div>
			</div>
			<div className="flex items-center gap-4">
				<div className="text-right">
					<p className="text-2xl font-bold">{evaluation.totalScore.toFixed(1)}</p>
					<p className="text-xs text-muted-foreground">out of 100</p>
				</div>
				{evaluation.status === "approved" && (
					<div className="text-right">
						<p className="text-lg font-bold text-green-600">${evaluation.bonusAmount.toLocaleString()}</p>
						<p className="text-xs text-muted-foreground">bonus</p>
					</div>
				)}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push(`/dashboard/performance/evaluations/${evaluation.evaluationId}`)}
				>
					<Eye className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}

export function MyEvaluationsCard() {
	const { data, isLoading, error } = useMyEvaluations();

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>My Evaluations</CardTitle>
					<CardDescription>Your performance evaluation history</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							className="h-20 w-full"
						/>
					))}
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>My Evaluations</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-destructive">Failed to load evaluations</p>
				</CardContent>
			</Card>
		);
	}

	const evaluations = data?.evaluations || [];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ClipboardList className="h-5 w-5" />
					My Evaluations
				</CardTitle>
				<CardDescription>Your performance evaluation history</CardDescription>
			</CardHeader>
			<CardContent>
				{(evaluations || []).length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>No evaluations yet</p>
						<p className="text-sm">Your evaluations will appear here once created</p>
					</div>
				) : (
					<div className="space-y-4">
						{(evaluations || []).map((evaluation) => (
							<EvaluationItem
								key={evaluation.evaluationId}
								evaluation={evaluation}
							/>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
