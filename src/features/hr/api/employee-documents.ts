import api from "@/lib/axios";
import { downloadEmployeeDocumentBlob } from "../lib/employee-documents";
import type { EmployeeDocument, UploadEmployeeDocumentPayload } from "../types/employee-document";

export const employeeDocumentsApi = {
	getAll: async (employeeId: number): Promise<EmployeeDocument[]> => {
		const response = await api.get(`/employees/${employeeId}/documents`);
		return response.data.data;
	},

	upload: async (employeeId: number, payload: UploadEmployeeDocumentPayload): Promise<EmployeeDocument> => {
		const formData = new FormData();
		formData.append("file", payload.file);
		formData.append("name", payload.name);
		formData.append("documentType", payload.documentType);

		const response = await api.post<{ data: EmployeeDocument }>(`/employees/${employeeId}/documents`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.data;
	},

	download: async (id: number): Promise<Blob> => {
		const response = await api.get<Blob>(`/employee-documents/${id}/download`, { responseType: "blob" });
		return response.data;
	},

	downloadFile: async (document: Pick<EmployeeDocument, "id" | "originalFilename">): Promise<void> => {
		const blob = await employeeDocumentsApi.download(document.id);
		downloadEmployeeDocumentBlob(blob, document.originalFilename);
	},

	delete: async (id: number): Promise<void> => {
		await api.delete(`/employee-documents/${id}`);
	},
};
