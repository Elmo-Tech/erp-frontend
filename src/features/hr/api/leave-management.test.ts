import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { leaveManagementApi } from "./leave-management";
import type { CreateEmployeeLeavePayload, CreateLeaveTypePayload } from "../types/leave-management";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
	},
}));

const payload: CreateEmployeeLeavePayload = {
	leaveTypeId: 3,
	startDate: "2026-05-04",
	endDate: "2026-05-05",
	reason: "Medical appointment",
};

const leaveTypePayload: CreateLeaveTypePayload = {
	name: "Annual leave",
	slug: "annual-leave",
	annualAllowanceDays: 21,
	isPaid: true,
	isActive: true,
	displayOrder: 10,
};

describe("leaveManagementApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads active leave types and an employee's selected-year leave data", async () => {
		const leaveTypes = [{ id: 3, name: "Annual leave" }];
		const leaveData = { leaves: [], balances: [] };
		vi.mocked(api.get).mockResolvedValueOnce({ data: { data: leaveTypes } }).mockResolvedValueOnce({ data: { data: leaveData } });

		await expect(leaveManagementApi.getLeaveTypes()).resolves.toEqual(leaveTypes);
		await expect(leaveManagementApi.getEmployeeLeaves(12, 2026)).resolves.toEqual(leaveData);
		expect(api.get).toHaveBeenNthCalledWith(1, "/leave-types");
		expect(api.get).toHaveBeenNthCalledWith(2, "/employees/12/leaves", { params: { year: 2026 } });
	});

	it("manages leave types with the expected endpoint payloads", async () => {
		const leaveType = { id: 3, ...leaveTypePayload };
		vi.mocked(api.get).mockResolvedValue({ data: { data: [leaveType] } });
		vi.mocked(api.post).mockResolvedValue({ data: { data: leaveType } });
		vi.mocked(api.put).mockResolvedValue({ data: { data: { ...leaveType, isActive: false } } });

		await expect(leaveManagementApi.getAllLeaveTypes()).resolves.toEqual([leaveType]);
		await expect(leaveManagementApi.createLeaveType(leaveTypePayload)).resolves.toEqual(leaveType);
		await expect(leaveManagementApi.updateLeaveType(3, { isActive: false })).resolves.toEqual({ ...leaveType, isActive: false });

		expect(api.get).toHaveBeenCalledWith("/leave-types/all");
		expect(api.post).toHaveBeenCalledWith("/leave-types", leaveTypePayload);
		expect(api.put).toHaveBeenCalledWith("/leave-types/3", { isActive: false });
	});

	it("creates and reviews leave requests using the contract endpoints", async () => {
		const leave = { id: 8 };
		vi.mocked(api.post).mockResolvedValue({ data: { data: leave } });

		await expect(leaveManagementApi.createEmployeeLeave(12, payload)).resolves.toEqual(leave);
		await expect(leaveManagementApi.approveEmployeeLeave(8, { reviewNote: "Approved" })).resolves.toEqual(leave);
		await expect(leaveManagementApi.rejectEmployeeLeave(8)).resolves.toEqual(leave);
		await expect(leaveManagementApi.cancelEmployeeLeave(8, { reviewNote: "Cancelled by manager" })).resolves.toEqual(leave);
		expect(api.post).toHaveBeenNthCalledWith(1, "/employees/12/leaves", payload);
		expect(api.post).toHaveBeenNthCalledWith(2, "/employee-leaves/8/approve", { reviewNote: "Approved" });
		expect(api.post).toHaveBeenNthCalledWith(3, "/employee-leaves/8/reject", {});
		expect(api.post).toHaveBeenNthCalledWith(4, "/employee-leaves/8/cancel", { reviewNote: "Cancelled by manager" });
	});
});
