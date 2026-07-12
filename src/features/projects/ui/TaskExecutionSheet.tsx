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
	useProjectMembers,
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

const TIME_ENTRY_WRITE_PERMISSIONS = ["start_timer", "log_time", "manage_time_entries"];
const TIME_ENTRY_MANAGE_PERMISSIONS = ["manage_time_entries", "manage_all_projects"];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
	return ExecutionTaskStatusColors[status as keyof typeof ExecutionTaskStatusColors] ?? "bg-gray-100 text-gray-700 border-gray-200";
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
	const membersQuery = useProjectMembers(projectId);

	const {
		canManageTasks,
		canEditTasks,
		canWorkOnTasks,
		canManageDeliverables,
		canCreateProjectTaskDeliverables,
		canEditProjectTaskDeliverables,
		canDeleteProjectTaskDeliverables,
	} = useTaskPermissions();

	// manage_all_projects replaces the old isGlobalAdmin bypass.
	// Users with this permission skip project-membership workflow ceilings.
	const canManageAllProjects = useAuthStore((s) => s.hasPermission("manage_all_projects"));
	const canWriteTimeEntries = useAuthStore((s) => s.hasAnyPermission(TIME_ENTRY_WRITE_PERMISSIONS));
	const canManageTimeEntries = useAuthStore((s) => s.hasAnyPermission(TIME_ENTRY_MANAGE_PERMISSIONS));

	// projectRole is the user's MEMBERSHIP role within this specific project
	// (manager, tech_lead, developer, qa, designer).
	const projectRole = canManageAllProjects
		? null // bypass: no workflow ceiling applies
		: (membersQuery.data?.find((m) => m.userId === currentUserId)?.role ?? null);

	const taskExecutionAccess = useMemo(
		() => ({
			canManageAllProjects,
			canManageTasks,
			canEditTasks,
			canWorkOnTasks,
			canManageDeliverables,
			projectRole,
			currentUserId,
		}),
		[canManageAllProjects, canManageTasks, canEditTasks, canWorkOnTasks, canManageDeliverables, projectRole, currentUserId],
	);

	// ── ABAC: Assignee check ──────────────────────────────────────────────────
	// isAssignee is true when the current user is the task's explicit assignee.
	const isAssignee = task ? task.assigneeId === currentUserId : false;
	const isManagerLevel = canManageAllProjects || canManageTasks || canEditTasks || projectRole === "manager" || projectRole === "tech_lead";
	// Deliverables can be toggled by the assignee or a manager-level user
	const canToggleDeliverables = isAssignee || isManagerLevel;
	const hasDeliverableManagementOverride = canManageAllProjects || canManageDeliverables;
	const canCreateDeliverables = hasDeliverableManagementOverride || canCreateProjectTaskDeliverables;
	const canEditDeliverables = hasDeliverableManagementOverride || canEditProjectTaskDeliverables;
	const canDeleteDeliverables = hasDeliverableManagementOverride || canDeleteProjectTaskDeliverables;
	const closeSheet = useCallback(() => onOpenChange(false), [onOpenChange]);

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
			if (!task || !canWriteTimeEntries) return;
			toggleTimer.mutate({ projectId, taskId: task.taskId }, { onError: () => toast.error("Failed to toggle timer.") });
		},
		[toggleTimer, projectId, task, canWriteTimeEntries],
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
	const timeEntries = task?.timeEntries ?? [];
	const totalDeliverables = deliverables.length;
	const completedDeliverables = deliverables.filter((d) => d.isCompleted).length;
	const allDeliverablesDone = totalDeliverables === 0 || completedDeliverables === totalDeliverables;
	const remainingDeliverables = totalDeliverables - completedDeliverables;

	const isDone = task?.status === ExecutionTaskStatus.DONE;
	const runningEntry = timeEntries.find((e) => e.isRunning) ?? null;
	const isTimerRunning = runningEntry !== null;

	const currentStatusColor = getStatusColor(task?.status ?? "");
	const totalLogged = formatTaskMinutes(task?.totalLoggedMinutes ?? 0);
	const canManageTimeEntry = useCallback(
		(entry: ProjectTimeEntry) => entry.userId === currentUserId || canManageTimeEntries || isManagerLevel,
		[currentUserId, canManageTimeEntries, isManagerLevel],
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
					canWriteTimeEntries={canWriteTimeEntries}
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
						canWriteTimeEntries,
						canManageTimeEntry,
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
