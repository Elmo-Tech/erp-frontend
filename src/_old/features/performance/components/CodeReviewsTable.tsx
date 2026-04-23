"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/shared/ui/data-display/DataTable";
import { FilterBar } from "@/shared/ui/filters/FilterBar";
import { ConfirmDialog, FormDialog } from "@/shared/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { useCodeReviews, useApproveCodeReview, useRequestRevision } from "../hooks";
import type { CodeReview, CodeReviewStatus } from "../types/codeReview";
import { getCodeReviewsColumns } from "./columns/codeReviewsColumns";
import { FileCode } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/_old/features/admin/hooks/usePermissions";

interface CodeReviewsTableProps {
	asReviewer?: boolean;
	asDeveloper?: boolean;
}

interface CodeReviewFilters {
	asReviewer?: boolean;
	asDeveloper?: boolean;
	status?: CodeReviewStatus;
	perPage: number;
}

export function CodeReviewsTable({ asReviewer, asDeveloper }: CodeReviewsTableProps) {
	const router = useRouter();
	const [filters, setFilters] = useState<CodeReviewFilters>({
		asReviewer,
		asDeveloper,
		perPage: 15,
	});
	const [approveDialogOpen, setApproveDialogOpen] = useState(false);
	const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
	const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null);
	const [revisionSuggestions, setRevisionSuggestions] = useState("");

	const { data, isLoading, error } = useCodeReviews(filters);
	const approveMutation = useApproveCodeReview();
	const revisionMutation = useRequestRevision();

	const { canApproveCodeReviews } = usePermissions();

	const handleView = (review: CodeReview) => {
		router.push(`/dashboard/performance/code-reviews/${review.reviewId}`);
	};

	const handleApprove = async () => {
		if (!selectedReview) return;

		try {
			await approveMutation.mutateAsync(selectedReview.reviewId);
			toast.success("Code review approved successfully");
			setApproveDialogOpen(false);
			setSelectedReview(null);
		} catch {
			toast.error("Failed to approve code review");
		}
	};

	const handleRequestRevision = async () => {
		if (!selectedReview || !revisionSuggestions.trim()) return;

		try {
			await revisionMutation.mutateAsync({
				id: selectedReview.reviewId,
				suggestions: revisionSuggestions,
			});
			toast.success("Revision requested successfully");
			setRevisionDialogOpen(false);
			setSelectedReview(null);
			setRevisionSuggestions("");
		} catch {
			toast.error("Failed to request revision");
		}
	};

	const openApproveDialog = (review: CodeReview) => {
		setSelectedReview(review);
		setApproveDialogOpen(true);
	};

	const openRevisionDialog = (review: CodeReview) => {
		setSelectedReview(review);
		setRevisionDialogOpen(true);
	};

	const handleStatusFilter = (value: string) => {
		setFilters((prev) => ({
			...prev,
			status: value === "all" ? undefined : (value as CodeReviewStatus),
		}));
	};

	const columns = getCodeReviewsColumns({
		onView: handleView,
		onApprove: canApproveCodeReviews ? openApproveDialog : undefined,
		onRequestRevision: canApproveCodeReviews ? openRevisionDialog : undefined,
	});

	return (
		<>
			<DataTable
				title="Code Reviews"
				titleBadge={data?.pagination ? `${(data.pagination as { total: number }).total} reviews` : undefined}
				columns={columns}
				data={data?.items || []}
				keyExtractor={(review) => review.reviewId}
				isLoading={isLoading}
				error={error}
				onRowClick={handleView}
				emptyState={{
					icon: FileCode,
					title: "No code reviews found",
					description: "Code reviews will appear here once they are created.",
				}}
				headerActions={
					<FilterBar>
						<Select
							onValueChange={handleStatusFilter}
							defaultValue="all"
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="approved">Approved</SelectItem>
								<SelectItem value="needs_revision">Needs Revision</SelectItem>
								<SelectItem value="rejected">Rejected</SelectItem>
							</SelectContent>
						</Select>
					</FilterBar>
				}
			/>

			<ConfirmDialog
				open={approveDialogOpen}
				onOpenChange={setApproveDialogOpen}
				title="Approve Code Review"
				description={`Are you sure you want to approve the code review for "${selectedReview?.taskTitle}"?`}
				confirmLabel="Approve"
				onConfirm={handleApprove}
				isLoading={approveMutation.isPending}
			/>

			<FormDialog
				open={revisionDialogOpen}
				onOpenChange={setRevisionDialogOpen}
				title="Request Revision"
				description={`Provide suggestions for improvement for the code review of "${selectedReview?.taskTitle}".`}
				submitLabel="Request Revision"
				isLoading={revisionMutation.isPending}
				isSubmitDisabled={!revisionSuggestions.trim()}
				onSubmit={handleRequestRevision}
			>
				<Textarea
					placeholder="Enter your suggestions for improvement..."
					value={revisionSuggestions}
					onChange={(e) => setRevisionSuggestions(e.target.value)}
					rows={4}
				/>
			</FormDialog>
		</>
	);
}
