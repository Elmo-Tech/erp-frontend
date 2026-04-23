import type { TaskFilters } from "./types";

export const taskKeys = {
	all: ["tasks"] as const,
	lists: () => [...taskKeys.all, "list"] as const,
	list: (filters?: TaskFilters) => [...taskKeys.lists(), filters] as const,
	myAssignedRoot: () => [...taskKeys.all, "my-assigned"] as const,
	myAssigned: (filters?: TaskFilters) => [...taskKeys.myAssignedRoot(), filters] as const,
	details: () => [...taskKeys.all, "detail"] as const,
	detail: (id: number) => [...taskKeys.details(), id] as const,
	children: () => [...taskKeys.all, "children"] as const,
	taskChildren: (id: number) => [...taskKeys.children(), id] as const,
	projectTasksRoot: (projectId: number) => [...taskKeys.all, "project", projectId] as const,
	projectTasks: (projectId: number, page?: number, perPage?: number) => [...taskKeys.projectTasksRoot(projectId), page, perPage] as const,
	tags: () => ["tags"] as const,
	testScenarios: (taskId: number) => [...taskKeys.all, "test-scenarios", taskId] as const,
	activities: (taskId: number) => [...taskKeys.all, "activities", taskId] as const,
	pointsSummary: (projectId: number) => [...taskKeys.all, "points-summary", projectId] as const,
};
