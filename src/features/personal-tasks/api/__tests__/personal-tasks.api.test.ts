import { describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { personalTasksApi } from "../personal-tasks.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	get: Mock;
	post: Mock;
	patch: Mock;
	delete: Mock;
};

describe("personalTasksApi", () => {
	it("fetches personal tasks from the personal task endpoint", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: { tasks: [{ taskId: 1, title: "Study" }] } } });

		await expect(personalTasksApi.list()).resolves.toEqual([{ taskId: 1, title: "Study" }]);

		expect(mockedApi.get).toHaveBeenCalledWith("/personal-tasks");
	});

	it("creates and completes personal tasks", async () => {
		mockedApi.post.mockResolvedValueOnce({ data: { data: { taskId: 2, title: "Pray" } } });
		mockedApi.post.mockResolvedValueOnce({ data: { data: { taskId: 2, status: "done" } } });

		await personalTasksApi.create({ title: "Pray", estimatedMinutes: 10 });
		await personalTasksApi.complete(2);

		expect(mockedApi.post).toHaveBeenNthCalledWith(1, "/personal-tasks", { title: "Pray", estimatedMinutes: 10 });
		expect(mockedApi.post).toHaveBeenNthCalledWith(2, "/personal-tasks/2/complete");
	});

	it("toggles and fetches the active personal timer", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: null } });
		mockedApi.post.mockResolvedValueOnce({ data: { data: { entryId: 7, personalTaskId: 3, isRunning: true } } });

		await expect(personalTasksApi.getActiveTimeEntry()).resolves.toBeNull();
		await expect(personalTasksApi.toggleTimer(3)).resolves.toEqual({ entryId: 7, personalTaskId: 3, isRunning: true });

		expect(mockedApi.get).toHaveBeenCalledWith("/personal-tasks/time-entries/active");
		expect(mockedApi.post).toHaveBeenCalledWith("/personal-tasks/3/time-entries/toggle");
	});
});
