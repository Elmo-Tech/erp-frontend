import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import api from "@/lib/axios";
import type { EmployeeShortPermission, CreateEmployeeShortPermissionPayload, ApproveEmployeeShortPermissionPayload } from "@/features/hr/types/short-permissions";
import { AttendanceManagement } from "../AttendanceManagement";

vi.mock("@/lib/axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/features/admin/hooks/usePermissions", () => ({ usePermissions: () => ({ canManageAttendance: true, canViewAllAttendance: true, hasAnyPermission: () => true }) }));
vi.mock("@/features/admin/hooks/useAttendance", () => ({ useAttendanceList: () => ({ data: { attendances: [] }, isLoading: false }) }));
vi.mock("@/features/hr/hooks", () => ({ useEmployees: () => ({ data: { employees: [{ userId: 7, name: "QA Employee" }] } }) }));
vi.mock("../AttendanceFormDialog", () => ({ AttendanceFormDialog: () => null }));

it("Create and approve a short permission", async () => {
	let permissions: EmployeeShortPermission[] = [];
	vi.mocked(api.get).mockImplementation(async () => ({ data: { data: {
		permissions, allowance: { period: "2026-10", allocatedMinutes: 360, usedPaidMinutes: 0, remainingMinutes: 360, overageMinutes: 0 },
	} } }));
	vi.mocked(api.post).mockImplementation(async (url, payload) => {
		if (url.includes("/approve")) permissions = permissions.map((permission) => ({ ...permission, status: "approved", isPaid: (payload as ApproveEmployeeShortPermissionPayload).compensationType === "paid" }));
		else permissions = [{ ...(payload as CreateEmployeeShortPermissionPayload), id: 41, employeeId: 7, durationMinutes: 60, status: "pending", isPaid: null, createdAt: "2026-10-11T10:00:00" }];
		return { data: { data: permissions[0] } };
	});
	const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
	render(<QueryClientProvider client={client}><AttendanceManagement /></QueryClientProvider>);
	fireEvent.click(screen.getByRole("button", { name: "Review short permissions" }));
	fireEvent.change(screen.getByLabelText("Employee"), { target: { value: "7" } });
	fireEvent.change(screen.getByLabelText("Permission date"), { target: { value: "2026-10-11" } });
	fireEvent.change(screen.getByLabelText("Start time"), { target: { value: "09:00" } });
	fireEvent.change(screen.getByLabelText("End time"), { target: { value: "10:00" } });
	await waitFor(() => expect(screen.getByRole("button", { name: "Submit request" })).toBeEnabled());
	fireEvent.click(screen.getByRole("button", { name: "Submit request" }));
	fireEvent.click(await screen.findByRole("button", { name: "Approve" }));
	const review = screen.getByRole("alertdialog");
	fireEvent.keyDown(within(review).getByRole("combobox", { name: "Compensation type" }), { key: "Enter" });
	fireEvent.click(await screen.findByRole("option", { name: /^Paid$/ }));
	fireEvent.click(within(review).getByRole("button", { name: "Approve" }));
	await screen.findByText("Approved");
	expect(api.post).toHaveBeenCalledWith("/employee-short-permissions/41/approve", { compensationType: "paid" });
});
