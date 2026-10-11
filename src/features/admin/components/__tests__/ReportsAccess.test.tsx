import { act, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { canShowNavigationItem, dashboardNavGroups } from "@/config/simplification";
import AdminDashboardPage from "@/app/(dashboard)/dashboard/admin/page";

vi.mock("@/features/admin/hooks/useAdminStats", () => ({ useAdminOverview: () => ({ data: { activeProjects: 3, completedProjects: 2, teamUtilization: 70 }, isLoading: false, error: null }) }));
vi.mock("@/features/admin/components/reports/TaskSupervisionReport", () => ({ TaskSupervisionReport: () => null }));

beforeEach(() => useAuthStore.setState({ role: null, permissions: [] }));

it("Open reports from dashboard navigation", () => {
	useAuthStore.setState({ role: "super-admin", permissions: [] });
	const reports = dashboardNavGroups.flatMap((group) => group.items).find((item) => item.id === "reports")!;
	expect(canShowNavigationItem(reports, { role: "super-admin", hasPermission: useAuthStore.getState().hasPermission })).toBe(true);
	render(<AdminDashboardPage />);
	expect(screen.getByRole("heading", { name: "Reports" })).toBeVisible();
	expect(screen.getByText("Operational project and attendance overview")).toBeVisible();
	expect(screen.getByText("Attendance Summary")).toBeVisible();
});

it("allows an admin with view_admin_stats and denies one without it", () => {
	useAuthStore.setState({ role: "admin", permissions: [{ permissionName: "view_admin_stats", access: true }] });
	const { rerender } = render(<AdminDashboardPage />);
	expect(screen.getByRole("heading", { name: "Reports" })).toBeVisible();
	act(() => { useAuthStore.setState({ role: "admin", permissions: [] }); });
	rerender(<AdminDashboardPage />);
	expect(screen.queryByRole("heading", { name: "Reports" })).not.toBeInTheDocument();
});
