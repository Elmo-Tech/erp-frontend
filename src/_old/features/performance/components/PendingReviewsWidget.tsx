"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import { CodeReviewCard } from "./CodeReviewCard";
import { useMyPendingReviews, useApproveCodeReview, useRejectCodeReview, useRequestRevision } from "../hooks";
import { Skeleton } from "@/shared/ui/skeleton";

export function PendingReviewsWidget() {
	const { data: pendingReviews, isLoading } = useMyPendingReviews();
	const approveReview = useApproveCodeReview();
	const rejectReview = useRejectCodeReview();
	const requestRevision = useRequestRevision();

	const handleApprove = (id: number) => {
		approveReview.mutate(id);
	};

	const handleReject = (id: number) => {
		const reason = prompt("Please provide a reason for rejection:");
		if (reason) {
			rejectReview.mutate({ id, reason });
		}
	};

	const handleRequestRevision = (id: number) => {
		const suggestions = prompt("Please provide suggestions for improvement:");
		if (suggestions) {
			requestRevision.mutate({ id, suggestions });
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Pending Reviews
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[...Array(2)].map((_, i) => (
							<Skeleton
								key={i}
								className="h-32 w-full"
							/>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Pending Reviews
					</CardTitle>
					{pendingReviews && pendingReviews.length > 0 && <Badge variant="destructive">{pendingReviews.length} pending</Badge>}
				</div>
			</CardHeader>

			<CardContent>
				{pendingReviews && pendingReviews.length > 0 ? (
					<div className="space-y-4">
						{pendingReviews.map((review) => (
							<CodeReviewCard
								key={review.reviewId}
								review={review}
								onApprove={handleApprove}
								onReject={handleReject}
								onRequestRevision={handleRequestRevision}
								showActions={true}
								isReviewer={true}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
						<p>No pending reviews</p>
						<p className="text-sm">All caught up!</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
