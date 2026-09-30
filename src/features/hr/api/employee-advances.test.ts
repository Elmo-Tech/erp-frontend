import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { employeeAdvancesApi } from "./employee-advances";
import type { CreateEmployeeAdvancePayload } from "../types/employee-advances";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

const requestPayload: CreateEmployeeAdvancePayload = {
	requestedAmount: 1250.5,
	reason: "Emergency medical expense",
	installmentCount: 3,
};

describe("employeeAdvancesApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads an employee month and individual advance from the data envelope", async () => {
		const list = { advances: [], summary: { requestedAmount: 0, approvedAmount: 0, disbursedAmount: 0, outstandingAmount: 0, pendingCount: 0, scheduledSettlementAmount: 0 } };
		const advance = { id: 8 };
		vi.mocked(api.get).mockResolvedValueOnce({ data: { data: list } }).mockResolvedValueOnce({ data: { data: advance } });

		await expect(employeeAdvancesApi.getEmployeeAdvances(12, 2026, 5)).resolves.toEqual(list);
		await expect(employeeAdvancesApi.getEmployeeAdvance(8)).resolves.toEqual(advance);

		expect(api.get).toHaveBeenNthCalledWith(1, "/employees/12/advances", { params: { year: 2026, month: 5 } });
		expect(api.get).toHaveBeenNthCalledWith(2, "/employee-advances/8");
	});

	it("uses the advance lifecycle and settlement contract endpoints", async () => {
		const advance = { id: 8 };
		vi.mocked(api.post).mockResolvedValue({ data: { data: advance } });

		await expect(employeeAdvancesApi.createEmployeeAdvance(12, requestPayload)).resolves.toEqual(advance);
		await expect(employeeAdvancesApi.approveEmployeeAdvance(8, { approvedAmount: 1200, reviewNote: "Approved within policy" })).resolves.toEqual(advance);
		await expect(employeeAdvancesApi.rejectEmployeeAdvance(8, { reviewNote: "Insufficient documentation" })).resolves.toEqual(advance);
		await expect(employeeAdvancesApi.cancelEmployeeAdvance(8)).resolves.toEqual(advance);
		await expect(employeeAdvancesApi.disburseEmployeeAdvance(8, { disbursementReference: "BANK-102" })).resolves.toEqual(advance);
		await expect(employeeAdvancesApi.settleEmployeeAdvanceSettlement(14, { settlementReference: "PAYROLL-05" })).resolves.toEqual(advance);

		expect(api.post).toHaveBeenNthCalledWith(1, "/employees/12/advances", requestPayload);
		expect(api.post).toHaveBeenNthCalledWith(2, "/employee-advances/8/approve", { approvedAmount: 1200, reviewNote: "Approved within policy" });
		expect(api.post).toHaveBeenNthCalledWith(3, "/employee-advances/8/reject", { reviewNote: "Insufficient documentation" });
		expect(api.post).toHaveBeenNthCalledWith(4, "/employee-advances/8/cancel", {});
		expect(api.post).toHaveBeenNthCalledWith(5, "/employee-advances/8/disburse", { disbursementReference: "BANK-102" });
		expect(api.post).toHaveBeenNthCalledWith(6, "/employee-advance-settlements/14/settle", { settlementReference: "PAYROLL-05" });
	});
});
