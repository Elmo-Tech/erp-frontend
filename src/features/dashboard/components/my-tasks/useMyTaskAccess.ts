import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Task, TaskType } from "../../types/task";

export function useMyTaskAccess() {
	const permissions = usePermissions();
	const editByType = {
		[TaskType.MAIN]: permissions.canEditMainTasks,
		[TaskType.WEEKLY]: permissions.canEditWeeklyTasks,
		[TaskType.SUBTASK]: permissions.canEditSubtasks,
	};
	// This standalone form has no parent selector. Weekly tasks and subtasks
	// must be created from their parent task to satisfy the API hierarchy.
	const allowedTypes = permissions.canManageTasks || permissions.canCreateMainTasks ? [TaskType.MAIN] : [];

	return {
		allowedTypes,
		canCreate: allowedTypes.length > 0,
		// Project workflow tasks use the project board instead of legacy statuses.
		canEdit: (task: Task) => !task.isPipelineTask && Boolean(permissions.canManageTasks || editByType[task.type]),
	};
}
