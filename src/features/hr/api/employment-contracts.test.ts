import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { employmentContractsApi } from "./employment-contracts";
import type { EmploymentContractPayload } from "../types/employment-contract";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
	},
}));

const payload: EmploymentContractPayload = {
	employmentType: "full_time",
	baseSalary: 12000,
	startDate: "2026-01-01",
	durationMonths: 12,
	workDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
	workHoursPerDay: 8,
	workStartTime: "09:00",
	status: "draft",
};

describe("employmentContractsApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("uses the employee history endpoint and unwraps data", async () => {
		const contracts = [{ id: 8 }];
		vi.mocked(api.get).mockResolvedValue({ data: { data: contracts } });

		await expect(employmentContractsApi.getAll(12)).resolves.toEqual(contracts);
		expect(api.get).toHaveBeenCalledWith("/employees/12/employment-contracts");
	});

	it("sends camelCase payloads to create and update endpoints", async () => {
		const contract = { id: 8, ...payload };
		vi.mocked(api.post).mockResolvedValue({ data: { data: contract } });
		vi.mocked(api.put).mockResolvedValue({ data: { data: contract } });

		await expect(employmentContractsApi.create(12, payload)).resolves.toEqual(contract);
		await expect(employmentContractsApi.update(8, payload)).resolves.toEqual(contract);
		expect(api.post).toHaveBeenCalledWith("/employees/12/employment-contracts", payload);
		expect(api.put).toHaveBeenCalledWith("/employment-contracts/8", payload);
	});
});
