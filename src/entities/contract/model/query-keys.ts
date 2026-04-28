import type { ContractFilters } from "./types";

export const contractKeys = {
	all: ["contracts"] as const,
	lists: () => [...contractKeys.all, "list"] as const,
	list: (filters?: ContractFilters) => [...contractKeys.lists(), filters] as const,
	details: () => [...contractKeys.all, "detail"] as const,
	detail: (id: number) => [...contractKeys.details(), id] as const,
	dueMilestones: () => [...contractKeys.all, "due-milestones"] as const,
};
