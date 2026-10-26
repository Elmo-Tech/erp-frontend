import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import type { EmployeeShortPermission, CreateEmployeeShortPermissionPayload, ApproveEmployeeShortPermissionPayload } from "@/features/hr/types/short-permissions";
import { MyRequestsPanel } from "@/features/hr/components/MyRequestsPanel";
import { AttendanceManagement } from "../AttendanceManagement";

vi.mock("@/lib/axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/features/admin/hooks/usePermissions", () => ({ usePermissions: () => ({ canManageAttendance: true, canViewAllAttendance: true, hasAnyPermission: () => true }) }));
vi.mock("@/features/admin/hooks/useAttendance", () => ({ useAttendanceList: () => ({ data: { attendances: [] }, isLoading: false }) }));
// The admin and employees beyond the first directory page are deliberately absent.
vi.mock("@/features/hr/hooks", () => ({ useEmployees: () => ({ data: { employees: [{ userId: 7, name: "explore-test-123" }] } }) }));
vi.mock("../AttendanceFormDialog", () => ({ AttendanceFormDialog: () => null }));

let permissions: EmployeeShortPermission[];
let nextId: number;
const admin = { userId: 9, name: "Review Admin", email: "admin@example.com", avatar: "", role: "admin" };
const client = () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
const renderAttendance = (queryClient: QueryClient) => render(<QueryClientProvider client={queryClient}><AttendanceManagement /></QueryClientProvider>);

beforeEach(() => {
	vi.clearAllMocks();
	vi.useFakeTimers({ toFake: ["Date"] });
	vi.setSystemTime(new Date("2026-01-15T10:00:00Z"));
	useAuthStore.setState({ user: admin, role: "admin", permissions: [{ permissionName: "manage_permissions", access: true }] });
	permissions = [];
	nextId = 41;
	vi.mocked(api.get).mockImplementation(async (url, config) => {
		if (url === "/leave-types") return { data: { data: [] } };
		if (url.endsWith("/leaves")) return { data: { data: { leaves: [], balances: [] } } };
		if (url === "/employee-short-permissions/pending") return { data: { data: { permissions: permissions.filter((permission) => permission.status === "pending").map((permission) => ({
			...permission, canReview: true, employee: { userId: permission.employeeId, name: permission.employeeId === 9 ? "Review Admin" : "explore-test-123" },
		})) } } };
		const employeeId = Number(url.match(/employees\/(\d+)/)?.[1]);
		const month = (config?.params as { month: string }).month;
		const selected = permissions.filter((permission) => permission.employeeId === employeeId && permission.permissionDate.startsWith(month));
		const used = selected.filter((permission) => permission.status === "approved" && permission.isPaid).reduce((minutes, permission) => minutes + permission.durationMinutes, 0);
		return { data: { data: { permissions: selected, canReview: useAuthStore.getState().role !== "employee", allowance: { period: month, allocatedMinutes: 360, usedPaidMinutes: used, remainingMinutes: 360 - used, overageMinutes: 0 } } } };
	});
	vi.mocked(api.post).mockImplementation(async (url, payload) => {
		if (url.includes("/approve")) {
			const id = Number(url.match(/employee-short-permissions\/(\d+)/)?.[1]);
			permissions = permissions.map((permission) => permission.id === id ? { ...permission, status: "approved", isPaid: (payload as ApproveEmployeeShortPermissionPayload).compensationType === "paid" } : permission);
			return { data: { data: permissions.find((permission) => permission.id === id) } };
		}
		const compensation = (payload as CreateEmployeeShortPermissionPayload).compensationType;
		const permission: EmployeeShortPermission = { ...(payload as CreateEmployeeShortPermissionPayload), id: nextId++, employeeId: Number(url.match(/employees\/(\d+)/)?.[1]), durationMinutes: 60, status: compensation ? "approved" : "pending", isPaid: compensation ? compensation === "paid" : null, createdAt: "2026-01-15T10:00:00" };
		permissions.push(permission);
		return { data: { data: permission } };
	});
});

afterEach(() => { cleanup(); useAuthStore.setState({ user: null, role: null, permissions: [] }); vi.useRealTimers(); });

