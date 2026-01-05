"use client";

import { useState } from "react";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInnovationLogs, useVerifyInnovationLog, useRejectInnovationLog, useDeleteInnovationLog } from "../hooks";
import type { InnovationLog, InnovationCategory, ImpactLevel } from "../types";
import { getInnovationLogsColumns } from "./columns/innovationLogsColumns";
import { InnovationLogForm } from "./InnovationLogForm";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

interface InnovationLogsFilters {
	category?: InnovationCategory;
	impactLevel?: ImpactLevel;
	isVerified?: boolean;
	perPage: number;
}

export function InnovationLogsTable() {
	const [filters, setFilters] = useState<InnovationLogsFilters>({
		perPage: 15,
	});
	const [selectedLog, setSelectedLog] = useState<InnovationLog | null>(null);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const { data, isLoading, error } = useInnovationLogs(filters);
	const verifyMutation = useVerifyInnovationLog();
	const rejectMutation = useRejectInnovationLog();
	const deleteMutation = useDeleteInnovationLog();

	const { canVerifyInnovationLogs, canCreateInnovationLogs } = usePermissions();

	const handleView = (log: InnovationLog) => {
		setSelectedLog(log);
		setViewDialogOpen(true);
	};

	const handleVerify = async () => {
		if (!selectedLog) return;

		try {
			await verifyMutation.mutateAsync(selectedLog.logId);
			toast.success("Innovation log verified successfully");
			setVerifyDialogOpen(false);
			setSelectedLog(null);
		} catch {
			toast.error("Failed to verify innovation log");
		}
	};

	const handleReject = async () => {
		if (!selectedLog) return;

		try {
			await rejectMutation.mutateAsync(selectedLog.logId);
			toast.success("Innovation log rejected");
			setRejectDialogOpen(false);
			setSelectedLog(null);
		} catch {
			toast.error("Failed to reject innovation log");
		}
	};

	const handleDelete = async () => {
		if (!selectedLog) return;

		try {
			await deleteMutation.mutateAsync(selectedLog.logId);
			toast.success("Innovation log deleted");
			setDeleteDialogOpen(false);
			setSelectedLog(null);
		} catch {
			toast.error("Failed to delete innovation log");
		}
	};

	const openVerifyDialog = (log: InnovationLog) => {
		setSelectedLog(log);
		setVerifyDialogOpen(true);
	};

	const openRejectDialog = (log: InnovationLog) => {
		setSelectedLog(log);
		setRejectDialogOpen(true);
	};

	const openDeleteDialog = (log: InnovationLog) => {
		setSelectedLog(log);
		setDeleteDialogOpen(true);
	};

	const handleCategoryFilter = (value: string) => {
		setFilters((prev) => ({
			...prev,
			category: value === "all" ? undefined : (value as InnovationCategory),
		}));
	};

	const handleImpactFilter = (value: string) => {
		setFilters((prev) => ({
			...prev,
			impactLevel: value === "all" ? undefined : (value as ImpactLevel),
		}));
	};

	const handleVerifiedFilter = (value: string) => {
		setFilters((prev) => ({
			...prev,
			isVerified: value === "all" ? undefined : value === "verified",
		}));
	};

	const columns = getInnovationLogsColumns({
		onView: handleView,
		onVerify: canVerifyInnovationLogs ? openVerifyDialog : undefined,
		onReject: canVerifyInnovationLogs ? openRejectDialog : undefined,
		onDelete: openDeleteDialog,
	});

	return (
		<>
			<DataTable
				title="Innovation Logs"
				titleBadge={data?.pagination ? `${(data.pagination as { total: number }).total} logs` : undefined}
				columns={columns}
				data={data?.innovationLogs || []}
				keyExtractor={(log) => log.logId}
				isLoading={isLoading}
				error={error}
				onRowClick={handleView}
				emptyState={{
					icon: Lightbulb,
					title: "No innovation logs found",
					description: "Start logging your use of AI tools and new technologies.",
					action: canCreateInnovationLogs ? { label: "Log Innovation", onClick: () => {} } : undefined,
				}}
				headerActions={
					<FilterBar actions={canCreateInnovationLogs ? <InnovationLogForm /> : undefined}>
						<Select
							onValueChange={handleCategoryFilter}
							defaultValue="all"
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								<SelectItem value="ai_tool">AI Tool</SelectItem>
								<SelectItem value="automation">Automation</SelectItem>
								<SelectItem value="new_tech">New Technology</SelectItem>
								<SelectItem value="process_improvement">Process Improvement</SelectItem>
							</SelectContent>
						</Select>
						<Select
							onValueChange={handleImpactFilter}
							defaultValue="all"
						>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Impact" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Impact</SelectItem>
								<SelectItem value="low">Low</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="high">High</SelectItem>
							</SelectContent>
						</Select>
						<Select
							onValueChange={handleVerifiedFilter}
							defaultValue="all"
						>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="verified">Verified</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
							</SelectContent>
						</Select>
					</FilterBar>
				}
			/>

			{/* View Dialog */}
			<Dialog
				open={viewDialogOpen}
				onOpenChange={setViewDialogOpen}
			>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>{selectedLog?.toolName}</DialogTitle>
						<DialogDescription>Innovation log details</DialogDescription>
					</DialogHeader>
					{selectedLog && (
						<div className="space-y-4">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Employee</p>
								<p>{selectedLog.userName}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Category</p>
								<p className="capitalize">{selectedLog.category.replace("_", " ")}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Description</p>
								<p>{selectedLog.description}</p>
							</div>
							{selectedLog.impactDescription && (
								<div>
									<p className="text-sm font-medium text-muted-foreground">Impact</p>
									<p>{selectedLog.impactDescription}</p>
								</div>
							)}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Impact Level</p>
									<p className="capitalize">{selectedLog.impactLevel}</p>
								</div>
								{selectedLog.timeSavedMinutes && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Time Saved</p>
										<p>{selectedLog.timeSavedMinutes} minutes</p>
									</div>
								)}
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Status</p>
								<p>{selectedLog.isVerified ? "Verified" : "Pending Verification"}</p>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Verify Dialog */}
			<ConfirmDialog
				open={verifyDialogOpen}
				onOpenChange={setVerifyDialogOpen}
				title="Verify Innovation Log"
				description={`Are you sure you want to verify the innovation log "${selectedLog?.toolName}" by ${selectedLog?.userName}?`}
				confirmLabel="Verify"
				onConfirm={handleVerify}
				isLoading={verifyMutation.isPending}
			/>

			{/* Reject Dialog */}
			<ConfirmDialog
				open={rejectDialogOpen}
				onOpenChange={setRejectDialogOpen}
				title="Reject Innovation Log"
				description={`Are you sure you want to reject the innovation log "${selectedLog?.toolName}" by ${selectedLog?.userName}?`}
				confirmLabel="Reject"
				onConfirm={handleReject}
				variant="destructive"
				isLoading={rejectMutation.isPending}
			/>

			{/* Delete Dialog */}
			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Innovation Log"
				description={`Are you sure you want to delete the innovation log "${selectedLog?.toolName}"? This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
				variant="destructive"
				isLoading={deleteMutation.isPending}
			/>
		</>
	);
}
