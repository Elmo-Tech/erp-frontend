import type { LeadFilters } from "./types";

export const leadKeys = {
	all: ["leads"] as const,
	lists: () => [...leadKeys.all, "list"] as const,
	list: (filters?: LeadFilters) => [...leadKeys.lists(), filters] as const,
	details: () => [...leadKeys.all, "detail"] as const,
	detail: (id: number) => [...leadKeys.details(), id] as const,
	kanban: () => [...leadKeys.all, "kanban"] as const,
	followUps: () => [...leadKeys.all, "follow-ups"] as const,
};
