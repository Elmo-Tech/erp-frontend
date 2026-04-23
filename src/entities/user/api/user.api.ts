import api from "@/shared/api/base";
import type { EmployeeFilters, EmployeeListResponse } from "../model/employee";

interface ApiEnvelope<T> {
	data: T;
}

function buildEmployeeParams(filters?: EmployeeFilters) {
	const params: Record<string, string | number | boolean> = {};

	if (filters?.search) {
		params["filter[search]"] = filters.search;
	}

	if (typeof filters?.isActive === "boolean") {
		params["filter[isActive]"] = filters.isActive;
	}

	if (filters?.page) {
		params.page = filters.page;
	}

	if (filters?.perPage) {
		params.perPage = filters.perPage;
	}

	return params;
}

export const userApi = {
	async getEmployees(filters?: EmployeeFilters): Promise<EmployeeListResponse> {
		const response = await api.get<ApiEnvelope<EmployeeListResponse>>("/employees", {
			params: buildEmployeeParams(filters),
		});

		return response.data.data;
	},
};
