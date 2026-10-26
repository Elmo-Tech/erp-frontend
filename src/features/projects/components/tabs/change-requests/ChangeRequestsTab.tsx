/**
 * Change Requests Tab Component
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useChangeRequests, useChangeRequestSummary, useCreateChangeRequest, useSubmitChangeRequest, useApproveChangeRequest, useRejectChangeRequest, useImplementChangeRequest } from "../../../hooks/useChangeRequests";
import { ChangeRequest, CreateChangeRequestPayload } from "../../../types/changeRequest";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Plus, FileEdit } from "lucide-react";
import { notifyApiError } from "@/lib/errorHandling";

import { SummaryCards } from "./SummaryCards";
import { ChangeRequestCard } from "./ChangeRequestCard";
import { CreateCRDialog } from "./CreateCRDialog";
import { CRDetailDialog } from "./CRDetailDialog";
import { RejectDialog } from "./RejectDialog";

interface ChangeRequestsTabProps {
	projectId: number;
}

export function ChangeRequestsTab({ projectId }: ChangeRequestsTabProps) {
	const [page, setPage] = useState(1);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [selectedCR, setSelectedCR] = useState<ChangeRequest | null>(null);
	const [rejectReason, setRejectReason] = useState("");
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [approvedCost, setApprovedCost] = useState<number | undefined>();

	const { data, isLoading } = useChangeRequests(projectId, page);
	const { data: summary } = useChangeRequestSummary(projectId);
	const createCR = useCreateChangeRequest();
	const submitCR = useSubmitChangeRequest();
	const approveCR = useApproveChangeRequest();
	const rejectCR = useRejectChangeRequest();
	const implementCR = useImplementChangeRequest();

	const { canCreateChangeRequests, canApproveChangeRequests } = usePermissions();

	const handleCreate = async (payload: CreateChangeRequestPayload) => {
		try {
			await createCR.mutateAsync({ projectId, payload });
			setShowCreateDialog(false);
		} catch (error) {
			notifyApiError(error);
		}
	};

	const handleSubmit = async (id: number) => {
		try {
			await submitCR.mutateAsync(id);
		} catch (error) {
			notifyApiError(error);
		}
	};

	const handleApprove = async (id: number) => {
		try {
			await approveCR.mutateAsync({ id, approvedCost });
			setSelectedCR(null);
		} catch (error) {
			notifyApiError(error);
		}
	};

	const handleReject = async () => {
		if (!selectedCR || !rejectReason) return;
		try {
			await rejectCR.mutateAsync({ id: selectedCR.changeRequestId, reason: rejectReason });
			setShowRejectDialog(false);
			setSelectedCR(null);
			setRejectReason("");
		} catch (error) {
			notifyApiError(error);
		}
	};

	const handleImplement = async (id: number) => {
		try {
			await implementCR.mutateAsync(id);
		} catch (error) {
			notifyApiError(error);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			{summary && <SummaryCards summary={summary} />}

			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Change Requests</h3>
				{canCreateChangeRequests && (
					<Button
						onClick={() => setShowCreateDialog(true)}
						size="sm"
					>
						<Plus className="h-4 w-4 mr-2" />
						New CR
					</Button>
				)}
			</div>

			{/* CR List */}
			{data?.changeRequests && data.changeRequests.length > 0 ? (
				<div className="space-y-3">
					{data.changeRequests.map((cr) => (
						<ChangeRequestCard
							key={cr.changeRequestId}
							cr={cr}
							onClick={() => setSelectedCR(cr)}
						/>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="py-12 text-center">
						<FileEdit className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
						<p className="text-muted-foreground">No change requests yet</p>
						{canCreateChangeRequests && (
							<Button
								variant="link"
								onClick={() => setShowCreateDialog(true)}
							>
								Create the first one
							</Button>
						)}
					</CardContent>
				</Card>
			)}

			{/* Pagination */}
			{data?.pagination && data.pagination.totalPages > 1 && (
				<div className="flex justify-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						Previous
					</Button>
					<span className="py-2 px-4 text-sm">
						Page {page} of {data.pagination.totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => p + 1)}
						disabled={page === data.pagination.totalPages}
					>
						Next
					</Button>
				</div>
			)}

			{/* Dialogs */}
			<CreateCRDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				onSubmit={handleCreate}
				isLoading={createCR.isPending}
			/>

			<CRDetailDialog
				cr={selectedCR}
				onClose={() => setSelectedCR(null)}
				onSubmit={handleSubmit}
				onApprove={handleApprove}
				onReject={() => setShowRejectDialog(true)}
				onImplement={handleImplement}
				approvedCost={approvedCost}
				onApprovedCostChange={setApprovedCost}
				canApprove={canApproveChangeRequests}
				isSubmitting={submitCR.isPending}
				isApproving={approveCR.isPending}
				isImplementing={implementCR.isPending}
			/>

			<RejectDialog
				open={showRejectDialog}
				onOpenChange={setShowRejectDialog}
				reason={rejectReason}
				onReasonChange={setRejectReason}
				onConfirm={handleReject}
				isLoading={rejectCR.isPending}
			/>
		</div>
	);
}
