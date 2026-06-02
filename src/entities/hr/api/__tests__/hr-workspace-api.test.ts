import { describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { fetchAttendanceSummary, fetchTeamPulse, patchAttendance, postCheckIn } from "../hr.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	get: Mock;
	post: Mock;
	patch: Mock;
};

describe("HR workspace API", () => {
	it("posts check-in through the attendance API", async () => {
		mockedApi.post.mockResolvedValueOnce({ data: { data: { id: 7 } } });

		await expect(postCheckIn()).resolves.toEqual({ id: 7 });

		expect(mockedApi.post).toHaveBeenCalledWith("/hr/attendance/check-in");
	});

	it("fetches management team pulse", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: [] } });

		await expect(fetchTeamPulse()).resolves.toEqual([]);

		expect(mockedApi.get).toHaveBeenCalledWith("/hr/team-pulse");
	});

	it("fetches attendance summary with scope", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: { scope: "week" } } });

		await expect(fetchAttendanceSummary({ scope: "week" })).resolves.toEqual({ scope: "week" });

		expect(mockedApi.get).toHaveBeenCalledWith("/hr/attendance/summary?scope=week");
	});

	it("patches attendance treatment", async () => {
		mockedApi.patch.mockResolvedValueOnce({ data: { data: { id: 3 } } });

		await expect(patchAttendance(3, { lateTreatment: "grace" })).resolves.toEqual({ id: 3 });

		expect(mockedApi.patch).toHaveBeenCalledWith("/hr/attendance/3", { lateTreatment: "grace" });
	});
});
