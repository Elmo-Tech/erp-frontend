"use client";

import { AlertTriangle, CheckCircle2, GitPullRequest, ShieldCheck } from "lucide-react";
import type { CodeReview } from "@/entities/quality/model/types";
import { useCodeReviews, useQualityMetrics } from "@/features/quality/model/use-quality-actions";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";

export function QualityDashboardWidget() {
	const metricsQuery = useQualityMetrics();
	const reviewsQuery = useCodeReviews(20);
	const metrics = metricsQuery.data;
	const reviews = reviewsQuery.data?.codeReviews ?? [];
	const columns: Column<CodeReview>[] = [
		{
			key: "title",
			header: "Review",
			render: (review) => (
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">{review.taskTitle}</p>
					<p className="text-xs text-muted-foreground">Reviewed by {review.reviewerName}</p>
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			render: (review) => <Badge variant="secondary">{review.status}</Badge>,
		},
		{
			key: "risk",
			header: "Risk",
			className: "hidden md:table-cell",
			render: (review) => <span className="text-sm tabular-nums">{review.overallScore}</span>,
		},
		{
			key: "created",
			header: "Created",
			className: "hidden lg:table-cell",
			render: (review) => <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>,
		},
	];

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Quality</h1>
				<p className="text-sm text-muted-foreground">Code review, audit, and quality risk dashboard.</p>
			</div>

			<div className="grid gap-3 md:grid-cols-4">
				<Metric title="Quality score" value={metrics?.qualityScore ?? 0} icon={ShieldCheck} />
				<Metric title="Bounce rate" value={`${metrics?.overallBounceRate ?? 0}%`} icon={GitPullRequest} />
				<Metric title="Total bounces" value={metrics?.totalBounces ?? 0} icon={AlertTriangle} />
				<Metric title="Tasks with bounces" value={metrics?.tasksWithBounces ?? 0} icon={CheckCircle2} />
			</div>

			<DataTable
				title="Recent code reviews"
				columns={columns}
				data={reviews}
				keyExtractor={(review) => review.reviewId}
				isLoading={reviewsQuery.isLoading || metricsQuery.isLoading}
				error={reviewsQuery.error ?? metricsQuery.error}
				pagination={reviewsQuery.data?.pagination}
				emptyState={{ icon: GitPullRequest, title: "No quality events", description: "No reviews or audit events were found." }}
			/>
		</div>
	);
}

function Metric({ title, value, icon: Icon }: { title: string; value: string | number; icon: typeof ShieldCheck }) {
	return (
		<Card>
			<CardContent className="flex items-center justify-between p-4">
				<div>
					<p className="text-xs text-muted-foreground">{title}</p>
					<p className="text-xl font-semibold tabular-nums">{value}</p>
				</div>
				<Icon className="size-4 text-muted-foreground" />
			</CardContent>
		</Card>
	);
}
