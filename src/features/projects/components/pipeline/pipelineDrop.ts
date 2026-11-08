import type { ProjectWorkflowStage } from "../../types/pipeline";

interface DropData { taskId?: unknown; stageId?: unknown }

/** Return the final zero-based position expected by the server. */
export function resolvePipelineDrop(stages: ProjectWorkflowStage[], active: DropData | undefined, over: DropData | undefined) {
	const taskId = Number(active?.taskId);
	const sourceId = Number(active?.stageId);
	const targetId = Number(over?.stageId);
	const overTaskId = Number(over?.taskId);
	const target = stages.find((stage) => stage.stageId === targetId);
	if (!taskId || !sourceId || !target || taskId === overTaskId || (sourceId === targetId && !overTaskId)) return null;
	const position = overTaskId ? target.tasks.findIndex((task) => task.taskId === overTaskId) : undefined;
	if (position === -1) return null;
	return { taskId, workflowStageId: targetId, position };
}
