import api from "@/lib/axios";
import type { CreateDirectEmployeeDeductionPayload, DirectDeductionType, DirectEmployeeDeduction, DirectEmployeeDeductionReviewPayload, DirectEmployeeDeductionsResponse, RejectDirectEmployeeDeductionPayload } from "../types/direct-employee-deductions";

export const directEmployeeDeductionsApi = {
	getActiveDeductionTypes: async (): Promise<DirectDeductionType[]> => {
		const response = await api.get("/deduction-types/active");
		return response.data.data;
	},

	getEmployeeDirectDeductions: async (employeeId: number, year: number, month: number): Promise<DirectEmployeeDeductionsResponse> => {
		const response = await api.get(`/employees/${employeeId}/deductions`, { params: { year, month: String(month).padStart(2, "0") } });
		return response.data.data;
	},

	createEmployeeDirectDeduction: async (employeeId: number, payload: CreateDirectEmployeeDeductionPayload): Promise<DirectEmployeeDeduction> => {
		const response = await api.post(`/employees/${employeeId}/deductions`, payload);
		return response.data.data;
	},

	approveEmployeeDirectDeduction: async (id: number, payload: DirectEmployeeDeductionReviewPayload = {}): Promise<DirectEmployeeDeduction> => {
		const response = await api.post(`/employee-deductions/${id}/approve`, payload);
		return response.data.data;
	},

	rejectEmployeeDirectDeduction: async (id: number, payload: RejectDirectEmployeeDeductionPayload): Promise<DirectEmployeeDeduction> => {
		const response = await api.post(`/employee-deductions/${id}/reject`, payload);
		return response.data.data;
	},

	cancelEmployeeDirectDeduction: async (id: number, payload: DirectEmployeeDeductionReviewPayload = {}): Promise<DirectEmployeeDeduction> => {
		const response = await api.post(`/employee-deductions/${id}/cancel`, payload);
		return response.data.data;
	},
};
