import api from "@/lib/axios";
import type { CreateEmployeeOvertimeRequestPayload, EmployeeOvertimeRequest, EmployeeOvertimeRequestsResponse, ReviewEmployeeOvertimeRequestPayload } from "../types/overtime-requests";

export const overtimeRequestsApi = {
	getEmployeeOvertimeRequests: async (employeeId: number, year: number, month: number): Promise<EmployeeOvertimeRequestsResponse> => {
		const response = await api.get(`/employees/${employeeId}/overtime-requests`, { params: { year, month } });
		return response.data.data;
	},

	createEmployeeOvertimeRequest: async (employeeId: number, payload: CreateEmployeeOvertimeRequestPayload): Promise<EmployeeOvertimeRequest> => {
		const response = await api.post(`/employees/${employeeId}/overtime-requests`, payload);
		return response.data.data;
	},

	approveEmployeeOvertimeRequest: async (id: number, payload: ReviewEmployeeOvertimeRequestPayload = {}): Promise<EmployeeOvertimeRequest> => {
		const response = await api.post(`/employee-overtime-requests/${id}/approve`, payload);
		return response.data.data;
	},

	rejectEmployeeOvertimeRequest: async (id: number, payload: ReviewEmployeeOvertimeRequestPayload = {}): Promise<EmployeeOvertimeRequest> => {
		const response = await api.post(`/employee-overtime-requests/${id}/reject`, payload);
		return response.data.data;
	},

	cancelEmployeeOvertimeRequest: async (id: number, payload: ReviewEmployeeOvertimeRequestPayload = {}): Promise<EmployeeOvertimeRequest> => {
		const response = await api.post(`/employee-overtime-requests/${id}/cancel`, payload);
		return response.data.data;
	},
};
