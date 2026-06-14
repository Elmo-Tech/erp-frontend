import { ExecutionTaskStatus, ExecutionTaskStatusLabels, type Milestone, type ProjectMemberResource, type ProjectTaskFilters } from "@/features/projects/api/execution.api";

export interface ProjectTaskFilterOption {
	value: string;
	label: string;
}

export interface ProjectTaskFilterOptions {
	statuses: ProjectTaskFilterOption[];
	milestones: ProjectTaskFilterOption[];
	assignees: ProjectTaskFilterOption[];
}

export type ProjectTaskFilterChange =
	| { type: "search"; value: string }
	| { type: "status"; value: string | undefined }
	| { type: "milestone"; value: string | undefined }
	| { type: "assignee"; value: string | undefined }
	| { type: "dueFrom"; value: string }
	| { type: "dueTo"; value: string }
	| { type: "backlog" };

export function buildProjectTaskFilterOptions({
	milestones,
	members,
}: {
	milestones: Milestone[];
	members: ProjectMemberResource[];
}): ProjectTaskFilterOptions {
	return {
		statuses: buildProjectTaskStatusOptions(),
		milestones: buildProjectTaskMilestoneOptions(milestones),
		assignees: buildProjectTaskAssigneeOptions(members),
	};
}

function buildProjectTaskStatusOptions(): ProjectTaskFilterOption[] {
	return Object.values(ExecutionTaskStatus).map((status) => ({
		value: status,
		label: ExecutionTaskStatusLabels[status],
	}));
}

function buildProjectTaskMilestoneOptions(milestones: Milestone[]): ProjectTaskFilterOption[] {
	return milestones.map((milestone) => ({
		value: String(milestone.milestoneId),
		label: milestone.title,
	}));
}

function buildProjectTaskAssigneeOptions(members: ProjectMemberResource[]): ProjectTaskFilterOption[] {
	return members
		.filter((member) => member.user)
		.map((member) => ({
			value: String(member.userId),
			label: member.user!.name,
		}));
}

export function updateProjectTaskFilters(current: ProjectTaskFilters, change: ProjectTaskFilterChange): ProjectTaskFilters {
	switch (change.type) {
		case "search":
			return { ...current, search: change.value || undefined };
		case "status":
			return { ...current, status: change.value };
		case "milestone":
			return {
				...current,
				milestoneId: change.value ? Number(change.value) : undefined,
				isInBacklog: undefined,
			};
		case "assignee":
			return { ...current, assigneeId: change.value ? Number(change.value) : undefined };
		case "dueFrom":
			return { ...current, dueFrom: change.value || undefined };
		case "dueTo":
			return { ...current, dueTo: change.value || undefined };
		case "backlog":
			return {
				...current,
				isInBacklog: current.isInBacklog ? undefined : true,
				milestoneId: undefined,
			};
	}
}
