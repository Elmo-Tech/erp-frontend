import { describe, expect, it } from "vitest";
import { resolvePipelineDrop } from "./pipelineDrop";
import type { ProjectWorkflowStage } from "../../types/pipeline";

const stages = [
	{ stageId: 1, tasks: [{ taskId: 10 }, { taskId: 11 }, { taskId: 12 }] },
	{ stageId: 2, tasks: [{ taskId: 20 }, { taskId: 21 }] },
	{ stageId: 3, tasks: [] },
] as ProjectWorkflowStage[];

describe("pipeline drop position", () => {
	it("supports moving a card upward or downward in the same stage", () => {
		expect(resolvePipelineDrop(stages, { taskId: 12, stageId: 1 }, { taskId: 10, stageId: 1 })).toEqual({ taskId: 12, workflowStageId: 1, position: 0 });
		expect(resolvePipelineDrop(stages, { taskId: 10, stageId: 1 }, { taskId: 12, stageId: 1 })).toEqual({ taskId: 10, workflowStageId: 1, position: 2 });
	});
	it("inserts into another column or appends to an empty column", () => {
		expect(resolvePipelineDrop(stages, { taskId: 10, stageId: 1 }, { taskId: 21, stageId: 2 })).toEqual({ taskId: 10, workflowStageId: 2, position: 1 });
		expect(resolvePipelineDrop(stages, { taskId: 10, stageId: 1 }, { stageId: 3 })).toEqual({ taskId: 10, workflowStageId: 3, position: undefined });
	});
	it("ignores the source card and unrelated drop targets", () => {
		expect(resolvePipelineDrop(stages, { taskId: 10, stageId: 1 }, { taskId: 10, stageId: 1 })).toBeNull();
		expect(resolvePipelineDrop(stages, { taskId: 10, stageId: 1 }, { taskId: 999, stageId: 2 })).toBeNull();
	});
});
