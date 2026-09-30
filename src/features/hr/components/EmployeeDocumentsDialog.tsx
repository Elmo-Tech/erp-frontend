"use client";

import { useState } from "react";
import { AlertCircle, Download, FileImage, FileSpreadsheet, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleApiError } from "@/lib/errorHandling";
import { employeeDocumentsApi } from "../api/employee-documents";
import { employeeDocumentAcceptAttribute, validateEmployeeDocumentFile, validateEmployeeDocumentUpload } from "../lib/employee-documents";
import { useDeleteEmployeeDocument, useEmployeeDocuments, useUploadEmployeeDocument } from "../hooks/useEmployeeDocuments";
import type { EmployeeDocument } from "../types/employee-document";

interface EmployeeDocumentsPanelProps {
	employeeId: number;
	employeeName: string;
	canManage: boolean;
	isActive: boolean;
}

function formatFileSize(size: number): string {
	if (!Number.isFinite(size) || size < 0) return "Unknown size";
	if (size < 1024) return `${size} B`;
	if (size < 1024 * 1024) return `${(size / 1024).toLocaleString(undefined, { maximumFractionDigits: 1 })} KB`;
	return `${(size / (1024 * 1024)).toLocaleString(undefined, { maximumFractionDigits: 1 })} MB`;
}

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function DocumentIcon({ document }: { document: EmployeeDocument }) {
	const value = `${document.mimeType ?? ""} ${document.originalFilename}`.toLowerCase();
	if (value.includes("image/") || /\.(jpe?g|png|webp)$/.test(value)) return <FileImage className="h-5 w-5 text-muted-foreground" />;
	if (value.includes("spreadsheet") || value.includes("csv") || /\.(xls|xlsx|csv)$/.test(value)) return <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />;
	return <FileText className="h-5 w-5 text-muted-foreground" />;
}

