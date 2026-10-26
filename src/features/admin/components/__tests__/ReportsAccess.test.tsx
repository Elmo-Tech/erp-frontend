import { beforeEach, expect, it, vi } from "vitest";
import { dashboardNavGroups, isModuleEnabled, moduleKeys } from "@/config/simplification";
import ReportsPage from "@/app/(dashboard)/dashboard/admin/page";
import { redirect } from "next/navigation";

vi.mock("next/navigation", () => ({ redirect: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }) }));
beforeEach(() => vi.clearAllMocks());

it("hides the standalone Reports module from navigation", () => {
	expect(dashboardNavGroups.flatMap((group) => group.items).some((item) => item.id === "reports")).toBe(false);
	expect(isModuleEnabled(moduleKeys.reports)).toBe(false);
});

it("redirects direct visits to the old Reports page to the dashboard", () => {
	expect(() => ReportsPage()).toThrow("NEXT_REDIRECT");
	expect(redirect).toHaveBeenCalledWith("/dashboard");
});
