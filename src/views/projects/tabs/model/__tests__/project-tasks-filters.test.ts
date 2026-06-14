import { describe, expect, it } from "vitest";
import { ExecutionTaskStatus, ExecutionTaskStatusLabels, type Milestone, type ProjectMemberResource } from "@/features/projects/api/execution.api";
import { MilestoneStatus } from "@/shared/lib/statusHelpers";
import { buildProjectTaskFilterOptions, updateProjectTaskFilters } from "../project-tasks-filters";

function makeMilestone(overrides: Partial<Milestone> = {}): Milestone {
	return {
		milestoneId: 11,
		projectId: 2,
		title: "Phase 1",
		status: MilestoneStatus.PENDING,
		statusLabel: "Pending",
		progressPercentage: 0,
		paymentStageId: null,
		invoiceId: null,
		tasks: [],
		createdAt: "2026-06-01T10:00:00.000Z",
		updatedAt: "2026-06-02T10:00:00.000Z",
		...overrides,
	};
}

function makeMember(overrides: Partial<ProjectMemberResource> = {}): ProjectMemberResource {
	return {
		memberId: 9,
		projectId: 2,
		userId: 7,
		role: "developer",
		user: {
			userId: 7,
			name: "Hisham Atef",
			email: "hisham@example.com",
			avatar: null,
		},
		createdAt: "2026-06-01T10:00:00.000Z",
		...overrides,
	};
}

describe("project task filters model", () => {
	it("builds filter options only from backend-backed milestone, member, and status data", () => {
		const options = buildProjectTaskFilterOptions({
			milestones: [makeMilestone({ milestoneId: 11, title: "Phase 1" })],
			members: [
				makeMember({ userId: 7, user: { userId: 7, name: "Hisham Atef", email: "hisham@example.com", avatar: null } }),
				makeMember({ memberId: 10, userId: 8, user: null }),
			],
		});

		expect(options.milestones).toEqual([{ value: "11", label: "Phase 1" }]);
		expect(options.assignees).toEqual([{ value: "7", label: "Hisham Atef" }]);
		expect(options.statuses).toContainEqual({
			value: ExecutionTaskStatus.IN_PROGRESS,
			label: ExecutionTaskStatusLabels[ExecutionTaskStatus.IN_PROGRESS],
		});
	});

	it("keeps search, status, assignee, and due-date filters explicit and clearable", () => {
		const current = { search: "login", status: "to_do", assigneeId: 7, dueFrom: "2026-06-01", dueTo: "2026-06-30" };

		expect(updateProjectTaskFilters(current, { type: "search", value: "" })).toEqual({ status: "to_do", assigneeId: 7, dueFrom: "2026-06-01", dueTo: "2026-06-30", search: undefined });
		expect(updateProjectTaskFilters(current, { type: "status", value: undefined })).toEqual({ search: "login", status: undefined, assigneeId: 7, dueFrom: "2026-06-01", dueTo: "2026-06-30" });
		expect(updateProjectTaskFilters(current, { type: "assignee", value: undefined })).toEqual({ search: "login", status: "to_do", assigneeId: undefined, dueFrom: "2026-06-01", dueTo: "2026-06-30" });
		expect(updateProjectTaskFilters(current, { type: "dueFrom", value: "" })).toEqual({ search: "login", status: "to_do", assigneeId: 7, dueFrom: undefined, dueTo: "2026-06-30" });
		expect(updateProjectTaskFilters(current, { type: "dueTo", value: "" })).toEqual({ search: "login", status: "to_do", assigneeId: 7, dueFrom: "2026-06-01", dueTo: undefined });
	});

	it("keeps milestone and backlog filters mutually exclusive", () => {
		expect(updateProjectTaskFilters({ isInBacklog: true }, { type: "milestone", value: "11" })).toEqual({
			milestoneId: 11,
			isInBacklog: undefined,
		});

		expect(updateProjectTaskFilters({ milestoneId: 11, isInBacklog: undefined }, { type: "backlog" })).toEqual({
			milestoneId: undefined,
			isInBacklog: true,
		});

		expect(updateProjectTaskFilters({ isInBacklog: true }, { type: "backlog" })).toEqual({
			isInBacklog: undefined,
			milestoneId: undefined,
		});
	});
});
