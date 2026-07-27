import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { projectPipelineApi } from "../projectPipeline";

vi.mock("@/lib/axios", () => ({
	default: {
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("projectPipelineApi task actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("updates a pipeline task through its project-scoped endpoint", async () => {
		const task = {
			taskId: 9,
			projectId: 3,
			workflowStageId: 4,
			title: "Updated board task",
			priority: "high" as const,
			assignees: [],
			position: 1,
		};
		vi.mocked(api.patch).mockResolvedValue({ data: { data: task } });

		await expect(
			projectPipelineApi.updateTask(3, 9, {
				title: "Updated board task",
				workflowStageId: 4,
			})
		).resolves.toEqual(task);

		expect(api.patch).toHaveBeenCalledWith("/projects/3/pipeline/tasks/9", {
			title: "Updated board task",
			workflowStageId: 4,
		});
	});

	it("deletes a pipeline task through its project-scoped endpoint", async () => {
		vi.mocked(api.delete).mockResolvedValue({ data: { data: null } });

		await expect(projectPipelineApi.deleteTask(3, 9)).resolves.toBeUndefined();

		expect(api.delete).toHaveBeenCalledWith("/projects/3/pipeline/tasks/9");
	});

	it("uploads a task cover through its project-scoped endpoint", async () => {
		const coverImage = new File(["cover"], "cover.webp", { type: "image/webp" });
		const task = {
			taskId: 9,
			projectId: 3,
			workflowStageId: 4,
			title: "Task with cover",
			coverImageUrl: "https://example.test/storage/cover.webp",
			priority: "medium" as const,
			assignees: [],
			position: 1,
		};
		vi.mocked(api.post).mockResolvedValue({ data: { data: task } });

		await expect(projectPipelineApi.uploadTaskCover(3, 9, coverImage)).resolves.toEqual(task);

		const submittedForm = vi.mocked(api.post).mock.calls[0][1] as FormData;
		expect(api.post).toHaveBeenCalledWith("/projects/3/pipeline/tasks/9/cover", expect.any(FormData), {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		expect(submittedForm.get("coverImage")).toBe(coverImage);
	});

	it("removes a task cover through its project-scoped endpoint", async () => {
		const task = {
			taskId: 9,
			projectId: 3,
			workflowStageId: 4,
			title: "Task without cover",
			coverImageUrl: null,
			priority: "medium" as const,
			assignees: [],
			position: 1,
		};
		vi.mocked(api.delete).mockResolvedValue({ data: { data: task } });

		await expect(projectPipelineApi.deleteTaskCover(3, 9)).resolves.toEqual(task);

		expect(api.delete).toHaveBeenCalledWith("/projects/3/pipeline/tasks/9/cover");
	});
});
