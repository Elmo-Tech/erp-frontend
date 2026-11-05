import { describe, expect, it } from "vitest";
import { getBreadcrumbs } from "../breadcrumbs";

describe("getBreadcrumbs", () => {
	it("maps the dashboard root to My Workspace", () => {
		expect(getBreadcrumbs("/dashboard")).toEqual([{ label: "Overview" }, { label: "My Workspace" }]);
	});

	it("uses the sidebar group and item for a top-level section", () => {
		expect(getBreadcrumbs("/dashboard/finance/invoices")).toEqual([{ label: "Finance" }, { label: "Invoices", href: undefined }]);
	});

	it("prefers the most specific sidebar match", () => {
		expect(getBreadcrumbs("/dashboard/hr/admin/payroll").map((crumb) => crumb.label)).toEqual(["HR Admin", "Payroll"]);
	});

	it("links the section and record details but not unknown intermediate segments", () => {
		expect(getBreadcrumbs("/dashboard/clients/42/ledger")).toEqual([
			{ label: "CRM" },
			{ label: "Clients", href: "/dashboard/clients" },
			{ label: "Details", href: "/dashboard/clients/42" },
			{ label: "Ledger", href: undefined },
		]);
		expect(getBreadcrumbs("/dashboard/settings/crm/lead-sources").map((crumb) => crumb.href)).toEqual([undefined, "/dashboard/settings", undefined, undefined]);
	});

	it("handles routes outside the sidebar", () => {
		expect(getBreadcrumbs("/dashboard/profile")).toEqual([{ label: "Profile", href: undefined }]);
	});
});
