import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { overtimeRequestsApi } from "./overtime-requests";
import type { CreateEmployeeOvertimeRequestPayload } from "../types/overtime-requests";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

const requestPayload: CreateEmployeeOvertimeRequestPayload = {
	overtimeDate: "2026-05-04",
	startTime: "18:00",
	endTime: "20:30",
	reason: "Client deployment",
};

describe("overtimeRequestsApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads the selected employee period from the ApiResponse data envelope", async () => {
		const data = {
			requests: [],
			summary: { requestedMinutes: 0, actualMinutes: 0, approvedMinutes: 0, unapprovedMinutes: 0, payableAmount: 0, pendingCount: 0 },
		};
		vi.mocked(api.get).mockResolvedValue({ data: { data } });

		await expect(overtimeRequestsApi.getEmployeeOvertimeRequests(12, 2026, 5)).resolves.toEqual(data);
		expect(api.get).toHaveBeenCalledWith("/employees/12/overtime-requests", { params: { year: 2026, month: 5 } });
	});

	it("creates, approves, rejects, and cancels using the overtime contract endpoints", async () => {
		const request = { id: 8 };
		vi.mocked(api.post).mockResolvedValue({ data: { data: request } });

		await expect(overtimeRequestsApi.createEmployeeOvertimeRequest(12, requestPayload)).resolves.toEqual(request);
		await expect(overtimeRequestsApi.approveEmployeeOvertimeRequest(8, { reviewNote: "Preapproved" })).resolves.toEqual(request);
		await expect(overtimeRequestsApi.rejectEmployeeOvertimeRequest(8)).resolves.toEqual(request);
		await expect(overtimeRequestsApi.cancelEmployeeOvertimeRequest(8, { reviewNote: "Deployment delayed" })).resolves.toEqual(request);

		expect(api.post).toHaveBeenNthCalledWith(1, "/employees/12/overtime-requests", requestPayload);
		expect(api.post).toHaveBeenNthCalledWith(2, "/employee-overtime-requests/8/approve", { reviewNote: "Preapproved" });
		expect(api.post).toHaveBeenNthCalledWith(3, "/employee-overtime-requests/8/reject", {});
		expect(api.post).toHaveBeenNthCalledWith(4, "/employee-overtime-requests/8/cancel", { reviewNote: "Deployment delayed" });
	});
});
