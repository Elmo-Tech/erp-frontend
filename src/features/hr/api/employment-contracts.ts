import api from "@/lib/axios";
import type { EmploymentContract, EmploymentContractPayload } from "../types/employment-contract";

export const employmentContractsApi = {
	getAll: async (employeeId: number): Promise<EmploymentContract[]> => {
		const response = await api.get(`/employees/${employeeId}/employment-contracts`);
		return response.data.data;
	},

	create: async (employeeId: number, payload: EmploymentContractPayload): Promise<EmploymentContract> => {
		const response = await api.post(`/employees/${employeeId}/employment-contracts`, payload);
		return response.data.data;
	},

	update: async (id: number, payload: EmploymentContractPayload): Promise<EmploymentContract> => {
		const response = await api.put(`/employment-contracts/${id}`, payload);
		return response.data.data;
	},
};
