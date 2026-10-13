import { useQuery, type QueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { isValidPermissionMonth } from "../lib/short-permissions";
import type { EmployeeOverview } from "../types/employee-overview";

export function useEmployeeOverview(employeeId: number, month: string, enabled = true) {
	return useQuery({
		queryKey: ["employee-overview", employeeId, month],
		queryFn: async () => (await api.get<{ data: EmployeeOverview }>(`/employees/${employeeId}/overview`, { params: { month } })).data.data,
		enabled: enabled && employeeId > 0 && isValidPermissionMonth(month),
		staleTime: 0,
	});
}

export function refreshEmployeeHr(client: QueryClient, employeeId: number) {
	return Promise.all([
		client.invalidateQueries({ queryKey: ["employee-overview", employeeId] }),
		client.invalidateQueries({ queryKey: ["employee-hr-report", employeeId] }),
	]);
}
