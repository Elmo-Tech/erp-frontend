"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-display/DataTable";
import { ConfirmDialog, FormDialog } from "@/shared/ui";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { DatePicker } from "@/shared/ui/forms/DatePicker";
import { useEvaluationPeriods, useCreateEvaluationPeriod, useActivateEvaluationPeriod } from "../hooks";
import type { EvaluationPeriod } from "../types";
import { getEvaluationPeriodsColumns } from "./columns/evaluationPeriodsColumns";
import { Calendar, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/_old/features/admin/hooks/usePermissions";

export function EvaluationPeriodsTable() {
	const router = useRouter();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [activateDialogOpen, setActivateDialogOpen] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState<EvaluationPeriod | null>(null);
	const [newPeriod, setNewPeriod] = useState({
		name: "",
		startDate: "",
		endDate: "",
	});

	const { data, isLoading, error } = useEvaluationPeriods();
	const createMutation = useCreateEvaluationPeriod();
	const activateMutation = useActivateEvaluationPeriod();

	const { canCreateEvaluations, canEditEvaluations, canViewBonuses } = usePermissions();

	const handleView = (period: EvaluationPeriod) => {
		router.push(`/dashboard/performance/periods/${period.periodId}`);
	};

	const handleViewBonuses = (period: EvaluationPeriod) => {
		router.push(`/dashboard/performance/periods/${period.periodId}/bonuses`);
	};

	const handleCreate = async () => {
		if (!newPeriod.name || !newPeriod.startDate || !newPeriod.endDate) {
			toast.error("Please fill in all fields");
			return;
		}

		try {
			await createMutation.mutateAsync(newPeriod);
			toast.success("Evaluation period created successfully");
			setCreateDialogOpen(false);
			setNewPeriod({ name: "", startDate: "", endDate: "" });
		} catch {
			toast.error("Failed to create evaluation period");
		}
	};

	const handleActivate = async () => {
		if (!selectedPeriod) return;

		try {
			await activateMutation.mutateAsync(selectedPeriod.periodId);
			toast.success("Evaluation period activated successfully");
			setActivateDialogOpen(false);
			setSelectedPeriod(null);
		} catch {
			toast.error("Failed to activate evaluation period");
		}
	};

	const openActivateDialog = (period: EvaluationPeriod) => {
		setSelectedPeriod(period);
		setActivateDialogOpen(true);
	};

	const columns = getEvaluationPeriodsColumns({
		onView: handleView,
		onActivate: canEditEvaluations ? openActivateDialog : undefined,
		onViewBonuses: canViewBonuses ? handleViewBonuses : undefined,
	});

	return (
		<>
			<DataTable
				title="Evaluation Periods"
				titleBadge={data?.pagination ? `${(data.pagination as { total: number }).total} periods` : undefined}
				columns={columns}
				data={data?.periods || []}
				keyExtractor={(period) => period.periodId}
				isLoading={isLoading}
				error={error}
				onRowClick={handleView}
				emptyState={{
					icon: Calendar,
					title: "No evaluation periods found",
					description: "Create your first evaluation period to start tracking performance.",
					action: canCreateEvaluations ? { label: "Create Period", onClick: () => setCreateDialogOpen(true) } : undefined,
				}}
				headerActions={
					canCreateEvaluations ? (
						<Button onClick={() => setCreateDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create Period
						</Button>
					) : undefined
				}
			/>

			{/* Create Period Dialog */}
			<FormDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				title="Create Evaluation Period"
				description="Create a new evaluation period for performance reviews."
				submitLabel="Create"
				isLoading={createMutation.isPending}
				onSubmit={handleCreate}
			>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Period Name</Label>
						<Input
							id="name"
							placeholder="e.g., Q1 2026"
							value={newPeriod.name}
							onChange={(e) => setNewPeriod((prev) => ({ ...prev, name: e.target.value }))}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="startDate">Start Date</Label>
							<DatePicker
								value={newPeriod.startDate}
								onChange={(value) => setNewPeriod((prev) => ({ ...prev, startDate: value }))}
								placeholder="Select start date"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="endDate">End Date</Label>
							<DatePicker
								value={newPeriod.endDate}
								onChange={(value) => setNewPeriod((prev) => ({ ...prev, endDate: value }))}
								placeholder="Select end date"
							/>
						</div>
					</div>
				</div>
			</FormDialog>

			{/* Activate Period Dialog */}
			<ConfirmDialog
				open={activateDialogOpen}
				onOpenChange={setActivateDialogOpen}
				title="Activate Evaluation Period"
				description={`Are you sure you want to activate "${selectedPeriod?.name}"? This will create evaluations for all employees and cannot be undone.`}
				confirmLabel="Activate"
				onConfirm={handleActivate}
				isLoading={activateMutation.isPending}
			/>
		</>
	);
}
