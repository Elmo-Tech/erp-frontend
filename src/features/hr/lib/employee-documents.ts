import type { UploadEmployeeDocumentPayload } from "../types/employee-document";

export const MAX_EMPLOYEE_DOCUMENT_SIZE = 10 * 1024 * 1024;

const acceptedExtensions = new Set(["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "xls", "xlsx", "csv"]);

export const employeeDocumentAcceptAttribute = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv";

export function validateEmployeeDocumentFile(file: File | null): string | null {
	if (!file) return "Select a document file.";

	const extension = file.name.split(".").pop()?.toLowerCase();
	if (!extension || !acceptedExtensions.has(extension)) {
		return "Accepted files: PDF, JPEG, PNG, WebP, DOC/DOCX, XLS/XLSX, and CSV.";
	}

	if (file.size > MAX_EMPLOYEE_DOCUMENT_SIZE) {
		return "Document files must be 10 MB or smaller.";
	}

	return null;
}

export function validateEmployeeDocumentUpload({ file, name, documentType }: Omit<UploadEmployeeDocumentPayload, "file"> & { file: File | null }): string | null {
	if (!name.trim()) return "Enter a display name for this document.";
	if (!documentType.trim()) return "Enter a document type.";

	return validateEmployeeDocumentFile(file);
}

export function downloadEmployeeDocumentBlob(blob: Blob, filename: string): void {
	const objectUrl = URL.createObjectURL(blob);
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
}
