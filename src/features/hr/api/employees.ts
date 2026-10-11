import api from "@/lib/axios";
import type { Employee, EmployeeListResponse, EmployeeFilters, CreateEmployeePayload, UpdateEmployeePayload, EmployeePerformance } from "../types";

const BASE_URL = "/employees";

export const employeesApi = {
	getAll: async (filters?: EmployeeFilters): Promise<EmployeeListResponse> => {
		const params: Record<string, string | number | boolean> = {};

		if (filters?.search) params["filter[search]"] = filters.search;
		if (filters?.isActive !== undefined) params["filter[isActive]"] = filters.isActive;
		if (filters?.page) params.page = filters.page;
		if (filters?.perPage) params.perPage = filters.perPage;

		const response = await api.get(BASE_URL, { params });
		return response.data.data;
	},

	getById: async (id: number): Promise<Employee> => {
		const response = await api.get(`${BASE_URL}/${id}`);
		return response.data.data;
	},

	create: async (payload: CreateEmployeePayload): Promise<Employee> => {
		const response = await api.post(BASE_URL, payload);
		return response.data.data;
	},

	update: async (id: number, payload: UpdateEmployeePayload): Promise<Employee> => {
		const response = await api.put(`${BASE_URL}/${id}`, payload);
		return response.data.data;
	},

	uploadAvatar: async (id: number, avatar: File): Promise<Employee> => {
		const formData = new FormData();
		formData.append("avatar", avatar);

		const response = await api.post<{ data: Employee }>(`${BASE_URL}/${id}/avatar`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.data;
	},

	getPerformance: async (id: number, year?: number, month?: number): Promise<EmployeePerformance> => {
		const params: Record<string, number> = {};
		if (year) params.year = year;
		if (month) params.month = month;

		const response = await api.get(`${BASE_URL}/${id}/performance`, { params });
		return response.data.data;
	},

	deactivate: async (id: number): Promise<Employee> => {
		const response = await api.post(`${BASE_URL}/${id}/deactivate`);
		return response.data.data;
	},

	activate: async (id: number): Promise<Employee> => {
		const response = await api.post(`${BASE_URL}/${id}/activate`);
		return response.data.data;
	},

	remove: async (id: number): Promise<void> => {
		await api.delete(`${BASE_URL}/${id}`);
	},
};
