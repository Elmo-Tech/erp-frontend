import { describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { getActiveProjectTimeEntry, getMyActiveProjectTasks } from "../execution.api";

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
});
