"use client";

import { useState } from "react";
import { CalendarOff, Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Can } from "@/shared/ui/Can";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { LeaveRequestFormModal } from "@/features/hr/ui/LeaveRequestFormModal";
import { useLeaveRequests, useUpdateLeaveRequest, useDeleteLeaveRequest } from "@/features/hr/model/use-hr-actions";
import type { LeaveRequest, LeaveStatus } from "@/entities/hr/model/types";
import { LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS } from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<LeaveStatus, "default" | "secondary" | "destructive" | "outline"> = {
	pending: "secondary",
	approved: "default",
	rejected: "destructive",
};

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(onEdit: (lr: LeaveRequest) => void, onDelete: (lr: LeaveRequest) => void, onApprove: (lr: LeaveRequest) => void, onReject: (lr: LeaveRequest) => void): Column<LeaveRequest>[] {
	return [
		{
			key: "employee",
			header: "Employee",
			render: (lr) => (
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">{lr.user?.name ?? "—"}</p>
					<p className="truncate text-xs text-muted-foreground">{lr.user?.email ?? "—"}</p>
				</div>
			),
		},
		{
			key: "type",
			header: "Type",
			render: (lr) => (
				<Badge
					variant="outline"
					className="text-xs"
				>
					{LEAVE_TYPE_LABELS[lr.type]}
				</Badge>
			),
		},
		{
			key: "dates",
			header: "Dates",
			render: (lr) => (
				<div className="text-sm">
					<span className="tabular-nums">{lr.startDate}</span>
					{lr.startDate !== lr.endDate && (
						<>
							<span className="mx-1 text-muted-foreground">→</span>
							<span className="tabular-nums">{lr.endDate}</span>
						</>
					)}
					<span className="ml-2 text-xs text-muted-foreground">({lr.durationDays}d)</span>
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			render: (lr) => (
				<Badge
					variant={STATUS_VARIANT[lr.status]}
					className="text-xs"
				>
					{LEAVE_STATUS_LABELS[lr.status]}
				</Badge>
			),
		},
		{
			key: "reason",
			header: "Reason",
			render: (lr) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-48">{lr.reason ?? "—"}</span>,
		},
		{
			key: "actions",
			header: "",
			className: "text-right",
			render: (lr) => (
				<Can permission="manage_hr">
					<div className="flex items-center justify-end gap-1">
						{/* Quick approve / reject for pending requests */}
						{lr.status === "pending" && (
							<>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-green-600 hover:text-green-700"
									title="Approve"
									onClick={(e) => {
										e.stopPropagation();
										onApprove(lr);
									}}
								>
									<CheckCircle className="h-3.5 w-3.5" />
									<span className="sr-only">Approve</span>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-destructive hover:text-destructive"
									title="Reject"
									onClick={(e) => {
										e.stopPropagation();
										onReject(lr);
									}}
								>
									<XCircle className="h-3.5 w-3.5" />
									<span className="sr-only">Reject</span>
								</Button>
							</>
						)}
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(lr);
							}}
						>
							<Pencil className="h-3.5 w-3.5" />
							<span className="sr-only">Edit</span>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(lr);
							}}
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span className="sr-only">Delete</span>
						</Button>
					</div>
				</Can>
			),
		},
	];
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function LeaveRequestsWidget() {
	const { data, isLoading, error } = useLeaveRequests();
	const updateLeaveRequest = useUpdateLeaveRequest();
	const deleteLeaveRequest = useDeleteLeaveRequest();

	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<LeaveRequest | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<LeaveRequest | null>(null);

	const leaveRequests = data?.data ?? [];

	const handleCreate = () => {
		setEditTarget(null);
		setFormOpen(true);
	};

	const handleEdit = (lr: LeaveRequest) => {
		setEditTarget(lr);
		setFormOpen(true);
	};

	const handleCloseForm = () => {
		setFormOpen(false);
		setEditTarget(null);
	};

	const handleApprove = async (lr: LeaveRequest) => {
		try {
			await updateLeaveRequest.mutateAsync({ id: lr.id, payload: { status: "approved" } });
			toast.success(`Leave request for ${lr.user?.name ?? "employee"} approved`);
		} catch {
			toast.error("Failed to approve leave request");
		}
	};

	const handleReject = async (lr: LeaveRequest) => {
		try {
			await updateLeaveRequest.mutateAsync({ id: lr.id, payload: { status: "rejected" } });
			toast.success(`Leave request for ${lr.user?.name ?? "employee"} rejected`);
		} catch {
			toast.error("Failed to reject leave request");
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return;
		try {
			await deleteLeaveRequest.mutateAsync(deleteTarget.id);
			toast.success("Leave request deleted");
			setDeleteTarget(null);
		} catch {
			toast.error("Failed to delete leave request");
		}
	};

	const columns = buildColumns(handleEdit, setDeleteTarget, handleApprove, handleReject);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Leave Requests</h1>
					<p className="text-sm text-muted-foreground">Review, approve, or reject employee leave requests.</p>
				</div>
				<Can permission="manage_hr">
					<Button
						size="sm"
						className="gap-2 shrink-0"
						onClick={handleCreate}
					>
						<Plus className="h-4 w-4" />
						New Request
					</Button>
				</Can>
			</div>

			<DataTable<LeaveRequest>
				title="All Leave Requests"
				titleBadge={leaveRequests.length > 0 ? String(leaveRequests.length) : undefined}
				columns={columns}
				data={leaveRequests}
				keyExtractor={(lr) => lr.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: CalendarOff,
					title: "No leave requests",
					description: "No leave requests have been submitted yet.",
					action: { label: "New Request", onClick: handleCreate },
				}}
			/>

			<LeaveRequestFormModal
				open={formOpen}
				onClose={handleCloseForm}
				editTarget={editTarget}
			/>

			<ConfirmDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				title="Delete Leave Request"
				description="Delete this leave request? This action cannot be undone."
				confirmLabel="Delete"
				variant="destructive"
				isLoading={deleteLeaveRequest.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</section>
	);
}
