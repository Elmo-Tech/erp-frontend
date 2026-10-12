import api from "@/lib/axios";
import type { ApproveEmployeeShortPermissionPayload, CreateEmployeeShortPermissionPayload, EmployeeShortPermission, EmployeeShortPermissionsResponse, PendingEmployeeShortPermission, ReviewEmployeeShortPermissionPayload } from "../types/short-permissions";

export const shortPermissionsApi = {
	getPendingShortPermissions: async (): Promise<PendingEmployeeShortPermission[]> => {
		const response = await api.get<{ data: { permissions: PendingEmployeeShortPermission[] } }>("/employee-short-permissions/pending");
		return response.data.data.permissions;
	},
	getEmployeeShortPermissions: async (employeeId: number, month: string): Promise<EmployeeShortPermissionsResponse> => {
		const response = await api.get(`/employees/${employeeId}/short-permissions`, { params: { month } });
		return response.data.data;
	},

	createEmployeeShortPermission: async (employeeId: number, payload: CreateEmployeeShortPermissionPayload): Promise<EmployeeShortPermission> => {
		const response = await api.post(`/employees/${employeeId}/short-permissions`, payload);
		return response.data.data;
	},

	updateEmployeeShortPermission: async (id: number, payload: CreateEmployeeShortPermissionPayload): Promise<EmployeeShortPermission> => {
		const response = await api.put(`/employee-short-permissions/${id}`, payload);
		return response.data.data;
	},

	approveEmployeeShortPermission: async (id: number, payload: ApproveEmployeeShortPermissionPayload): Promise<EmployeeShortPermission> => {
		const response = await api.post(`/employee-short-permissions/${id}/approve`, payload);
		return response.data.data;
	},

	rejectEmployeeShortPermission: async (id: number, payload: ReviewEmployeeShortPermissionPayload = {}): Promise<EmployeeShortPermission> => {
		const response = await api.post(`/employee-short-permissions/${id}/reject`, payload);
		return response.data.data;
	},

	cancelEmployeeShortPermission: async (id: number, payload: ReviewEmployeeShortPermissionPayload = {}): Promise<EmployeeShortPermission> => {
		const response = await api.post(`/employee-short-permissions/${id}/cancel`, payload);
		return response.data.data;
	},
};
