import { describe, expect, it } from "vitest";
import { ProjectStatus } from "@/entities/project/model/types";
import { mapProjectListResponse, mapProjectResource, type RawProjectListResponse, type RawProjectResource } from "../project.api";

describe("project API mappers", () => {
	it("maps project resources without inventing non-contract fields", () => {
		const raw: RawProjectResource = {
			projectId: 9,
			clientId: 3,
			quotationId: null,
			title: "Operations Portal",
			description: null,
			status: ProjectStatus.ACTIVE,
			previousStatus: null,
			budget: null,
			canViewBudget: false,
			deadline: null,
			uiApprovedAt: null,
			autoApprovalJobId: null,
			progress: 35,
			totalTimeSpent: 180,
			isPinned: true,
			client: {
				clientId: 3,
				name: "Acme",
				email: "ops@acme.test",
				company: "Acme LLC",
				phone: null,
			},
			createdAt: "2026-06-01T10:00:00.000Z",
			updatedAt: "2026-06-02T10:00:00.000Z",
			createdBy: 1,
			updatedBy: null,
		};

		const project = mapProjectResource(raw);

		expect(project).toEqual({
			projectId: 9,
			clientId: 3,
			quotationId: null,
			title: "Operations Portal",
			description: null,
			status: ProjectStatus.ACTIVE,
			previousStatus: null,
			budget: null,
			canViewBudget: false,
			deadline: null,
			uiApprovedAt: null,
			progress: 35,
			totalTimeSpent: 180,
			isPinned: true,
			client: raw.client,
			members: undefined,
			files: undefined,
			createdAt: "2026-06-01T10:00:00.000Z",
			updatedAt: "2026-06-02T10:00:00.000Z",
			createdBy: 1,
			updatedBy: null,
		});
		expect("currency" in project).toBe(false);
		expect(project.budget).toBeNull();
	});

	it("maps list envelopes through explicit raw project rows", () => {
		const raw: RawProjectListResponse = {
			projects: [],
			pagination: {
				total: 0,
				count: 0,
				perPage: 15,
				currentPage: 1,
				totalPages: 1,
			},
		};

		expect(mapProjectListResponse(raw)).toEqual(raw);
	});
});
