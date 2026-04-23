import type { EmployeeFilters } from "./types";

export const employeeKeys = {
	all: ["employees"] as const,
	lists: () => [...employeeKeys.all, "list"] as const,
	list: (filters?: EmployeeFilters) => [...employeeKeys.lists(), filters] as const,
	details: () => [...employeeKeys.all, "detail"] as const,
	detail: (id: number) => [...employeeKeys.details(), id] as const,
	performance: (id: number, year?: number, month?: number) => [...employeeKeys.all, "performance", id, year, month] as const,
	roles: () => [...employeeKeys.all, "roles"] as const,
	projectMembers: (projectId: number) => [...employeeKeys.all, "project-members", projectId] as const,
};
