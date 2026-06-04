import { describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { getActiveProjectTimeEntry, getMyActiveProjectTasks, getProjectTimeline } from "../execution.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	get: Mock;
};

describe("execution workspace API", () => {
	it("fetches the current user's active project time entry", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: null } });

		await expect(getActiveProjectTimeEntry()).resolves.toBeNull();

		expect(mockedApi.get).toHaveBeenCalledWith("/projects/time-entries/active");
	});

	it("fetches active project tasks assigned to the current user", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: { tasks: [] } } });

		await expect(getMyActiveProjectTasks()).resolves.toEqual([]);

		expect(mockedApi.get).toHaveBeenCalledWith("/projects/tasks/my-active");
	});

	it("fetches team timeline with date and multi-select filters", async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: {
				data: {
					range: { startDate: "2026-06-07", endDate: "2026-06-11" },
					users: [],
					items: [],
					conflicts: [],
					suggestions: [],
				},
			},
		});

		await expect(
			getProjectTimeline({
				startDate: "2026-06-07",
				endDate: "2026-06-11",
				projectIds: [2, 7],
				userIds: [3],
			})
		).resolves.toEqual({
			range: { startDate: "2026-06-07", endDate: "2026-06-11" },
			users: [],
			items: [],
			conflicts: [],
			suggestions: [],
		});

		expect(mockedApi.get).toHaveBeenCalledWith("/projects/timeline?startDate=2026-06-07&endDate=2026-06-11&projectIds%5B%5D=2&projectIds%5B%5D=7&userIds%5B%5D=3");
	});
});
