import { describe, expect, it } from "vitest";
import {
	addProjectMemberFormDefaults,
	buildInternalUserOptions,
	getProjectMemberInitials,
	getProjectMemberRoleConfig,
	mapAddProjectMemberFormToPayload,
	projectMemberRoleOptions,
} from "../project-team";

describe("project-team model", () => {
	it("exposes backend-supported project member roles", () => {
		expect(projectMemberRoleOptions).toEqual([
			{ value: "manager", label: "Manager" },
			{ value: "tech_lead", label: "Tech Lead" },
			{ value: "developer", label: "Developer" },
			{ value: "qa", label: "QA" },
			{ value: "designer", label: "Designer" },
		]);
	});

	it("builds display config and initials for project members", () => {
		expect(getProjectMemberRoleConfig("tech_lead")).toEqual({
			label: "Tech Lead",
			className: "bg-blue-50 text-blue-700 border-blue-200",
		});
		expect(getProjectMemberRoleConfig("architect")).toEqual({
			label: "architect",
			className: "bg-muted/70 text-muted-foreground border-border",
		});
		expect(getProjectMemberInitials("Mona Hassan")).toBe("MH");
	});

	it("maps internal users to combobox options", () => {
		expect(
			buildInternalUserOptions([
				{ id: 7, name: "Mona Hassan", email: "mona@example.test", role: "developer" },
				{ id: 8, name: "Omar Ali", email: "omar@example.test", role: null },
			]),
		).toEqual([
			{ value: "7", label: "Mona Hassan" },
			{ value: "8", label: "Omar Ali" },
		]);
	});

	it("keeps add member defaults and payload aligned with the API contract", () => {
		expect(addProjectMemberFormDefaults).toEqual({ userId: "", role: "developer" });
		expect(mapAddProjectMemberFormToPayload({ userId: "7", role: "tech_lead" })).toEqual({
			userId: 7,
			role: "tech_lead",
		});
	});
});
