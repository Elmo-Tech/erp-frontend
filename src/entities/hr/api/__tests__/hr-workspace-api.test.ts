import { describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { fetchTeamPulse, postCheckIn } from "../hr.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	get: Mock;
	post: Mock;
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
});
