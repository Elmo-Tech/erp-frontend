import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { shortPermissionsApi } from "./short-permissions";
import type { ApproveEmployeeShortPermissionPayload, CreateEmployeeShortPermissionPayload } from "../types/short-permissions";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

const requestPayload: CreateEmployeeShortPermissionPayload = {
	permissionDate: "2026-05-04",
	startTime: "09:30",
	endTime: "11:00",
	reason: "Medical appointment",
};

const approvalPayload: ApproveEmployeeShortPermissionPayload = {
	compensationType: "paid",
	reviewNote: "Approved as paid time",
};

describe("shortPermissionsApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads a selected month with permissions and its allowance", async () => {
		const data = { permissions: [], allowance: { period: "2026-05" } };
		vi.mocked(api.get).mockResolvedValue({ data: { data } });

		await expect(shortPermissionsApi.getEmployeeShortPermissions(12, "2026-05")).resolves.toEqual(data);
		expect(api.get).toHaveBeenCalledWith("/employees/12/short-permissions", { params: { month: "2026-05" } });
	});

	it("loads the pending reviewer scope without employee, creator, or month filtering", async () => {
		const permissions = [{ id: 41, employeeId: 9, permissionDate: "2026-10-12", canReview: true, employee: { userId: 9, name: "Review Admin" } }];
		vi.mocked(api.get).mockResolvedValue({ data: { data: { permissions } } });
		await expect(shortPermissionsApi.getPendingShortPermissions()).resolves.toEqual(permissions);
		expect(api.get).toHaveBeenCalledExactlyOnceWith("/employee-short-permissions/pending");
	});

	it("creates, approves, rejects, and cancels with the contract endpoints", async () => {
		const permission = { id: 8 };
		vi.mocked(api.post).mockResolvedValue({ data: { data: permission } });

		await expect(shortPermissionsApi.createEmployeeShortPermission(12, requestPayload)).resolves.toEqual(permission);
		await expect(shortPermissionsApi.approveEmployeeShortPermission(8, approvalPayload)).resolves.toEqual(permission);
		await expect(shortPermissionsApi.rejectEmployeeShortPermission(8)).resolves.toEqual(permission);
		await expect(shortPermissionsApi.cancelEmployeeShortPermission(8, { reviewNote: "No longer needed" })).resolves.toEqual(permission);

		expect(api.post).toHaveBeenNthCalledWith(1, "/employees/12/short-permissions", requestPayload);
		expect(api.post).toHaveBeenNthCalledWith(2, "/employee-short-permissions/8/approve", approvalPayload);
		expect(api.post).toHaveBeenNthCalledWith(3, "/employee-short-permissions/8/reject", {});
		expect(api.post).toHaveBeenNthCalledWith(4, "/employee-short-permissions/8/cancel", { reviewNote: "No longer needed" });
	});
});
