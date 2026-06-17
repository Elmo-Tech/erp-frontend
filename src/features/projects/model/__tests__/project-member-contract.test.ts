import { describe, expect, it } from "vitest";
import { mapProjectMemberListData, mapProjectMemberResource, type RawProjectMemberResource } from "../project-member-contract";

function makeRawMember(overrides: Partial<RawProjectMemberResource> = {}): RawProjectMemberResource {
	return {
		memberId: 5,
		projectId: 2,
		userId: 7,
		role: "tech_lead",
		user: {
			userId: 7,
			name: "Mona Hassan",
			email: "mona@example.test",
			avatar: null,
		},
		createdAt: "2026-06-01T10:00:00.000Z",
		internalCostRate: 120,
		permissions: ["manage_all_projects"],
		...overrides,
	};
}

describe("project member contract", () => {
	it("maps backend member resources to the frontend member contract", () => {
		const member = mapProjectMemberResource(makeRawMember());

		expect(member).toEqual({
			memberId: 5,
			projectId: 2,
			userId: 7,
			role: "tech_lead",
			user: {
				userId: 7,
				name: "Mona Hassan",
				email: "mona@example.test",
				avatar: null,
			},
			createdAt: "2026-06-01T10:00:00.000Z",
		});
		expect("internalCostRate" in member).toBe(false);
		expect("permissions" in member).toBe(false);
	});

	it("maps member lists through the same resource contract", () => {
		expect(mapProjectMemberListData({ members: [makeRawMember({ memberId: 6, role: "developer" })] })).toEqual([
			expect.objectContaining({
				memberId: 6,
				role: "developer",
			}),
		]);
	});
});
