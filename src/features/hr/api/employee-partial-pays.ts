import api from "@/lib/axios";
import type { CreateEmployeePartialPayPayload, EmployeePartialPay, EmployeePartialPayPreview, EmployeePartialPayReviewPayload, EmployeePartialPaysResponse } from "../types/employee-partial-pays";

export const employeePartialPaysApi = {
	getEmployeePartialPays: async (employeeId: number, year: number, month: number): Promise<EmployeePartialPaysResponse> => {
		const response = await api.get(`/employees/${employeeId}/partial-pays`, { params: { year, month } });
		return response.data.data;
	},

	previewEmployeePartialPay: async (employeeId: number, payload: CreateEmployeePartialPayPayload): Promise<EmployeePartialPayPreview> => {
		const response = await api.post(`/employees/${employeeId}/partial-pays/preview`, payload);
		return response.data.data;
	},

	createEmployeePartialPay: async (employeeId: number, payload: CreateEmployeePartialPayPayload): Promise<EmployeePartialPay> => {
		const response = await api.post(`/employees/${employeeId}/partial-pays`, payload);
		return response.data.data;
	},

	approveEmployeePartialPay: async (id: number, payload: EmployeePartialPayReviewPayload = {}): Promise<EmployeePartialPay> => {
		const response = await api.post(`/employee-partial-pays/${id}/approve`, payload);
		return response.data.data;
	},

	cancelEmployeePartialPay: async (id: number, payload: EmployeePartialPayReviewPayload = {}): Promise<EmployeePartialPay> => {
		const response = await api.post(`/employee-partial-pays/${id}/cancel`, payload);
		return response.data.data;
	},
};
