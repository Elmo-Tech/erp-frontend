import type { ProjectFilters } from "./types";

export const projectKeys = {
	all: ["projects"] as const,
	lists: () => [...projectKeys.all, "list"] as const,
	list: (filters?: ProjectFilters) => [...projectKeys.lists(), filters] as const,
	client: (clientId: number) => [...projectKeys.lists(), "client", clientId] as const,
	details: () => [...projectKeys.all, "detail"] as const,
	detail: (id: number) => [...projectKeys.details(), id] as const,
	members: (projectId: number) => [...projectKeys.all, "members", projectId] as const,
	pinned: () => [...projectKeys.all, "pinned"] as const,
};
