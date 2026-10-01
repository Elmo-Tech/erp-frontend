"use client";

import type { Task } from "@/features/dashboard/types/task";
import { TaskStatus } from "@/features/dashboard/types/task";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useAuthStore } from "@/store/authStore";
import { TaskWorkControls } from "./TaskWorkControls";

export function TaskTimerWidget({ task }: { task: Task }) {
	const userId = useAuthStore((state) => state.user?.userId);
	const { canStartTimer } = usePermissions();
	const isAssigned = task.assignedTo === userId || task.assignees?.some((assignee) => assignee.userId === userId) === true;
	const isClosed = task.status === TaskStatus.COMPLETED || task.workflowStage?.isTerminal === true || task.workflowStage?.category === "cancelled";
	return (
		<TaskWorkControls
			taskId={task.taskId}
			title={task.title}
			canWork={canStartTimer && isAssigned && task.canStartTimer && !isClosed}
			disabledReason={isClosed ? "This task is closed." : undefined}
		/>
	);
}
