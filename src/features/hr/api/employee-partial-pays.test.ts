import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { employeePartialPaysApi } from "./employee-partial-pays";
import type { CreateEmployeePartialPayPayload } from "../types/employee-partial-pays";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

const payload: CreateEmployeePartialPayPayload = {
	contractId: 8,
	kind: "first_month",
	payrollYear: 2026,
	payrollMonth: 5,
};

describe("employeePartialPaysApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads the selected period from the partial-pay data envelope", async () => {
		const data = {
			records: [],
			summary: { draftCount: 0, approvedCount: 0, cancelledCount: 0, grossAmount: 0, approvedGrossAmount: 0 },
		};
		vi.mocked(api.get).mockResolvedValue({ data: { data } });

		await expect(employeePartialPaysApi.getEmployeePartialPays(12, 2026, 5)).resolves.toEqual(data);
		expect(api.get).toHaveBeenCalledWith("/employees/12/partial-pays", { params: { year: 2026, month: 5 } });
	});

	it("sends only contract, kind, and payroll period to preview, create, and review endpoints", async () => {
		const partialPay = { id: 4 };
		vi.mocked(api.post).mockResolvedValue({ data: { data: partialPay } });

		await expect(employeePartialPaysApi.previewEmployeePartialPay(12, payload)).resolves.toEqual(partialPay);
		await expect(employeePartialPaysApi.createEmployeePartialPay(12, payload)).resolves.toEqual(partialPay);
		await expect(employeePartialPaysApi.approveEmployeePartialPay(4, { reviewNote: "Verified against the contract" })).resolves.toEqual(partialPay);
		await expect(employeePartialPaysApi.cancelEmployeePartialPay(4)).resolves.toEqual(partialPay);

		expect(api.post).toHaveBeenNthCalledWith(1, "/employees/12/partial-pays/preview", payload);
		expect(api.post).toHaveBeenNthCalledWith(2, "/employees/12/partial-pays", payload);
		expect(api.post).toHaveBeenNthCalledWith(3, "/employee-partial-pays/4/approve", { reviewNote: "Verified against the contract" });
		expect(api.post).toHaveBeenNthCalledWith(4, "/employee-partial-pays/4/cancel", {});
	});
});
