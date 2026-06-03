import { describe, expect, it } from "vitest";
import { SYSTEM_PERMISSIONS } from "@/shared/config/permissions";
import { SidebarConfig } from "@/shared/config/sidebar";

describe("SYSTEM_PERMISSIONS dashboard split", () => {
	it("includes separate workspace and company analytics permissions", () => {
		expect(SYSTEM_PERMISSIONS).toContain("view_my_workspace");
		expect(SYSTEM_PERMISSIONS).toContain("view_global_stats");
	});

	it("includes team timer and granular calendar permissions", () => {
		expect(SYSTEM_PERMISSIONS).toEqual(
			expect.arrayContaining([
				"manage_team_timers",
				"view_calendar_events",
				"view_calendar_meetings",
				"view_calendar_tasks",
				"view_calendar_milestones",
				"view_calendar_invoices",
				"view_calendar_subscriptions",
				"collect_subscription_payments",
			]),
		);
	});

	it("exposes reports navigation behind view_reports", () => {
		const overviewGroup = SidebarConfig.find((group) => group.title === "Overview");
		const reportsItem = overviewGroup?.items.find((item) => item.href === "/dashboard/reports");

		expect(reportsItem).toMatchObject({
			title: "Reports",
			permission: "view_reports",
		});
	});
});
