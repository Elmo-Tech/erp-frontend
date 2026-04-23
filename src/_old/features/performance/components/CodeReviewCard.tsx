"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { CodeReviewStatusBadge } from "./CodeReviewStatusBadge";
import type { CodeReview } from "../types/codeReview";

interface CodeReviewCardProps {
	review: CodeReview;
	onApprove?: (id: number) => void;
	onReject?: (id: number) => void;
	onRequestRevision?: (id: number) => void;
	showActions?: boolean;
	isReviewer?: boolean;
}

export function CodeReviewCard({ review, onApprove, onReject, onRequestRevision, showActions = false, isReviewer = false }: CodeReviewCardProps) {
	const formatScore = (score: number) => `${score}/10`;

	return (
		<Card className="w-full">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle className="text-base">{review.taskTitle}</CardTitle>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>Review #{review.reviewId}</span>
							<CodeReviewStatusBadge status={review.status} />
						</div>
					</div>
					{review.overallScore > 0 && (
						<Badge
							variant="outline"
							className="ml-2"
						>
							{formatScore(review.overallScore)} avg
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Participants */}
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						<Avatar className="h-6 w-6">
							<AvatarFallback className="text-xs">{review.developerName.charAt(0)}</AvatarFallback>
						</Avatar>
						<span className="text-muted-foreground">Developer:</span>
						<span className="font-medium">{review.developerName}</span>
					</div>
					<div className="flex items-center gap-2">
						<Avatar className="h-6 w-6">
							<AvatarFallback className="text-xs">{review.reviewerName.charAt(0)}</AvatarFallback>
						</Avatar>
						<span className="text-muted-foreground">Reviewer:</span>
						<span className="font-medium">{review.reviewerName}</span>
					</div>
				</div>

				{/* Scores */}
				{review.overallScore > 0 && (
					<div className="grid grid-cols-2 gap-2 text-xs">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Code Quality:</span>
							<span>{formatScore(review.codeQualityScore)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Readability:</span>
							<span>{formatScore(review.readabilityScore)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Scalability:</span>
							<span>{formatScore(review.scalabilityScore)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Testing:</span>
							<span>{formatScore(review.testingScore)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Documentation:</span>
							<span>{formatScore(review.documentationScore)}</span>
						</div>
					</div>
				)}

				{/* Notes */}
				{review.reviewNotes && (
					<div className="text-sm">
						<span className="text-muted-foreground">Notes:</span>
						<p className="mt-1 text-xs bg-muted p-2 rounded">{review.reviewNotes}</p>
					</div>
				)}

				{/* Improvement Suggestions */}
				{review.improvementSuggestions && (
					<div className="text-sm">
						<span className="text-muted-foreground">Suggestions:</span>
						<p className="mt-1 text-xs bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">{review.improvementSuggestions}</p>
					</div>
				)}

				{/* Actions */}
				{showActions && isReviewer && review.status === "pending" && (
					<div className="flex gap-2 pt-2 border-t">
						<Button
							size="sm"
							onClick={() => onApprove?.(review.reviewId)}
							className="flex-1"
						>
							<CheckCircle className="h-4 w-4 mr-1" />
							Approve
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={() => onRequestRevision?.(review.reviewId)}
							className="flex-1"
						>
							<AlertCircle className="h-4 w-4 mr-1" />
							Request Revision
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => onReject?.(review.reviewId)}
							className="flex-1"
						>
							<XCircle className="h-4 w-4 mr-1" />
							Reject
						</Button>
					</div>
				)}

				{/* Timestamps */}
				<div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
					<div className="flex items-center gap-1">
						<Clock className="h-3 w-3" />
						<span>Created: {new Date(review.createdAt).toLocaleDateString()}</span>
					</div>
					<span>Updated: {new Date(review.updatedAt).toLocaleDateString()}</span>
				</div>
			</CardContent>
		</Card>
	);
}
