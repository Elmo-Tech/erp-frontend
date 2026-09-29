import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { lateDeductionsApi } from "./late-deductions";
import type { OverrideLateDeductionPayload } from "../types/late-deductions";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
	},
}));

const overridePayload: OverrideLateDeductionPayload = {
	amount: 0,
	reason: "Payroll correction",
};

describe("lateDeductionsApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads and evaluates a selected payroll month", async () => {
		const result = { records: [], summary: { calculatedAmount: 0, adjustedAmount: 0, waivedCount: 0, evaluatedCount: 0 } };
		vi.mocked(api.get).mockResolvedValueOnce({ data: { data: result } });
		vi.mocked(api.post).mockResolvedValueOnce({ data: { data: result } });

		await expect(lateDeductionsApi.getEmployeeLateDeductions(12, 2026, 5)).resolves.toEqual(result);
		await expect(lateDeductionsApi.evaluateEmployeeLateDeductions(12, 2026, 5)).resolves.toEqual(result);

		expect(api.get).toHaveBeenCalledWith("/employees/12/late-deductions", { params: { year: 2026, month: "05" } });
		expect(api.post).toHaveBeenCalledWith("/employees/12/late-deductions/evaluate", { year: 2026, month: 5 });
	});

	it("overrides an evaluated record with the override contract", async () => {
		const record = { id: 8, status: "overridden" };
		vi.mocked(api.put).mockResolvedValue({ data: { data: record } });

		await expect(lateDeductionsApi.overrideLateDeduction(8, overridePayload)).resolves.toEqual(record);
		expect(api.put).toHaveBeenCalledWith("/employee-late-deductions/8/override", overridePayload);
	});
});
