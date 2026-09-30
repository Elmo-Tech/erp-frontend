import api from "@/lib/axios";
import type { EvaluateLateDeductionsPayload, LateDeductionRecord, LateDeductionsResponse, OverrideLateDeductionPayload } from "../types/late-deductions";

export const lateDeductionsApi = {
	getEmployeeLateDeductions: async (employeeId: number, year: number, month: number): Promise<LateDeductionsResponse> => {
		const response = await api.get(`/employees/${employeeId}/late-deductions`, { params: { year, month } });
		return response.data.data;
	},

	evaluateEmployeeLateDeductions: async (employeeId: number, year: number, month: number): Promise<LateDeductionsResponse> => {
		const payload: EvaluateLateDeductionsPayload = { year, month };
		const response = await api.post(`/employees/${employeeId}/late-deductions/evaluate`, payload);
		return response.data.data;
	},

	overrideLateDeduction: async (id: number, payload: OverrideLateDeductionPayload): Promise<LateDeductionRecord> => {
		const response = await api.put(`/employee-late-deductions/${id}/override`, payload);
		return response.data.data;
	},
};
