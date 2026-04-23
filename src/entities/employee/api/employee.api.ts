import api from "@/shared/api/base";
import type {
	CreateEmployeePayload,
	CreateProjectMemberPayload,
	Employee,
	EmployeeFilters,
	EmployeeListResponse,
	EmployeePerformance,
	EmployeeRole,
	ProjectMember,
	ProjectMemberListResponse,
	UpdateEmployeePayload,
	UpdateProjectMemberPayload,
} from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

function buildEmployeeParams(filters?: EmployeeFilters) {
	const params = new URLSearchParams();

	if (filters?.search) {
		params.append("filter[search]", filters.search);
	}

	if (typeof filters?.isActive === "boolean") {
		params.append("filter[isActive]", String(filters.isActive));
	}

	if (filters?.page) {
		params.append("page", String(filters.page));
	}

	if (filters?.perPage) {
		params.append("perPage", String(filters.perPage));
	}

	return params;
}

function withQuery(path: string, params: URLSearchParams) {
	const query = params.toString();

	return query ? `${path}?${query}` : path;
}

export const employeeApi = {
	async getEmployees(filters?: EmployeeFilters): Promise<EmployeeListResponse> {
		const response = await api.get<ApiEnvelope<EmployeeListResponse>>(withQuery("/employees", buildEmployeeParams(filters)));

		return response.data.data;
	},

	async getEmployee(id: number): Promise<Employee> {
		const response = await api.get<ApiEnvelope<Employee>>(`/employees/${id}`);

		return response.data.data;
	},

	async createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
		const response = await api.post<ApiEnvelope<Employee>>("/employees", payload);

		return response.data.data;
	},

	async updateEmployee(id: number, payload: UpdateEmployeePayload): Promise<Employee> {
		const response = await api.put<ApiEnvelope<Employee>>(`/employees/${id}`, payload);

		return response.data.data;
	},

	async activateEmployee(id: number): Promise<Employee> {
		const response = await api.post<ApiEnvelope<Employee>>(`/employees/${id}/activate`);

		return response.data.data;
	},

	async deactivateEmployee(id: number): Promise<Employee> {
		const response = await api.post<ApiEnvelope<Employee>>(`/employees/${id}/deactivate`);

		return response.data.data;
	},

	async getEmployeePerformance(id: number, year?: number, month?: number): Promise<EmployeePerformance> {
		const params = new URLSearchParams();
		if (year) {
			params.append("year", String(year));
		}
		if (month) {
			params.append("month", String(month));
		}

		const response = await api.get<ApiEnvelope<EmployeePerformance>>(withQuery(`/employees/${id}/performance`, params));

		return response.data.data;
	},

	async getRoles(): Promise<EmployeeRole[]> {
		const response = await api.get<ApiEnvelope<EmployeeRole[]>>("/admin/roles");

		return response.data.data;
	},

	async getProjectMembers(projectId: number): Promise<ProjectMemberListResponse> {
		const response = await api.get<ApiEnvelope<ProjectMemberListResponse>>(`/projects/${projectId}/members`);

		return response.data.data;
	},

	async addProjectMember(projectId: number, payload: CreateProjectMemberPayload): Promise<ProjectMember> {
		const response = await api.post<ApiEnvelope<ProjectMember>>(`/projects/${projectId}/members`, payload);

		return response.data.data;
	},

	async updateProjectMember(projectId: number, memberId: number, payload: UpdateProjectMemberPayload): Promise<ProjectMember> {
		const response = await api.put<ApiEnvelope<ProjectMember>>(`/projects/${projectId}/members/${memberId}`, payload);

		return response.data.data;
	},

	async removeProjectMember(projectId: number, memberId: number): Promise<void> {
		await api.delete(`/projects/${projectId}/members/${memberId}`);
	},
};
