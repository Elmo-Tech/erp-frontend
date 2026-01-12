"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useChangeRequests, useChangeRequestSummary, useCreateChangeRequest, useSubmitChangeRequest, useApproveChangeRequest, useRejectChangeRequest, useImplementChangeRequest } from "../../hooks/useChangeRequests";
import { ChangeRequest, ChangeRequestStatus, ChangeRequestStatusLabels, ChangeRequestStatusColors, CreateChangeRequestPayload } from "../../types/changeRequest";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Plus, FileEdit, Clock, DollarSign, CheckCircle, XCircle, Send, Wrench } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
			toast.success("Change request created");
			setShowCreateDialog(false);
		} catch {
			toast.error("Failed to create change request");
		}
	};

	const handleSubmit = async (id: number) => {
		try {
			await submitCR.mutateAsync(id);
			toast.success("Change request submitted for review");
		} catch {
			toast.error("Failed to submit change request");
		}
	};

	const handleApprove = async (id: number) => {
		try {
			await approveCR.mutateAsync({ id, approvedCost });
			toast.success("Change request approved");
			setSelectedCR(null);
		} catch {
			toast.error("Failed to approve change request");
		}
	};

	const handleReject = async () => {
		if (!selectedCR || !rejectReason) return;
		try {
			await rejectCR.mutateAsync({ id: selectedCR.changeRequestId, reason: rejectReason });
			toast.success("Change request rejected");
			setShowRejectDialog(false);
			setSelectedCR(null);
			setRejectReason("");
		} catch {
			toast.error("Failed to reject change request");
		}
	};

	const handleImplement = async (id: number) => {
		try {
			await implementCR.mutateAsync(id);
			toast.success("Change request marked as implemented");
		} catch {
			toast.error("Failed to mark as implemented");
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
			{summary && (
				<div className="grid gap-4 md:grid-cols-5">
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<FileEdit className="h-4 w-4" />
								Total
							</div>
							<p className="text-2xl font-bold">{summary.total}</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-2 text-yellow-600 text-sm">
								<Clock className="h-4 w-4" />
								Pending
							</div>
							<p className="text-2xl font-bold">{summary.pending}</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-2 text-green-600 text-sm">
								<CheckCircle className="h-4 w-4" />
								Approved
							</div>
							<p className="text-2xl font-bold">{summary.approved}</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-2 text-blue-600 text-sm">
								<Wrench className="h-4 w-4" />
								Implemented
							</div>
							<p className="text-2xl font-bold">{summary.implemented}</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<DollarSign className="h-4 w-4" />
								Approved Cost
							</div>
							<p className="text-2xl font-bold">${summary.totalApprovedCost}</p>
						</CardContent>
					</Card>
				</div>
			)}

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
						<Card
							key={cr.changeRequestId}
							className="hover:shadow-md transition-shadow cursor-pointer"
							onClick={() => setSelectedCR(cr)}
						>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="font-mono text-sm text-muted-foreground">{cr.crNumber}</span>
											<Badge className={cn("text-xs", ChangeRequestStatusColors[cr.status])}>{ChangeRequestStatusLabels[cr.status]}</Badge>
											{cr.isBillable && <Badge variant="outline">Billable</Badge>}
										</div>
										<h4 className="font-medium">{cr.title}</h4>
										<p className="text-sm text-muted-foreground line-clamp-1">{cr.description}</p>
									</div>
									<div className="text-right text-sm">
										<p className="font-medium">${cr.estimatedCost}</p>
										<p className="text-muted-foreground">{cr.estimatedHours}h estimated</p>
									</div>
								</div>
								<div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
									<span>By {cr.requester?.name || "Unknown"}</span>
									<span>{format(new Date(cr.createdAt), "MMM d, yyyy")}</span>
								</div>
							</CardContent>
						</Card>
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

			{/* Create Dialog */}
			<CreateCRDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				onSubmit={handleCreate}
				isLoading={createCR.isPending}
			/>

			{/* Detail Dialog */}
			{selectedCR && (
				<Dialog
					open={!!selectedCR}
					onOpenChange={() => setSelectedCR(null)}
				>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<span className="font-mono text-muted-foreground">{selectedCR.crNumber}</span>
								{selectedCR.title}
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<Badge className={cn(ChangeRequestStatusColors[selectedCR.status])}>{ChangeRequestStatusLabels[selectedCR.status]}</Badge>
								{selectedCR.isBillable && <Badge variant="outline">Billable</Badge>}
							</div>
							<div>
								<Label className="text-muted-foreground">Description</Label>
								<p className="mt-1">{selectedCR.description}</p>
							</div>
							{selectedCR.impactAnalysis && (
								<div>
									<Label className="text-muted-foreground">Impact Analysis</Label>
									<p className="mt-1">{selectedCR.impactAnalysis}</p>
								</div>
							)}
							<div className="grid grid-cols-3 gap-4">
								<div>
									<Label className="text-muted-foreground">Estimated Hours</Label>
									<p className="font-medium">{selectedCR.estimatedHours}h</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Estimated Cost</Label>
									<p className="font-medium">${selectedCR.estimatedCost}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Additional Days</Label>
									<p className="font-medium">{selectedCR.additionalDays || 0} days</p>
								</div>
							</div>
							{selectedCR.approvedCost !== null && (
								<div>
									<Label className="text-muted-foreground">Approved Cost</Label>
									<p className="font-medium text-green-600">${selectedCR.approvedCost}</p>
								</div>
							)}
							{selectedCR.rejectionReason && (
								<div className="p-3 bg-red-50 rounded-lg">
									<Label className="text-red-600">Rejection Reason</Label>
									<p className="mt-1 text-red-700">{selectedCR.rejectionReason}</p>
								</div>
							)}
						</div>
						<DialogFooter className="gap-2">
							{selectedCR.status === ChangeRequestStatus.DRAFT && (
								<Button
									onClick={() => handleSubmit(selectedCR.changeRequestId)}
									disabled={submitCR.isPending}
								>
									<Send className="h-4 w-4 mr-2" />
									Submit for Review
								</Button>
							)}
							{selectedCR.status === ChangeRequestStatus.PENDING && canApproveChangeRequests && (
								<>
									<div className="flex items-center gap-2 mr-auto">
										<Label>Approved Cost:</Label>
										<Input
											type="number"
											className="w-32"
											placeholder={selectedCR.estimatedCost.toString()}
											value={approvedCost || ""}
											onChange={(e) => setApprovedCost(e.target.value ? Number(e.target.value) : undefined)}
										/>
									</div>
									<Button
										variant="destructive"
										onClick={() => setShowRejectDialog(true)}
									>
										<XCircle className="h-4 w-4 mr-2" />
										Reject
									</Button>
									<Button
										onClick={() => handleApprove(selectedCR.changeRequestId)}
										disabled={approveCR.isPending}
									>
										<CheckCircle className="h-4 w-4 mr-2" />
										Approve
									</Button>
								</>
							)}
							{selectedCR.status === ChangeRequestStatus.APPROVED && (
								<Button
									onClick={() => handleImplement(selectedCR.changeRequestId)}
									disabled={implementCR.isPending}
								>
									<Wrench className="h-4 w-4 mr-2" />
									Mark Implemented
								</Button>
							)}
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Reject Dialog */}
			<Dialog
				open={showRejectDialog}
				onOpenChange={setShowRejectDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Change Request</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">Please provide a reason for rejection:</p>
						<Textarea
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							placeholder="Rejection reason..."
							rows={3}
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowRejectDialog(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleReject}
							disabled={rejectCR.isPending || !rejectReason}
						>
							{rejectCR.isPending ? "Rejecting..." : "Reject"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

// Create CR Dialog Component
function CreateCRDialog({ open, onOpenChange, onSubmit, isLoading }: { open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (payload: CreateChangeRequestPayload) => void; isLoading: boolean }) {
	const [formData, setFormData] = useState<CreateChangeRequestPayload>({
		title: "",
		description: "",
		impactAnalysis: "",
		isBillable: true,
		estimatedHours: 0,
		estimatedCost: 0,
		additionalDays: 0,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>New Change Request</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div>
						<Label htmlFor="title">Title *</Label>
						<Input
							id="title"
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							required
						/>
					</div>
					<div>
						<Label htmlFor="description">Description *</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							rows={3}
							required
						/>
					</div>
					<div>
						<Label htmlFor="impact">Impact Analysis</Label>
						<Textarea
							id="impact"
							value={formData.impactAnalysis}
							onChange={(e) => setFormData({ ...formData, impactAnalysis: e.target.value })}
							rows={2}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="hours">Estimated Hours *</Label>
							<Input
								id="hours"
								type="number"
								min="0"
								step="0.5"
								value={formData.estimatedHours}
								onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
								required
							/>
						</div>
						<div>
							<Label htmlFor="cost">Estimated Cost *</Label>
							<Input
								id="cost"
								type="number"
								min="0"
								value={formData.estimatedCost}
								onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
								required
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="days">Additional Days</Label>
							<Input
								id="days"
								type="number"
								min="0"
								value={formData.additionalDays}
								onChange={(e) => setFormData({ ...formData, additionalDays: Number(e.target.value) })}
							/>
						</div>
						<div className="flex items-center gap-2 pt-6">
							<Switch
								id="billable"
								checked={formData.isBillable}
								onCheckedChange={(checked) => setFormData({ ...formData, isBillable: checked })}
							/>
							<Label htmlFor="billable">Billable</Label>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