export function EmployeeDocumentsPanel({ employeeId, employeeName, canManage, isActive }: EmployeeDocumentsPanelProps) {
	const [name, setName] = useState("");
	const [documentType, setDocumentType] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [fileInputKey, setFileInputKey] = useState(0);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = useState<EmployeeDocument | null>(null);
	const documentsQuery = useEmployeeDocuments(employeeId, isActive && canManage);
	const uploadDocument = useUploadEmployeeDocument();
	const deleteDocument = useDeleteEmployeeDocument();
	const documents = [...(documentsQuery.data ?? [])].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

	const resetUploadForm = () => {
		setName("");
		setDocumentType("");
		setFile(null);
		setFileInputKey((key) => key + 1);
		setUploadError(null);
	};

	const handleFileChange = (selectedFile: File | null) => {
		setFile(selectedFile);
		setUploadError(validateEmployeeDocumentFile(selectedFile));
		if (selectedFile && !name.trim()) setName(selectedFile.name.replace(/\.[^.]+$/, ""));
	};

	const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const validationError = validateEmployeeDocumentUpload({ file, name, documentType });
		if (validationError) {
			setUploadError(validationError);
			return;
		}
		if (!file) return;

		try {
			await uploadDocument.mutateAsync({ employeeId, payload: { file, name: name.trim(), documentType: documentType.trim() } });
			toast.success("Employee document uploaded");
			resetUploadForm();
		} catch (error) {
			setUploadError(handleApiError(error));
		}
	};

	const handleDownload = async (document: EmployeeDocument) => {
		try {
			await employeeDocumentsApi.downloadFile(document);
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	const handleDelete = async () => {
		if (!pendingDelete) return;

		try {
			await deleteDocument.mutateAsync({ id: pendingDelete.id, employeeId });
			toast.success("Employee document permanently deleted");
			setPendingDelete(null);
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	if (!canManage) return null;

	return (
		<>
			<div className="space-y-5">
				<div>
					<h2 className="text-lg font-semibold">Documents for {employeeName}</h2>
					<p className="text-sm text-muted-foreground">Upload, download, and securely manage documents stored for this employee.</p>
				</div>

					<section className="space-y-3">
						<div>
							<h3 className="font-semibold">Upload document</h3>
							<p className="text-sm text-muted-foreground">Accepted: PDF, JPEG, PNG, WebP, DOC/DOCX, XLS/XLSX, and CSV. Maximum size: 10 MB.</p>
						</div>
						<form className="space-y-4 rounded-lg border p-4" onSubmit={handleUpload}>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="employee-document-name">Display name</Label>
									<Input id="employee-document-name" value={name} onChange={(event) => { setName(event.target.value); setUploadError(null); }} placeholder="e.g. Signed employment agreement" disabled={uploadDocument.isPending} />
								</div>
								<div className="space-y-2">
									<Label htmlFor="employee-document-type">Document type</Label>
									<Input id="employee-document-type" value={documentType} onChange={(event) => { setDocumentType(event.target.value); setUploadError(null); }} placeholder="e.g. Contract" disabled={uploadDocument.isPending} />
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="employee-document-file">File</Label>
								<Input key={fileInputKey} id="employee-document-file" type="file" accept={employeeDocumentAcceptAttribute} onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)} disabled={uploadDocument.isPending} />
							</div>
							{uploadError && (
								<Alert variant="destructive">
									<AlertCircle />
									<AlertDescription>{uploadError}</AlertDescription>
								</Alert>
							)}
							<DialogFooter>
								<Button type="submit" disabled={uploadDocument.isPending}>
									{uploadDocument.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
									Upload document
								</Button>
							</DialogFooter>
						</form>
					</section>

					<section className="space-y-3 border-t pt-5">
						<div>
							<h3 className="font-semibold">Stored documents</h3>
							<p className="text-sm text-muted-foreground">Newest documents appear first. Downloads require your current authorization.</p>
						</div>
						{documentsQuery.isLoading ? (
							<div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
								<Loader2 className="animate-spin" />
								Loading employee documents...
							</div>
						) : documentsQuery.isError ? (
							<Alert variant="destructive">
								<AlertCircle />
								<AlertTitle>Unable to load employee documents</AlertTitle>
								<AlertDescription className="flex flex-wrap items-center gap-2">
									<span>{handleApiError(documentsQuery.error)}</span>
									<Button type="button" variant="outline" size="sm" onClick={() => documentsQuery.refetch()}>
										Try again
									</Button>
								</AlertDescription>
							</Alert>
						) : documents.length === 0 ? (
							<div className="rounded-lg border border-dashed px-4 py-10 text-center">
								<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
								<p className="font-medium">No documents stored</p>
								<p className="mt-1 text-sm text-muted-foreground">Upload a document to keep it securely associated with this employee.</p>
							</div>
						) : (
							<div className="space-y-3">
								{documents.map((document) => (
									<div key={document.id} className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between">
										<div className="flex min-w-0 gap-3">
											<DocumentIcon document={document} />
											<div className="min-w-0 space-y-1">
												<div className="flex flex-wrap items-center gap-2">
													<p className="font-medium">{document.name}</p>
													<Badge variant="outline">{document.documentType}</Badge>
												</div>
												<p className="truncate text-sm text-muted-foreground" title={document.originalFilename}>{document.originalFilename}</p>
												<p className="text-sm text-muted-foreground">{formatFileSize(document.size)} · Uploaded {formatDate(document.createdAt)}{document.uploadedBy != null ? ` · User #${document.uploadedBy}` : ""}</p>
											</div>
										</div>
										<div className="flex shrink-0 gap-2">
											<Button type="button" variant="outline" size="sm" onClick={() => void handleDownload(document)}>
												<Download />
												Download
											</Button>
											<Button type="button" variant="destructive" size="sm" disabled={deleteDocument.isPending} onClick={() => setPendingDelete(document)}>
												<Trash2 />
												Delete
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</section>
			</div>

			<AlertDialog open={Boolean(pendingDelete)} onOpenChange={(isOpen) => { if (!isOpen) setPendingDelete(null); }}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {pendingDelete?.name ?? "employee document"}?</AlertDialogTitle>
						<AlertDialogDescription>This permanently removes the stored file and cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteDocument.isPending}>Keep document</AlertDialogCancel>
						<AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" disabled={deleteDocument.isPending} onClick={() => void handleDelete()}>
							{deleteDocument.isPending && <Loader2 className="animate-spin" />}
							Permanently delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
