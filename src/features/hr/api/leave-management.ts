import api from "@/lib/axios";
import type { CreateEmployeeLeavePayload, CreateLeaveTypePayload, EmployeeLeave, EmployeeLeavesResponse, LeaveType, ReviewEmployeeLeavePayload, UpdateLeaveTypePayload } from "../types/leave-management";

export const leaveManagementApi = {
	getLeaveTypes: async (): Promise<LeaveType[]> => {
		const response = await api.get("/leave-types");
		return response.data.data;
	},

	getAllLeaveTypes: async (): Promise<LeaveType[]> => {
		const response = await api.get("/leave-types/all");
		return response.data.data;
	},

	createLeaveType: async (payload: CreateLeaveTypePayload): Promise<LeaveType> => {
		const response = await api.post("/leave-types", payload);
		return response.data.data;
	},

	updateLeaveType: async (id: number, payload: UpdateLeaveTypePayload): Promise<LeaveType> => {
		const response = await api.put(`/leave-types/${id}`, payload);
		return response.data.data;
	},

	getEmployeeLeaves: async (employeeId: number, year: number): Promise<EmployeeLeavesResponse> => {
		const response = await api.get(`/employees/${employeeId}/leaves`, { params: { year } });
		return response.data.data;
	},

	createEmployeeLeave: async (employeeId: number, payload: CreateEmployeeLeavePayload): Promise<EmployeeLeave> => {
		const response = await api.post(`/employees/${employeeId}/leaves`, payload);
		return response.data.data;
	},

	updateEmployeeLeave: async (id: number, payload: CreateEmployeeLeavePayload): Promise<EmployeeLeave> => {
		const response = await api.put(`/employee-leaves/${id}`, payload);
		return response.data.data;
	},

	approveEmployeeLeave: async (id: number, payload: ReviewEmployeeLeavePayload = {}): Promise<EmployeeLeave> => {
		const response = await api.post(`/employee-leaves/${id}/approve`, payload);
		return response.data.data;
	},

	rejectEmployeeLeave: async (id: number, payload: ReviewEmployeeLeavePayload = {}): Promise<EmployeeLeave> => {
		const response = await api.post(`/employee-leaves/${id}/reject`, payload);
		return response.data.data;
	},

	cancelEmployeeLeave: async (id: number, payload: ReviewEmployeeLeavePayload = {}): Promise<EmployeeLeave> => {
		const response = await api.post(`/employee-leaves/${id}/cancel`, payload);
		return response.data.data;
	},
};
