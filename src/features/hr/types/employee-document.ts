export interface EmployeeDocument {
	id: number;
	employeeId: number;
	name: string;
	documentType: string;
	originalFilename: string;
	mimeType?: string | null;
	size: number;
	uploadedBy?: number | null;
	createdAt: string;
}

export interface UploadEmployeeDocumentPayload {
	file: File;
	name: string;
	documentType: string;
}
