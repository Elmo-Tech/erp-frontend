"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvaluations, useCalculateEvaluation, useApproveEvaluation } from "../hooks";
import type { PerformanceEvaluation, EvaluationStatus, BonusTier } from "../types";
import { getEvaluationsColumns } from "./columns/evaluationsColumns";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

interface EvaluationsTableProps {
	periodId?: number;
}

interface EvaluationFilters {
	periodId?: number;
	status?: EvaluationStatus;
	bonusTier?: BonusTier;
	perPage: number;
}

export function EvaluationsTable({ periodId }: EvaluationsTableProps) {
	const router = useRouter();
	const [filters, setFilters] = useState<EvaluationFilters>({
		periodId,
		perPage: 15,
	});
	const [approveDialogOpen, setApproveDialogOpen] = useState(false);
	const [evaluationToApprove, setEvaluationToApprove] = useState<PerformanceEvaluation | null>(null);

	const { data, isLoading, error } = useEvaluations(filters);
	const calculateMutation = useCalculateEvaluation();
	const approveMutation = useApproveEvaluation();

	const { canEditEvaluations, canApproveEvaluations } = usePermissions();

	const handleView = (evaluation: PerformanceEvaluation) => {
		router.push(`/dashboard/performance/evaluations/${evaluation.evaluationId}`);
	};

	const handleCalculate = async (evaluation: PerformanceEvaluation) => {
		try {
			await calculateMutation.mutateAsync(evaluation.evaluationId);
			toast.success("Evaluation score calculated successfully");
		} catch {
			toast.error("Failed to calculate evaluation score");
		}
	};

	const handleApprove = async () => {
		if (!evaluationToApprove) return;

		try {
			await approveMutation.mutateAsync({ id: evaluationToApprove.evaluationId });
			toast.success("Evaluation approved successfully");
			setApproveDialogOpen(false);
			setEvaluationToApprove(null);
		} catch {
			toast.error("Failed to approve evaluation");
		}
	};

	const openApproveDialog = (evaluation: PerformanceEvaluation) => {
		setEvaluationToApprove(evaluation);
		setApproveDialogOpen(true);
	};

	const handleStatusFilter = (value: string) => {
		setFilters((prev) => ({
			...prev,
			status: value === "all" ? undefined : (value as EvaluationStatus),
		}));
	};

	const handleTierFilter = (value: string) => {
		setFilters((prev) => ({
			...prev,
			bonusTier: value === "all" ? undefined : (value as BonusTier),
		}));
	};

	const columns = getEvaluationsColumns({
		onView: handleView,
		onCalculate: canEditEvaluations ? handleCalculate : undefined,
		onApprove: canApproveEvaluations ? openApproveDialog : undefined,
	});

	return (
		<>
			<DataTable
				title="Performance Evaluations"
				titleBadge={data?.pagination ? `${(data.pagination as { total: number }).total} evaluations` : undefined}
				columns={columns}
				data={data?.evaluations || []}
				keyExtractor={(evaluation) => evaluation.evaluationId}
				isLoading={isLoading}
				error={error}
				onRowClick={handleView}
				emptyState={{
					icon: ClipboardList,
					title: "No evaluations found",
					description: "Evaluations will appear here once an evaluation period is activated.",
				}}
				headerActions={
					<FilterBar>
						<Select
							onValueChange={handleStatusFilter}
							defaultValue="all"
						>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="in_progress">In Progress</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="approved">Approved</SelectItem>
							</SelectContent>
						</Select>
						<Select
							onValueChange={handleTierFilter}
							defaultValue="all"
						>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Tier" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Tiers</SelectItem>
								<SelectItem value="excellent">Excellent</SelectItem>
								<SelectItem value="good">Good</SelectItem>
								<SelectItem value="average">Average</SelectItem>
								<SelectItem value="poor">Poor</SelectItem>
							</SelectContent>
						</Select>
					</FilterBar>
				}
			/>

			<ConfirmDialog
				open={approveDialogOpen}
				onOpenChange={setApproveDialogOpen}
				title="Approve Evaluation"
				description={`Are you sure you want to approve the evaluation for ${evaluationToApprove?.userName}? This action cannot be undone.`}
				confirmLabel="Approve"
				onConfirm={handleApprove}
				isLoading={approveMutation.isPending}
			/>
		</>
	);
}
