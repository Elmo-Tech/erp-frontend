import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { MyRequestsPanel } from "./MyRequestsPanel";
import type { EmployeeLeave, LeaveType, CreateEmployeeLeavePayload } from "../types/leave-management";

vi.mock("@/lib/axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

it("Request leave across working and non-working days", async () => {
	useAuthStore.setState({ user: { userId: 7, name: "Employee", email: "employee@example.com", avatar: "", role: "developer" } });
	const type: LeaveType = { id: 1, name: "Annual", slug: "annual", annualAllowanceDays: 21, isActive: true, isPaid: true, displayOrder: 1 };
	let leaves: EmployeeLeave[] = [];
	vi.mocked(api.get).mockImplementation(async (url) => ({ data: { data: url === "/leave-types" ? [type] : {
		leaves, balances: [{ leaveTypeId: 1, leaveType: type, allocatedDays: 21, usedDays: 0, remainingDays: 21 }],
	} } }));
	vi.mocked(api.post).mockImplementation(async (_url, payload) => {
		leaves = [{ ...(payload as CreateEmployeeLeavePayload), id: 1, employeeId: 7, workingDays: 2, leaveType: type, status: "pending", isPaid: true, createdAt: "2026-10-11T10:00:00" }];
		return { data: { data: leaves[0] } };
	});
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	render(<QueryClientProvider client={client}><MyRequestsPanel /></QueryClientProvider>);
	await screen.findByRole("option", { name: "Annual" });
	fireEvent.change(screen.getByLabelText("Leave type"), { target: { value: "1" } });
	fireEvent.change(screen.getByLabelText("Leave start date"), { target: { value: "2026-10-09" } });
	fireEvent.change(screen.getByLabelText("Leave end date"), { target: { value: "2026-10-12" } });
	fireEvent.click(screen.getByRole("button", { name: "Submit" }));
	await screen.findByText("2026-10-09 → 2026-10-12 · pending · 2d");
	expect(screen.getByText(/Annual: 21\/21 left · 2 working days awaiting approval/)).toBeVisible();
	expect(screen.getByText(/Pending requests do not consume leave balance until approval/)).toBeVisible();
});
