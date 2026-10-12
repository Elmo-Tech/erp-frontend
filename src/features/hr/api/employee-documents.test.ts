import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { MAX_EMPLOYEE_DOCUMENT_SIZE, validateEmployeeDocumentFile, validateEmployeeDocumentUpload } from "../lib/employee-documents";
import type { EmployeeDocument } from "../types/employee-document";
import { employeeDocumentsApi } from "./employee-documents";

vi.mock("@/lib/axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		delete: vi.fn(),
	},
}));

const employeeDocument: EmployeeDocument = {
	id: 8,
	employeeId: 12,
	name: "Signed employment agreement",
	documentType: "Contract",
	originalFilename: "employment-agreement.pdf",
	mimeType: "application/pdf",
	size: 1024,
	uploadedBy: 4,
	createdAt: "2026-01-10T12:00:00.000Z",
};

describe("employee documents", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("validates the required upload details, permitted extensions, and 10 MB limit", () => {
		const validFile = new File(["document"], "agreement.PDF", { type: "application/pdf" });

		expect(validateEmployeeDocumentUpload({ name: "Agreement", documentType: "Contract", file: validFile })).toBeNull();
		expect(validateEmployeeDocumentUpload({ name: "", documentType: "Contract", file: validFile })).toBe("Enter a display name for this document.");
		expect(validateEmployeeDocumentFile(new File(["document"], "malware.exe"))).toMatch(/Accepted files/);
		expect(validateEmployeeDocumentFile({ name: "large.pdf", size: MAX_EMPLOYEE_DOCUMENT_SIZE + 1 } as File)).toBe("Document files must be 10 MB or smaller.");
	});

	it("lists, uploads, and deletes through the employee document endpoints", async () => {
		const file = new File(["document"], "agreement.pdf", { type: "application/pdf" });
		vi.mocked(api.get).mockResolvedValue({ data: { data: [employeeDocument] } });
		vi.mocked(api.post).mockResolvedValue({ data: { data: employeeDocument } });
		vi.mocked(api.delete).mockResolvedValue({});

		await expect(employeeDocumentsApi.getAll(12)).resolves.toEqual([employeeDocument]);
		await expect(employeeDocumentsApi.upload(12, { file, name: "Agreement", documentType: "Contract" })).resolves.toEqual(employeeDocument);
		await expect(employeeDocumentsApi.delete(8)).resolves.toBeUndefined();

		const formData = vi.mocked(api.post).mock.calls[0][1] as FormData;
		expect(api.get).toHaveBeenCalledWith("/employees/12/documents");
		expect(api.post).toHaveBeenCalledWith("/employees/12/documents", expect.any(FormData));
		expect(formData.get("file")).toBe(file);
		expect(formData.get("name")).toBe("Agreement");
		expect(formData.get("documentType")).toBe("Contract");
		expect(api.delete).toHaveBeenCalledWith("/employee-documents/8");
	});

	it("downloads authenticated blobs and always cleans up the object URL", async () => {
		const blob = new Blob(["document"], { type: "application/pdf" });
		const createObjectURL = vi.fn(() => "blob:employee-document");
		const revokeObjectURL = vi.fn();
		const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
		vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
		vi.mocked(api.get).mockResolvedValue({ data: blob });

		await employeeDocumentsApi.downloadFile(employeeDocument);

		expect(api.get).toHaveBeenCalledWith("/employee-documents/8/download", { responseType: "blob" });
		expect(createObjectURL).toHaveBeenCalledWith(blob);
		expect(click).toHaveBeenCalledOnce();
		expect((click.mock.instances[0] as HTMLAnchorElement).download).toBe("employment-agreement.pdf");
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:employee-document");
		expect(document.querySelector('a[href="blob:employee-document"]')).toBeNull();
	});

	it("cleans up the object URL when the browser download action fails", async () => {
		const blob = new Blob(["document"], { type: "application/pdf" });
		const revokeObjectURL = vi.fn();
		vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:employee-document"), revokeObjectURL });
		vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
			throw new Error("Download blocked");
		});
		vi.mocked(api.get).mockResolvedValue({ data: blob });

		await expect(employeeDocumentsApi.downloadFile(employeeDocument)).rejects.toThrow("Download blocked");

		expect(revokeObjectURL).toHaveBeenCalledWith("blob:employee-document");
		expect(document.querySelector('a[href="blob:employee-document"]')).toBeNull();
	});
});