it("registers a paid permission in one step without a confirmation dialog", async () => {
	renderAttendance(client());
	fireEvent.click(screen.getByRole("button", { name: "Review short permissions" }));
	fireEvent.change(screen.getByLabelText("Employee"), { target: { value: "9" } });
	fireEvent.click(screen.getByLabelText("Permission date"));
	for (let month = 0; month < 9; month++) fireEvent.click(screen.getByRole("button", { name: "Go to the Next Month" }));
	const day = screen.getByRole("button", { name: /October 12/ });
	fireEvent.click(day);
	fireEvent.keyDown(day, { key: "Escape" });
	fireEvent.change(screen.getByLabelText("Start time"), { target: { value: "09:00" } });
	fireEvent.change(screen.getByLabelText("End time"), { target: { value: "10:00" } });
	fireEvent.keyDown(screen.getByRole("combobox", { name: "Compensation type" }), { key: "Enter" });
	fireEvent.click(await screen.findByRole("option", { name: /^Paid$/ }));
	await waitFor(() => expect(screen.getByRole("button", { name: "Save permission" })).toBeEnabled());
	fireEvent.click(screen.getByRole("button", { name: "Save permission" }));
	await waitFor(() => expect(screen.getByLabelText("Short permissions month")).toHaveValue("2026-10"));
	await screen.findByText("Approved");
	expect(api.post).toHaveBeenCalledExactlyOnceWith("/employees/9/short-permissions", { permissionDate: "2026-10-12", startTime: "09:00", endTime: "10:00", compensationType: "paid" });
	expect(within(screen.getByText("Paid used").parentElement!).getByText("1h")).toBeVisible();
	expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
	expect(screen.queryByRole("button", { name: "Mark as Paid" })).not.toBeInTheDocument();
});

it("finds a request created in My Requests even when another employee and month are selected", async () => {
	useAuthStore.setState({ role: "employee" });
	const queryClient = client();
	const myRequests = render(<QueryClientProvider client={queryClient}><MyRequestsPanel /></QueryClientProvider>);
	fireEvent.mouseDown(screen.getByRole("tab", { name: "Short permissions" }), { button: 0, ctrlKey: false });
	fireEvent.change(await screen.findByLabelText("Permission date"), { target: { value: "2026-10-12" } });
	fireEvent.change(screen.getByLabelText("Start time"), { target: { value: "09:00" } });
	fireEvent.change(screen.getByLabelText("End time"), { target: { value: "10:00" } });
	fireEvent.click(screen.getByRole("button", { name: "Submit" }));
	await screen.findByText("2026-10-12 09:00-10:00 · pending");
	expect(screen.getByLabelText("My short permissions month")).toHaveValue("2026-10");
	myRequests.unmount();
	useAuthStore.setState({ role: "admin" });
	renderAttendance(queryClient);
	fireEvent.click(screen.getByRole("button", { name: "Review short permissions" }));
	fireEvent.change(screen.getByLabelText("Employee"), { target: { value: "7" } });
	const queue = screen.getByRole("region", { name: "Pending short permissions" });
	expect(await within(queue).findByText("Review Admin")).toBeVisible();
	fireEvent.click(within(queue).getByRole("button", { name: "Approve" }));
	const review = screen.getByRole("alertdialog");
	fireEvent.keyDown(within(review).getByRole("combobox", { name: "Compensation type" }), { key: "Enter" });
	fireEvent.click(await screen.findByRole("option", { name: /^Paid$/ }));
	fireEvent.click(within(review).getByRole("button", { name: "Approve" }));
	await screen.findByText("Approved");
	expect(screen.getByLabelText("Employee")).toHaveValue("9");
});

it("opens the correct employee and period from the queue beyond the loaded employee directory", async () => {
	await api.post("/employees/27/short-permissions", { permissionDate: "2026-11-12", startTime: "09:00", endTime: "10:00" });
	renderAttendance(client());
	fireEvent.click(screen.getByRole("button", { name: "Review short permissions" }));
	const queue = screen.getByRole("region", { name: "Pending short permissions" });
	fireEvent.click(await within(queue).findByRole("button", { name: "Mark as Paid" }));
	await waitFor(() => expect(api.get).toHaveBeenCalledWith("/employees/27/short-permissions", { params: { month: "2026-11" } }));
	fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Approve" }));
	await screen.findByText("Approved");
	expect(screen.getByLabelText("Employee")).toHaveValue("27");
});
