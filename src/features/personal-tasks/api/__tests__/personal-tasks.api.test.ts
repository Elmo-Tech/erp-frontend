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

	it("fetches another user's personal tasks for admin views", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: { tasks: [{ taskId: 3, title: "Employee task" }] } } });

		await expect(personalTasksApi.list({ userId: 42 })).resolves.toEqual([{ taskId: 3, title: "Employee task" }]);

		expect(mockedApi.get).toHaveBeenCalledWith("/personal-tasks?user_id=42");
	});

	it("creates and completes personal tasks", async () => {
		mockedApi.post.mockResolvedValueOnce({ data: { data: { taskId: 2, title: "Pray" } } });
		mockedApi.post.mockResolvedValueOnce({ data: { data: { taskId: 2, status: "done" } } });

		await personalTasksApi.create({
			title: "Pray",
			description: "Daily routine",
			dueDate: "2026-06-20",
			priority: "high",
		});
		await personalTasksApi.complete(2);

		expect(mockedApi.post).toHaveBeenNthCalledWith(1, "/personal-tasks", {
			title: "Pray",
			description: "Daily routine",
			dueDate: "2026-06-20",
			priority: "high",
		});
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

	it("updates a personal time entry", async () => {
		mockedApi.patch.mockResolvedValueOnce({ data: { data: { entryId: 9, durationMinutes: 90 } } });

		await expect(
			personalTasksApi.updateTimeEntry(3, 9, {
				startTime: "2026-06-18T09:30:00.000Z",
				endTime: "2026-06-18T11:00:00.000Z",
				note: "Admin correction",
			}),
		).resolves.toEqual({ entryId: 9, durationMinutes: 90 });

		expect(mockedApi.patch).toHaveBeenCalledWith("/personal-tasks/3/time-entries/9", {
			startTime: "2026-06-18T09:30:00.000Z",
			endTime: "2026-06-18T11:00:00.000Z",
			note: "Admin correction",
		});
	});

	it("stops a personal time entry for team timer management", async () => {
		mockedApi.patch.mockResolvedValueOnce({ data: { data: { entryId: 9, isRunning: false, durationMinutes: 25 } } });

		await expect(personalTasksApi.stopTimeEntry(9)).resolves.toEqual({
			entryId: 9,
			isRunning: false,
			durationMinutes: 25,
		});

		expect(mockedApi.patch).toHaveBeenCalledWith("/personal-tasks/time-entries/9/stop");
	});
});
