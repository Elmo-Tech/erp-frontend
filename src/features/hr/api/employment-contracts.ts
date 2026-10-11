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

	remove: async (id: number): Promise<void> => {
		await api.delete(`/employment-contracts/${id}`);
	},

	uploadFile: async (id: number, file: File): Promise<EmploymentContract> => {
		const formData = new FormData();
		formData.append("file", file);
		const response = await api.post<{ data: EmploymentContract }>(`/employment-contracts/${id}/file`, formData);
		return response.data.data;
	},

	deleteFile: async (id: number): Promise<EmploymentContract> => {
		const response = await api.delete<{ data: EmploymentContract }>(`/employment-contracts/${id}/file`);
		return response.data.data;
	},

	downloadFile: async (id: number, filename: string): Promise<void> => {
		const response = await api.get<Blob>(`/employment-contracts/${id}/file`, { responseType: "blob" });
		const objectUrl = URL.createObjectURL(response.data);
		const link = document.createElement("a");
		link.href = objectUrl;
		link.download = filename;
		link.style.display = "none";
		try {
			document.body.appendChild(link);
			link.click();
		} finally {
			link.remove();
			URL.revokeObjectURL(objectUrl);
		}
	},
};
