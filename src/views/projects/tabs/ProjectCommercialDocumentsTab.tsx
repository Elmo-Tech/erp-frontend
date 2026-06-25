"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileSignature, FileText, ReceiptText, Upload } from "lucide-react";
import { toast } from "sonner";
import { useDeleteProjectFile, useProjectFiles, useProjectSalesDocuments, useUploadProjectFile } from "@/features/projects/api/execution.api";
import type { ProjectFile } from "@/entities/project/model/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/Can";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import {
	buildProjectFileUploadDefaults,
	buildProjectFileUploadFormData,
	getProjectFileCategoryClass,
	projectFileUploadDefaults,
	projectFileUploadSchema,
	type ProjectFileUploadFormData,
} from "./model/project-files";
import { ProjectFileDeleteDialog } from "./ui/ProjectFileDeleteDialog";
import { ProjectFileUploadDialog } from "./ui/ProjectFileUploadDialog";

const commercialDocumentCategories = ["proposal", "quotation", "contract"] as const;

interface CommercialDocumentRow {
	documentId: string;
	projectFile?: ProjectFile;
	name: string;
	category: "proposal" | "quotation" | "contract";
	status?: string;
	fileUrl?: string | null;
	description?: string | null;
	createdAt: string;
	source: "sales" | "project_file";
}

const documentColumns: Column<CommercialDocumentRow>[] = [
	{
		key: "name",
		header: "Document",
		render: (document) => (
			<div className="min-w-0">
				<p className="truncate font-medium">{document.name}</p>
				<p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
					{document.source === "sales" ? "Sales stage document" : document.description || "Project file"}
				</p>
			</div>
		),
	},
	{
		key: "category",
		header: "Type",
		render: (document) => (
			<Badge
				variant="outline"
				className={`rounded-sm border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide ${getProjectFileCategoryClass(document.category)}`}
			>
				{document.category}
			</Badge>
		),
	},
	{
		key: "status",
		header: "Status",
		render: (document) => <span className="text-sm capitalize text-muted-foreground">{document.status?.replaceAll("_", " ") || "Uploaded"}</span>,
	},
	{
		key: "createdAt",
		header: "Uploaded",
		render: (document) => <span className="text-sm text-muted-foreground">{formatDateDisplay(document.createdAt)}</span>,
	},
];

interface ProjectCommercialDocumentsTabProps {
	projectId: number;
}

export function ProjectCommercialDocumentsTab({ projectId }: ProjectCommercialDocumentsTabProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);
	const filesQuery = useProjectFiles(projectId);
	const salesDocumentsQuery = useProjectSalesDocuments(projectId);
	const uploadFile = useUploadProjectFile();
	const deleteFile = useDeleteProjectFile();

	const form = useForm<ProjectFileUploadFormData>({
		resolver: zodResolver(projectFileUploadSchema),
		defaultValues: { ...projectFileUploadDefaults, category: "proposal" },
	});

	const documents = useMemo<CommercialDocumentRow[]>(() => {
		const projectFileDocuments = (filesQuery.data ?? [])
			.filter((file) => commercialDocumentCategories.includes(file.category as (typeof commercialDocumentCategories)[number]))
			.map((file) => ({
				documentId: `project_file:${file.fileId}`,
				projectFile: file,
				name: file.name,
				category: file.category as CommercialDocumentRow["category"],
				fileUrl: file.fileUrl,
				description: file.description,
				createdAt: file.createdAt,
				source: "project_file" as const,
			}));

		const salesDocuments = (salesDocumentsQuery.data ?? []).map((document) => ({
			documentId: document.documentId,
			name: document.name,
			category: document.category,
			status: document.status,
			fileUrl: document.fileUrl,
			createdAt: document.createdAt,
			source: "sales" as const,
		}));

		return [...salesDocuments, ...projectFileDocuments].sort((first, second) => second.createdAt.localeCompare(first.createdAt));
	}, [filesQuery.data, salesDocumentsQuery.data]);

	const summary = commercialDocumentCategories.map((category) => ({
		category,
		count: documents.filter((file) => file.category === category).length,
	}));

	function openUploadDialog(file: File) {
		setPendingFile(file);
		form.reset({ ...buildProjectFileUploadDefaults(file), category: "proposal" });
		setUploadDialogOpen(true);
	}

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;
		openUploadDialog(file);
		event.target.value = "";
	}

	const handleSubmit = form.handleSubmit(async (data) => {
		if (!pendingFile) return;

		try {
			await uploadFile.mutateAsync({
				projectId,
				formData: buildProjectFileUploadFormData(pendingFile, data),
			});
			toast.success(`"${data.name}" uploaded successfully.`);
			setUploadDialogOpen(false);
			setPendingFile(null);
			form.reset({ ...projectFileUploadDefaults, category: "proposal" });
		} catch {
			toast.error("Upload failed. Please try again.");
		}
	});

	async function handleConfirmDelete() {
		if (!fileToDelete) return;

		try {
			await deleteFile.mutateAsync({ projectId, fileId: fileToDelete.fileId });
			toast.success(`"${fileToDelete.name}" deleted.`);
			setFileToDelete(null);
		} catch {
			toast.error("Failed to delete document.");
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="grid gap-3 md:grid-cols-3">
				{summary.map((item) => {
					const Icon = item.category === "proposal" ? FileText : item.category === "quotation" ? ReceiptText : FileSignature;

					return (
						<div key={item.category} className="rounded-md border bg-background px-3 py-2.5">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Icon className="size-4" />
								<span className="capitalize">{item.category}</span>
							</div>
							<div className="mt-1 text-xl font-semibold tabular-nums">{item.count}</div>
						</div>
					);
				})}
			</div>

			<DataTable
				title="Proposal, Quotation & Contract Files"
				titleBadge={documents.length > 0 ? String(documents.length) : undefined}
				columns={documentColumns}
				data={documents}
				keyExtractor={(document) => document.documentId}
				isLoading={filesQuery.isLoading || salesDocumentsQuery.isLoading}
				error={filesQuery.error ?? salesDocumentsQuery.error}
				emptyState={{
					icon: FileSignature,
					title: "No commercial documents yet",
					description: "Upload proposals, quotations, and contracts here so every project has its sales paperwork in one place.",
				}}
				headerActions={
					<Can permission={["upload_project_files", "manage_project_files"]}>
						<Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadFile.isPending}>
							<Upload className="size-4" />
							Upload Document
						</Button>
					</Can>
				}
				rowActions={(document) => (
					<div className="flex items-center justify-end gap-1">
						{document.fileUrl && (
							<Button type="button" variant="ghost" size="sm" asChild>
								<a href={document.fileUrl} target="_blank" rel="noopener noreferrer" download>
									Open
								</a>
							</Button>
						)}
						{document.projectFile && (
							<Can permission={["delete_project_files", "manage_project_files"]}>
								<Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => setFileToDelete(document.projectFile ?? null)}>
									Delete
								</Button>
							</Can>
						)}
					</div>
				)}
			/>

			<input ref={fileInputRef} type="file" className="sr-only" aria-hidden="true" onChange={handleFileChange} />

			<ProjectFileUploadDialog
				open={uploadDialogOpen}
				pendingFile={pendingFile}
				form={form}
				isLoading={uploadFile.isPending}
				onOpenChange={(open) => {
					if (!open) setPendingFile(null);
					setUploadDialogOpen(open);
				}}
				onSubmit={handleSubmit}
			/>

			<ProjectFileDeleteDialog
				file={fileToDelete}
				isLoading={deleteFile.isPending}
				onOpenChange={(open) => {
					if (!open) setFileToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
}
