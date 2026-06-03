import { describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { reportsApi } from "../reports.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	get: Mock;
};

describe("reportsApi", () => {
	it("serializes common report filters for JSON endpoints", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: { metrics: {} } } });

		await reportsApi.getOverview({
			from: "2026-06-01",
			to: "2026-06-30",
			projectId: 7,
			clientId: 3,
			userId: 9,
			status: "active",
		});

		expect(mockedApi.get).toHaveBeenCalledWith("/reports/overview?from=2026-06-01&to=2026-06-30&projectId=7&clientId=3&userId=9&status=active");
	});

	it("builds CSV export URLs with report name and filters", () => {
		expect(reportsApi.exportCsv("projects", { status: "active", clientId: 4 })).toBe("/reports/export?report=projects&clientId=4&status=active");
	});
});
