"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column } from "@/components/shared/data-display/DataTable";
import type { CodeReview, CodeReviewStatus } from "../../types";
import { MoreHorizontal, Eye, CheckCircle, AlertCircle } from "lucide-react";

interface CodeReviewsColumnsOptions {
	onView: (review: CodeReview) => void;
	onApprove?: (review: CodeReview) => void;
	onRequestRevision?: (review: CodeReview) => void;
}

const statusColors: Record<CodeReviewStatus, "default" | "secondary" | "outline" | "destructive"> = {
	pending: "secondary",
	approved: "default",
	needs_revision: "outline",
	rejected: "destructive",
};

const statusLabels: Record<CodeReviewStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	needs_revision: "Needs Revision",
	rejected: "Rejected",
};

export function getCodeReviewsColumns({ onView, onApprove, onRequestRevision }: CodeReviewsColumnsOptions): Column<CodeReview>[] {
	return [
		{
			key: "taskTitle",
			header: "Task",
			render: (review) => <span className="font-medium">{review.taskTitle}</span>,
		},
		{
			key: "developerName",
			header: "Developer",
			render: (review) => review.developerName,
		},
		{
			key: "reviewerName",
			header: "Reviewer",
			render: (review) => review.reviewerName,
		},
		{
			key: "overallScore",
			header: "Score",
			render: (review) => <span className="font-medium">{review.overallScore.toFixed(1)}/100</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (review) => <Badge variant={statusColors[review.status]}>{statusLabels[review.status]}</Badge>,
		},
		{
			key: "createdAt",
			header: "Date",
			render: (review) => new Date(review.createdAt).toLocaleDateString(),
		},
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (review) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={(e) => e.stopPropagation()}
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onView(review)}>
							<Eye className="h-4 w-4 mr-2" />
							View Details
						</DropdownMenuItem>
						{onApprove && review.status === "pending" && (
							<DropdownMenuItem onClick={() => onApprove(review)}>
								<CheckCircle className="h-4 w-4 mr-2" />
								Approve
							</DropdownMenuItem>
						)}
						{onRequestRevision && review.status === "pending" && (
							<DropdownMenuItem onClick={() => onRequestRevision(review)}>
								<AlertCircle className="h-4 w-4 mr-2" />
								Request Revision
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}
