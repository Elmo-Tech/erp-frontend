"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Search, Filter, RefreshCw } from "lucide-react";
import { CodeReviewCard } from "./CodeReviewCard";
import { useCodeReviews, useApproveCodeReview, useRejectCodeReview, useRequestRevision } from "../hooks";
import type { CodeReviewFilters, CodeReviewStatus } from "../types/codeReview";
import { Skeleton } from "@/shared/ui/skeleton";

interface CodeReviewListProps {
	showActions?: boolean;
	isReviewer?: boolean;
	title?: string;
}

export function CodeReviewList({ showActions = false, isReviewer = false, title = "Code Reviews" }: CodeReviewListProps) {
	const [filters, setFilters] = useState<CodeReviewFilters>({});
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");

	const { data, isLoading, refetch } = useCodeReviews({
		...filters,
		page,
		perPage: 10,
	});

	const approveReview = useApproveCodeReview();
	const rejectReview = useRejectCodeReview();
	const requestRevision = useRequestRevision();

	const handleStatusFilter = (status: string) => {
		if (status === "all") {
			const { status: _, ...newFilters } = filters;
			setFilters(newFilters);
		} else {
			setFilters({ ...filters, status: status as CodeReviewStatus });
		}
		setPage(1);
	};

	const handleRoleFilter = (role: string) => {
		const newFilters = { ...filters };
		delete newFilters.asReviewer;
		delete newFilters.asDeveloper;

		if (role === "reviewer") {
			newFilters.asReviewer = true;
		} else if (role === "developer") {
			newFilters.asDeveloper = true;
		}

		setFilters(newFilters);
		setPage(1);
	};

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

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						{title}
						{data?.pagination && <Badge variant="outline">{data.pagination.total} total</Badge>}
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						disabled={isLoading}
					>
						<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
					</Button>
				</div>

				{/* Filters */}
				<div className="flex flex-wrap gap-2">
					<div className="flex items-center gap-2">
						<Search className="h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search reviews..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-48"
						/>
					</div>

					<Select onValueChange={handleStatusFilter}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="approved">Approved</SelectItem>
							<SelectItem value="needs_revision">Needs Revision</SelectItem>
							<SelectItem value="rejected">Rejected</SelectItem>
						</SelectContent>
					</Select>

					<Select onValueChange={handleRoleFilter}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="My Role" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Reviews</SelectItem>
							<SelectItem value="reviewer">As Reviewer</SelectItem>
							<SelectItem value="developer">As Developer</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>

			<CardContent>
				{isLoading ? (
					<div className="space-y-4">
						{[...Array(3)].map((_, i) => (
							<Skeleton
								key={i}
								className="h-48 w-full"
							/>
						))}
					</div>
				) : data?.items && data.items.length > 0 ? (
					<div className="space-y-4">
						{data.items.map((review) => (
							<CodeReviewCard
								key={review.reviewId}
								review={review}
								onApprove={handleApprove}
								onReject={handleReject}
								onRequestRevision={handleRequestRevision}
								showActions={showActions}
								isReviewer={isReviewer}
							/>
						))}

						{/* Pagination */}
						{data.pagination && data.pagination.totalPages > 1 && (
							<div className="flex items-center justify-between pt-4">
								<div className="text-sm text-muted-foreground">
									Showing {data.pagination.count} of {data.pagination.total} reviews
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage(page - 1)}
										disabled={page === 1}
									>
										Previous
									</Button>
									<span className="flex items-center px-3 text-sm">
										Page {page} of {data.pagination.totalPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage(page + 1)}
										disabled={page === data.pagination.totalPages}
									>
										Next
									</Button>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<Filter className="h-8 w-8 mx-auto mb-2" />
						<p>No code reviews found</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
