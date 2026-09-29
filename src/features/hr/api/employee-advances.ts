import api from "@/lib/axios";
import type { ApproveEmployeeAdvancePayload, CreateEmployeeAdvancePayload, DisburseEmployeeAdvancePayload, EmployeeAdvance, EmployeeAdvanceReviewPayload, EmployeeAdvancesResponse, SettleEmployeeAdvanceSettlementPayload } from "../types/employee-advances";

export const employeeAdvancesApi = {
	getEmployeeAdvances: async (employeeId: number, year: number, month: number): Promise<EmployeeAdvancesResponse> => {
		const response = await api.get(`/employees/${employeeId}/advances`, { params: { year, month: String(month).padStart(2, "0") } });
		return response.data.data;
	},

	getEmployeeAdvance: async (id: number): Promise<EmployeeAdvance> => {
		const response = await api.get(`/employee-advances/${id}`);
		return response.data.data;
	},

	createEmployeeAdvance: async (employeeId: number, payload: CreateEmployeeAdvancePayload): Promise<EmployeeAdvance> => {
		const response = await api.post(`/employees/${employeeId}/advances`, payload);
		return response.data.data;
	},

	approveEmployeeAdvance: async (id: number, payload: ApproveEmployeeAdvancePayload = {}): Promise<EmployeeAdvance> => {
		const response = await api.post(`/employee-advances/${id}/approve`, payload);
		return response.data.data;
	},

	rejectEmployeeAdvance: async (id: number, payload: EmployeeAdvanceReviewPayload = {}): Promise<EmployeeAdvance> => {
		const response = await api.post(`/employee-advances/${id}/reject`, payload);
		return response.data.data;
	},

	cancelEmployeeAdvance: async (id: number, payload: EmployeeAdvanceReviewPayload = {}): Promise<EmployeeAdvance> => {
		const response = await api.post(`/employee-advances/${id}/cancel`, payload);
		return response.data.data;
	},

	disburseEmployeeAdvance: async (id: number, payload: DisburseEmployeeAdvancePayload = {}): Promise<EmployeeAdvance> => {
		const response = await api.post(`/employee-advances/${id}/disburse`, payload);
		return response.data.data;
	},

	settleEmployeeAdvanceSettlement: async (id: number, payload: SettleEmployeeAdvanceSettlementPayload = {}): Promise<EmployeeAdvance> => {
		const response = await api.post(`/employee-advance-settlements/${id}/settle`, payload);
		return response.data.data;
	},
};
