import api from "@/lib/axios";
import type { CreateHrPolicyPayload, HrPolicy } from "../types";

const BASE_URL = "/hr/policies";

export const hrPoliciesApi = {
	getCurrent: async (): Promise<HrPolicy> => {
		const response = await api.get(`${BASE_URL}/current`);
		return response.data.data;
	},

	getAll: async (): Promise<HrPolicy[]> => {
		const response = await api.get(BASE_URL);
		return response.data.data;
	},

	create: async (payload: CreateHrPolicyPayload): Promise<HrPolicy> => {
		const response = await api.post(BASE_URL, payload);
		return response.data.data;
	},
};
