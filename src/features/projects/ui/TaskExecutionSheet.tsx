"use client";

/**
 * TaskExecutionSheet — Task Control Center
 *
 * Wide tabbed sheet with 2 tabs:
 *   Tab 1 — Execution & Details: description, deliverables (subtasks removed)
 *   Tab 2 — Time Logs: time entries list + manual log dialog
 *
 * Header: title · status select · timer button
 */

import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { Sheet, SheetContent } from "@/shared/ui/sheet";

import {
	useToggleTaskTimer,
	useDeleteTimeEntry,
	ExecutionTaskStatus,
	ExecutionTaskStatusColors,
} from "../api/execution.api";
import type { ProjectTask, ProjectTimeEntry } from "../api/execution.api";
import { formatTaskMinutes } from "../model/task-execution-formatters";
import { useTaskManualTimeDialog } from "../model/use-task-manual-time-dialog";
import { useTaskStatusActions } from "../model/use-task-status-actions";
import { TaskExecutionFooter } from "./TaskExecutionFooter";
import { TaskExecutionHeader } from "./TaskExecutionHeader";
import { TaskExecutionTabs } from "./TaskExecutionTabs";
import { TaskManualTimeDialog } from "./TaskManualTimeDialog";
import { TaskReopenDialog } from "./TaskReopenDialog";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useTaskPermissions } from "@/entities/user/model/permissions";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskExecutionSheetProps {
	task: ProjectTask | null;
	projectId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const TIME_ENTRY_MANAGE_PERMISSIONS = ["manage_time_entries", "manage_all_projects"];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
	return ExecutionTaskStatusColors[status as keyof typeof ExecutionTaskStatusColors] ?? "bg-muted text-muted-foreground border-border";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function TaskExecutionSheet({ task, projectId, open, onOpenChange }: TaskExecutionSheetProps) {
	// ── Mutations ─────────────────────────────────────────────────────────────
	const toggleTimer = useToggleTaskTimer();
	const deleteTimeEntry = useDeleteTimeEntry();
	const manualTimeDialog = useTaskManualTimeDialog({ task, projectId });

	// ── PBAC: Permission flags from the auth store ────────────────────────────
	// Every access decision is driven by granular permissions.
	const currentUserId = useAuthStore((s) => s.user?.userId);

	const {
		canManageTasks,
		canEditTasks,
		canWorkOnTasks,
		canChangeTaskStatus,
		canCompleteTasks,
		canReopenTasks,
		canManageDeliverables,
		canCreateProjectTaskDeliverables,
		canEditProjectTaskDeliverables,
		canDeleteProjectTaskDeliverables,
		canToggleProjectTaskDeliverables,
	} = useTaskPermissions();

	// manage_all_projects replaces the old isGlobalAdmin bypass.
	// Users with this permission skip project-membership workflow ceilings.
	const canManageAllProjects = useAuthStore((s) => s.hasPermission("manage_all_projects"));
	const canManageTimeEntries = useAuthStore((s) => s.hasAnyPermission(TIME_ENTRY_MANAGE_PERMISSIONS));
	const canStartTimer = useAuthStore((s) => s.hasPermission("start_timer")) || canManageTimeEntries;
	const canStopTimer = useAuthStore((s) => s.hasPermission("stop_timer")) || canManageTimeEntries;
	const canLogTime = useAuthStore((s) => s.hasPermission("log_time")) || canManageTimeEntries;
	const hasEditTimeEntries = useAuthStore((s) => s.hasPermission("edit_time_entries")) || canManageTimeEntries;
	const hasDeleteTimeEntries = useAuthStore((s) => s.hasPermission("delete_time_entries")) || canManageTimeEntries;

	const taskExecutionAccess = useMemo(
		() => ({
			canManageAllProjects,
			canManageTasks,
			canWorkOnTasks,
			canChangeTaskStatus,
			canCompleteTasks,
			canReopenTasks,
			currentUserId,
			allowedActions: task?.allowedActions,
		}),
		[canManageAllProjects, canManageTasks, canWorkOnTasks, canChangeTaskStatus, canCompleteTasks, canReopenTasks, currentUserId, task?.allowedActions],
	);

	// ── ABAC: Assignee check ──────────────────────────────────────────────────
	// isAssignee is true when the current user is the task's explicit assignee.
	const isManagerLevel = canManageAllProjects || canManageTasks || canEditTasks;
	const hasDeliverableManagementOverride = canManageAllProjects || canManageTasks || canManageDeliverables;
	const canToggleDeliverables = task?.allowedActions?.toggleDeliverable ?? (hasDeliverableManagementOverride || canToggleProjectTaskDeliverables);
	const canCreateDeliverables = task?.allowedActions?.createDeliverable ?? (hasDeliverableManagementOverride || canCreateProjectTaskDeliverables);
	const canEditDeliverables = task?.allowedActions?.editDeliverable ?? (hasDeliverableManagementOverride || canEditProjectTaskDeliverables);
	const canDeleteDeliverables = task?.allowedActions?.deleteDeliverable ?? (hasDeliverableManagementOverride || canDeleteProjectTaskDeliverables);
	const closeSheet = useCallback(() => onOpenChange(false), [onOpenChange]);
	const isTimerRunning = task?.timeEntries?.some((entry) => entry.isRunning) ?? false;
	const canToggleTimer = isTimerRunning ? canStopTimer : canStartTimer;

	const statusActions = useTaskStatusActions({
		task,
		projectId,
		taskExecutionAccess,
		onTaskCompleted: closeSheet,
	});

	// ── Stable callbacks — all declared before any conditional return ─────────
	const handleTimerToggle = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (!task || !canToggleTimer) return;
			toggleTimer.mutate({ projectId, taskId: task.taskId }, { onError: () => toast.error("Failed to toggle timer.") });
		},
		[toggleTimer, projectId, task, canToggleTimer],
	);

	const handleDeleteTimeEntry = useCallback(
		(entry: ProjectTimeEntry) => {
			if (!task) return;
			deleteTimeEntry.mutate(
				{ projectId, taskId: task.taskId, entryId: entry.entryId },
				{
					onSuccess: () => toast.success("Time entry deleted."),
					onError: () => toast.error("Failed to delete time entry."),
				},
			);
		},
		[deleteTimeEntry, projectId, task],
	);

	// ── Derived state ─────────────────────────────────────────────────────────
	const deliverables = task?.deliverables ?? [];
	const totalDeliverables = deliverables.length;
	const completedDeliverables = deliverables.filter((d) => d.isCompleted).length;
	const allDeliverablesDone = totalDeliverables === 0 || completedDeliverables === totalDeliverables;
	const remainingDeliverables = totalDeliverables - completedDeliverables;

	const isDone = task?.status === ExecutionTaskStatus.DONE;

	const currentStatusColor = getStatusColor(task?.status ?? "");
	const totalLogged = formatTaskMinutes(task?.totalLoggedMinutes ?? 0);
	const isManageableTimeEntry = useCallback(
		(entry: ProjectTimeEntry) => entry.userId === currentUserId || canManageTimeEntries || isManagerLevel,
		[currentUserId, canManageTimeEntries, isManagerLevel],
	);
	const canEditTimeEntry = useCallback(
		(entry: ProjectTimeEntry) => hasEditTimeEntries && isManageableTimeEntry(entry),
		[hasEditTimeEntries, isManageableTimeEntry],
	);
	const canDeleteTimeEntry = useCallback(
		(entry: ProjectTimeEntry) => hasDeleteTimeEntries && isManageableTimeEntry(entry),
		[hasDeleteTimeEntries, isManageableTimeEntry],
	);

	// ── Early return after all hooks ──────────────────────────────────────────
	if (!task) {
		return null;
	}

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
		>
			<SheetContent
				side="right"
				className="flex w-[90vw] flex-col gap-0 p-0 sm:max-w-2xl lg:max-w-3xl overflow-hidden"
			>
				<TaskExecutionHeader
					taskTitle={task.title}
					taskStatus={task.status}
					totalLogged={totalLogged}
					estimatedHours={task.estimatedHours}
					assigneeName={task.assignee?.name ?? null}
					currentStatusColor={currentStatusColor}
					allowedStatusOptions={statusActions.allowedStatusOptions}
					isDone={isDone}
					isTimerRunning={isTimerRunning}
					canWriteTimeEntries={canToggleTimer}
					isStatusPending={statusActions.isStatusPending}
					isTimerPending={toggleTimer.isPending}
					onStatusChange={statusActions.changeStatus}
					onTimerToggle={handleTimerToggle}
				/>

				<TaskExecutionTabs
					task={task}
					projectId={projectId}
					totalLogged={totalLogged}
					access={{
						isDone,
						canToggleDeliverables,
						canCreateDeliverables,
						canEditDeliverables,
						canDeleteDeliverables,
						canLogTime,
						canEditTimeEntry,
						canDeleteTimeEntry,
					}}
					handlers={{
						onLogTime: manualTimeDialog.openManualTimeDialog,
						onEditTimeEntry: manualTimeDialog.editTimeEntry,
						onDeleteTimeEntry: handleDeleteTimeEntry,
					}}
				/>

				<TaskExecutionFooter
					primaryAction={statusActions.primaryAction}
					isDone={isDone}
					allDeliverablesDone={allDeliverablesDone}
					remainingDeliverables={remainingDeliverables}
					isSaving={statusActions.isPrimaryActionSaving}
					onPrimaryAction={statusActions.runPrimaryAction}
				/>
			</SheetContent>

			<TaskReopenDialog
				open={statusActions.reopenDialog.open}
				currentStatusLabel={statusActions.reopenDialog.currentStatusLabel}
				pendingStatusLabel={statusActions.reopenDialog.pendingStatusLabel}
				reason={statusActions.reopenDialog.reason}
				isSaving={statusActions.reopenDialog.isSaving}
				onOpenChange={statusActions.reopenDialog.onOpenChange}
				onReasonChange={statusActions.reopenDialog.onReasonChange}
				onCancel={statusActions.reopenDialog.onCancel}
				onConfirm={statusActions.reopenDialog.onConfirm}
			/>

			<TaskManualTimeDialog
				open={manualTimeDialog.manualTimeOpen}
				form={manualTimeDialog.manualTimeForm}
				isEditing={manualTimeDialog.editingTimeEntry !== null}
				isLoading={manualTimeDialog.isManualTimeSaving}
				onOpenChange={manualTimeDialog.changeManualTimeOpen}
				onSubmit={manualTimeDialog.submitManualTime}
			/>
		</Sheet>
	);
}
