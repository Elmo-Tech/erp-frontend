"use client";

/**
 * ProjectFilesTab
 *
 * Full file management UI for a project:
 *  - Lists all uploaded files with name, category, size, and download link.
 *  - "Upload File" button opens a dialog to pick a file, set a name,
 *    category, and optional description — then POSTs multipart/form-data
 *    to POST /projects/{id}/files.
 *  - Each file row has a Download link and a Delete action.
 */

import { useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen, Upload, Download, Trash2, FileText, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { Badge } from "@/shared/ui/badge";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { useProjectFiles, useUploadProjectFile, useDeleteProjectFile } from "@/features/projects/api/execution.api";
import type { ProjectFile } from "@/entities/project/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
	{ value: "general", label: "General" },
	{ value: "design", label: "Design" },
	{ value: "document", label: "Document" },
	{ value: "deliverable", label: "Deliverable" },
];

const CATEGORY_COLORS: Record<string, string> = {
	general: "bg-gray-100 text-gray-700 border-gray-200",
	design: "bg-pink-50 text-pink-700 border-pink-200",
	document: "bg-blue-50 text-blue-700 border-blue-200",
	deliverable: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ─────────────────────────────────────────────────────────────────────────────
// Upload form schema
// ─────────────────────────────────────────────────────────────────────────────

const uploadSchema = z.object({
	name: z.string().trim().min(1, "File name is required").max(255),
	category: z.string().min(1, "Category is required"),
	description: z.string().optional(),
});
type UploadFormData = z.infer<typeof uploadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number | null | undefined): string {
	if (!bytes) return "—";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Table columns
// ─────────────────────────────────────────────────────────────────────────────

const projectFileColumns: Column<ProjectFile>[] = [
	{
		key: "name",
		header: "Name",
		render: (file) => (
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/50">
					{file.type === "link" ? <Link2 className="size-4 text-muted-foreground" /> : <FileText className="size-4 text-muted-foreground" />}
				</div>
				<div className="min-w-0">
					<p className="truncate font-medium">{file.name}</p>
					{file.description && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{file.description}</p>}
				</div>
			</div>
		),
	},
	{
		key: "category",
		header: "Category",
		render: (file) => {
			const categoryColor = CATEGORY_COLORS[file.category] ?? CATEGORY_COLORS.general;

			return (
				<Badge
					variant="outline"
					className={`rounded-sm border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide ${categoryColor}`}
				>
					{file.category}
				</Badge>
			);
		},
	},
	{
		key: "size",
		header: "Size",
		render: (file) => <span className="text-sm tabular-nums text-muted-foreground">{formatBytes(file.size)}</span>,
	},
	{
		key: "createdAt",
		header: "Created",
		render: (file) => <span className="text-sm text-muted-foreground">{formatDateDisplay(file.createdAt)}</span>,
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectFilesTabProps {
	projectId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectFilesTab({ projectId }: ProjectFilesTabProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);

	const filesQuery = useProjectFiles(projectId);
	const uploadFile = useUploadProjectFile();
	const deleteFile = useDeleteProjectFile();

	const form = useForm<UploadFormData>({
		resolver: zodResolver(uploadSchema),
		defaultValues: { name: "", category: "general", description: "" },
	});

	// ── Trigger native file picker ───────────────────────────────────────────
	const handleUploadClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	// ── File selected from picker → open dialog pre-filled with filename ─────
	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			setPendingFile(file);
			form.reset({
				name: file.name.replace(/\.[^/.]+$/, ""), // strip extension for display name
				category: "general",
				description: "",
			});
			setUploadDialogOpen(true);

			// Reset input so the same file can be re-selected later
			e.target.value = "";
		},
		[form],
	);

	// ── Dialog cancel ────────────────────────────────────────────────────────
	const handleDialogOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				setPendingFile(null);
				form.reset();
			}
			setUploadDialogOpen(open);
		},
		[form],
	);

	// ── Submit upload ────────────────────────────────────────────────────────
	const handleSubmit = form.handleSubmit(async (data) => {
		if (!pendingFile) return;

		const formData = new FormData();
		formData.append("file", pendingFile);
		formData.append("name", data.name);
		formData.append("type", "file");
		formData.append("category", data.category);
		if (data.description?.trim()) {
			formData.append("description", data.description.trim());
		}

		try {
			await uploadFile.mutateAsync({ projectId, formData });
			toast.success(`"${data.name}" uploaded successfully.`);
			setUploadDialogOpen(false);
			setPendingFile(null);
			form.reset();
		} catch {
			toast.error("Upload failed. Please try again.");
		}
	});

	// ── Confirm delete ───────────────────────────────────────────────────────
	const handleConfirmDelete = useCallback(async () => {
		if (!fileToDelete) return;
		try {
			await deleteFile.mutateAsync({ projectId, fileId: fileToDelete.fileId });
			toast.success(`"${fileToDelete.name}" deleted.`);
			setFileToDelete(null);
		} catch {
			toast.error("Failed to delete file.");
		}
	}, [deleteFile, fileToDelete, projectId]);

	// ── Render ───────────────────────────────────────────────────────────────
	const files = filesQuery.data ?? [];

	return (
		<>
			<DataTable
				title="Project Files"
				titleBadge={filesQuery.data ? String(files.length) : undefined}
				columns={projectFileColumns}
				data={files}
				keyExtractor={(file) => file.fileId}
				isLoading={filesQuery.isLoading}
				error={filesQuery.error}
				emptyState={{
					icon: FolderOpen,
					title: "No files yet",
					description: "Upload project files, deliverables, and design assets to keep everything in one place.",
					action: { label: "Upload File", onClick: handleUploadClick },
				}}
				headerActions={
					<Button
						size="sm"
						onClick={handleUploadClick}
						disabled={uploadFile.isPending}
					>
						<Upload className="size-4" />
						Upload File
					</Button>
				}
				rowActions={(file) => (
					<div className="flex items-center justify-end gap-1">
						{file.fileUrl && (
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								asChild
							>
								<a
									href={file.fileUrl}
									target="_blank"
									rel="noopener noreferrer"
									download
									aria-label={`Download ${file.name}`}
								>
									<Download className="size-4" />
								</a>
							</Button>
						)}
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							className="text-muted-foreground hover:text-destructive"
							aria-label={`Delete ${file.name}`}
							onClick={() => setFileToDelete(file)}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				)}
			/>

			{/* ── Hidden native file input ───────────────────────────────────── */}
			<input
				ref={fileInputRef}
				type="file"
				className="sr-only"
				aria-hidden="true"
				onChange={handleFileChange}
			/>

			{/* ── Upload dialog ──────────────────────────────────────────────── */}
			<FormDialog
				open={uploadDialogOpen}
				onOpenChange={handleDialogOpenChange}
				title="Upload File"
				description={pendingFile ? `${pendingFile.name} · ${formatBytes(pendingFile.size)}` : "Configure file details before uploading."}
				submitLabel="Upload"
				isLoading={uploadFile.isPending}
				onSubmit={handleSubmit}
				size="md"
			>
				<Form {...form}>
					<div className="flex flex-col gap-4">
						<FormInput
							control={form.control}
							name="name"
							label="Display name"
							placeholder="e.g. Final Wireframes"
						/>
						<FormSelect
							control={form.control}
							name="category"
							label="Category"
							options={CATEGORY_OPTIONS}
						/>
						<FormTextarea
							control={form.control}
							name="description"
							label="Description (optional)"
							placeholder="Brief note about this file…"
							rows={2}
						/>
					</div>
				</Form>
			</FormDialog>

			{/* ── Delete confirm dialog ──────────────────────────────────────── */}
			<ConfirmDialog
				open={Boolean(fileToDelete)}
				onOpenChange={(open) => {
					if (!open) setFileToDelete(null);
				}}
				title="Delete file"
				description={
					<span>
						Delete <span className="font-medium text-foreground">{fileToDelete?.name}</span>? This cannot be undone.
					</span>
				}
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={handleConfirmDelete}
				isLoading={deleteFile.isPending}
			/>
		</>
	);
}
