import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { directEmployeeDeductionsApi } from "./direct-employee-deductions";
import type { CreateDirectEmployeeDeductionPayload } from "../types/direct-employee-deductions";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

const requestPayload: CreateDirectEmployeeDeductionPayload = {
	deductionTypeId: 3,
	deductionDate: "2026-05-04",
	amount: 125.5,
	reason: "  Unreturned equipment  ",
};

describe("directEmployeeDeductionsApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads active types and selected-month direct deductions", async () => {
		const deductionTypes = [{ id: 3, name: "Equipment" }];
		const deductions = { deductions: [], summary: { approvedAmount: 0, pendingCount: 0, approvedCount: 0 } };
		vi.mocked(api.get).mockResolvedValueOnce({ data: { data: deductionTypes } }).mockResolvedValueOnce({ data: { data: deductions } });

		await expect(directEmployeeDeductionsApi.getActiveDeductionTypes()).resolves.toEqual(deductionTypes);
		await expect(directEmployeeDeductionsApi.getEmployeeDirectDeductions(12, 2026, 5)).resolves.toEqual(deductions);
		expect(api.get).toHaveBeenNthCalledWith(1, "/deduction-types/active");
		expect(api.get).toHaveBeenNthCalledWith(2, "/employees/12/deductions", { params: { year: 2026, month: "05" } });
	});

	it("creates, approves, rejects, and cancels with the direct-deduction contract", async () => {
		const deduction = { id: 8 };
		vi.mocked(api.post).mockResolvedValue({ data: { data: deduction } });

		await expect(directEmployeeDeductionsApi.createEmployeeDirectDeduction(12, requestPayload)).resolves.toEqual(deduction);
		await expect(directEmployeeDeductionsApi.approveEmployeeDirectDeduction(8, { reviewNote: "Approved" })).resolves.toEqual(deduction);
		await expect(directEmployeeDeductionsApi.rejectEmployeeDirectDeduction(8, { reviewNote: "Evidence reviewed" })).resolves.toEqual(deduction);
		await expect(directEmployeeDeductionsApi.cancelEmployeeDirectDeduction(8)).resolves.toEqual(deduction);

		expect(api.post).toHaveBeenNthCalledWith(1, "/employees/12/deductions", requestPayload);
		expect(api.post).toHaveBeenNthCalledWith(2, "/employee-deductions/8/approve", { reviewNote: "Approved" });
		expect(api.post).toHaveBeenNthCalledWith(3, "/employee-deductions/8/reject", { reviewNote: "Evidence reviewed" });
		expect(api.post).toHaveBeenNthCalledWith(4, "/employee-deductions/8/cancel", {});
	});
});
