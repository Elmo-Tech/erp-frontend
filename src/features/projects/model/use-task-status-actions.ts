"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
	ExecutionTaskStatus,
	ExecutionTaskStatusLabels,
	useCompleteTask,
	useUpdateTaskStatus,
	type ProjectTask,
} from "../api/execution.api";
import { getAllowedTaskStatusOptions, getPrimaryTaskAction, type TaskExecutionAccess } from "./task-execution-rules";

const REOPEN_LOCKED_STATUSES: readonly string[] = [ExecutionTaskStatus.QA, ExecutionTaskStatus.DONE];
const REOPEN_TARGET_STATUSES: readonly string[] = [ExecutionTaskStatus.TO_DO, ExecutionTaskStatus.IN_PROGRESS, ExecutionTaskStatus.BACKLOG];

function taskStatusLabel(status: string): string {
	return ExecutionTaskStatusLabels[status as keyof typeof ExecutionTaskStatusLabels] ?? status;
}

function requiresReopenReason(currentStatus: string, nextStatus: string): boolean {
	return REOPEN_LOCKED_STATUSES.includes(currentStatus) && REOPEN_TARGET_STATUSES.includes(nextStatus);
}

interface UseTaskStatusActionsParams {
	task: ProjectTask | null;
	projectId: number;
	taskExecutionAccess: TaskExecutionAccess;
	onTaskCompleted: () => void;
}

export function useTaskStatusActions({ task, projectId, taskExecutionAccess, onTaskCompleted }: UseTaskStatusActionsParams) {
	const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
	const [pendingStatus, setPendingStatus] = useState<string | null>(null);
	const [reopenReason, setReopenReason] = useState("");
	const completeTask = useCompleteTask();
	const updateStatus = useUpdateTaskStatus();

	const allowedStatusOptions = useMemo(
		() =>
			task
				? getAllowedTaskStatusOptions({
						...taskExecutionAccess,
						taskStatus: task.status,
						taskAssigneeId: task.assigneeId,
					})
				: [],
		[task, taskExecutionAccess],
	);

	const primaryAction = useMemo(
		() =>
			task
				? getPrimaryTaskAction({
						...taskExecutionAccess,
						taskStatus: task.status,
						taskAssigneeId: task.assigneeId,
					})
				: null,
		[task, taskExecutionAccess],
	);

	const closeReopenDialog = useCallback(() => {
		setIsReopenDialogOpen(false);
		setPendingStatus(null);
		setReopenReason("");
	}, []);

	const changeStatus = useCallback(
		(nextStatus: string) => {
			if (!task) return;

			if (requiresReopenReason(task.status, nextStatus)) {
				setPendingStatus(nextStatus);
				setReopenReason("");
				setIsReopenDialogOpen(true);
				return;
			}

			updateStatus.mutate(
				{ projectId, taskId: task.taskId, status: nextStatus },
				{
					onSuccess: () => toast.success(`Status updated to ${taskStatusLabel(nextStatus)}.`),
					onError: () => toast.error("Failed to update status."),
				},
			);
		},
		[projectId, task, updateStatus],
	);

	const confirmReopen = useCallback(() => {
		if (!task || !pendingStatus) return;
		if (!reopenReason.trim()) {
			toast.error("Please provide a reason for reopening this task.");
			return;
		}

		updateStatus.mutate(
			{ projectId, taskId: task.taskId, status: pendingStatus, reason: reopenReason.trim() },
			{
				onSuccess: () => {
					toast.success(`Task reopened — status set to ${taskStatusLabel(pendingStatus)}.`);
					closeReopenDialog();
				},
				onError: () => toast.error("Failed to reopen task."),
			},
		);
	}, [closeReopenDialog, pendingStatus, projectId, reopenReason, task, updateStatus]);

	const completePrimaryAction = useCallback(
		(selectedTask: ProjectTask) => {
			completeTask.mutate(
				{ projectId, taskId: selectedTask.taskId },
				{
					onSuccess: () => {
						toast.success("Task marked as done.");
						onTaskCompleted();
					},
					onError: () => toast.error("Failed to complete task."),
				},
			);
		},
		[completeTask, onTaskCompleted, projectId],
	);

	const submitPrimaryActionForReview = useCallback(
		(selectedTask: ProjectTask, targetStatus: string) => {
			updateStatus.mutate(
				{ projectId, taskId: selectedTask.taskId, status: targetStatus },
				{
					onSuccess: () => toast.success("Task submitted for review."),
					onError: () => toast.error("Failed to submit task for review."),
				},
			);
		},
		[projectId, updateStatus],
	);

	const runPrimaryAction = useCallback(() => {
		if (!task || !primaryAction) return;

		if (primaryAction.useCompleteEndpoint) {
			completePrimaryAction(task);
			return;
		}

		submitPrimaryActionForReview(task, primaryAction.targetStatus);
	}, [completePrimaryAction, primaryAction, submitPrimaryActionForReview, task]);

	const changeReopenDialogOpen = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				closeReopenDialog();
			}
		},
		[closeReopenDialog],
	);

	return {
		allowedStatusOptions,
		primaryAction,
		isStatusPending: updateStatus.isPending,
		isPrimaryActionSaving: completeTask.isPending || updateStatus.isPending,
		changeStatus,
		runPrimaryAction,
		reopenDialog: {
			open: isReopenDialogOpen,
			currentStatusLabel: task ? taskStatusLabel(task.status) : "",
			pendingStatusLabel: pendingStatus ? taskStatusLabel(pendingStatus) : "",
			reason: reopenReason,
			isSaving: updateStatus.isPending,
			onOpenChange: changeReopenDialogOpen,
			onReasonChange: setReopenReason,
			onCancel: closeReopenDialog,
			onConfirm: confirmReopen,
		},
	};
}
