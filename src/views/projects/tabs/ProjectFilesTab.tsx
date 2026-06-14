"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDeleteProjectFile, useProjectFiles, useUploadProjectFile } from "@/features/projects/api/execution.api";
import type { ProjectFile } from "@/entities/project/model/types";
import {
	buildProjectFileUploadDefaults,
	buildProjectFileUploadFormData,
	projectFileUploadDefaults,
	projectFileUploadSchema,
	type ProjectFileUploadFormData,
} from "./model/project-files";
import { ProjectFileDeleteDialog } from "./ui/ProjectFileDeleteDialog";
import { ProjectFilesTable } from "./ui/ProjectFilesTable";
import { ProjectFileUploadDialog } from "./ui/ProjectFileUploadDialog";

interface ProjectFilesTabProps {
	projectId: number;
}

export function ProjectFilesTab({ projectId }: ProjectFilesTabProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);

	const filesQuery = useProjectFiles(projectId);
	const uploadFile = useUploadProjectFile();
	const deleteFile = useDeleteProjectFile();

	const form = useForm<ProjectFileUploadFormData>({
		resolver: zodResolver(projectFileUploadSchema),
		defaultValues: projectFileUploadDefaults,
	});

	const handleUploadClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			setPendingFile(file);
			form.reset(buildProjectFileUploadDefaults(file));
			setUploadDialogOpen(true);
			event.target.value = "";
		},
		[form],
	);

	const handleUploadDialogOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				setPendingFile(null);
				form.reset(projectFileUploadDefaults);
			}

			setUploadDialogOpen(open);
		},
		[form],
	);

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
			form.reset(projectFileUploadDefaults);
		} catch {
			toast.error("Upload failed. Please try again.");
		}
	});

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

	return (
		<>
			<ProjectFilesTable
				files={filesQuery.data ?? []}
				isLoading={filesQuery.isLoading}
				error={filesQuery.error}
				isUploadPending={uploadFile.isPending}
				onUploadClick={handleUploadClick}
				onDeleteClick={setFileToDelete}
			/>

			<input
				ref={fileInputRef}
				type="file"
				className="sr-only"
				aria-hidden="true"
				onChange={handleFileChange}
			/>

			<ProjectFileUploadDialog
				open={uploadDialogOpen}
				pendingFile={pendingFile}
				form={form}
				isLoading={uploadFile.isPending}
				onOpenChange={handleUploadDialogOpenChange}
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
		</>
	);
}
