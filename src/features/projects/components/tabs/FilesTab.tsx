"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column, ConfirmDialog } from "@/components/shared";
import { ProjectDriveFile, ProjectFile } from "../../types/project";
import { FileFormDialog } from "./FileFormDialog";
import { Plus, FileText, Link2, Download, Trash2, MoreHorizontal, ExternalLink, FolderSync } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "../../hooks/useProjects";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useProjectDriveFiles } from "@/features/projects/hooks/useProjectDrive";
import { DriveFolderDialog } from "./DriveFolderDialog";

interface FilesTabProps {
	projectId: number;
	files: ProjectFile[];
	isLoading?: boolean;
	googleDriveFolderId?: string | null;
	googleDriveFolderName?: string | null;
}

type FileRow =
	| (ProjectFile & { source: "local"; rowId: string })
	| (ProjectDriveFile & { source: "drive"; rowId: string; type: "drive"; category: "Google Drive"; isClientVisible: false; createdAt?: string | null; fileUrl?: string | null });

export function FilesTab({ projectId, files, isLoading, googleDriveFolderId, googleDriveFolderName }: FilesTabProps) {
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showDriveDialog, setShowDriveDialog] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();
	const driveFiles = useProjectDriveFiles(projectId, !!googleDriveFolderId);

	// Permission checks
	const { canManageProjectFiles, canUploadProjectFiles, canDeleteProjectFiles } = usePermissions();

	const handleDelete = async () => {
		if (!fileToDelete) return;

		try {
			setIsDeleting(true);
			await api.delete(`/projects/${projectId}/files/${fileToDelete.fileId}`);
			toast.success("File deleted successfully");
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
			setFileToDelete(null);
		} catch {
			toast.error("Failed to delete file");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleDownload = (file: FileRow) => {
		if (file.type === "link" && file.fileUrl) {
			window.open(file.fileUrl, "_blank");
		} else if (file.fileUrl) {
			window.open(file.fileUrl, "_blank");
		}
	};

	const formatFileSize = (bytes?: number) => {
		if (!bytes) return "-";
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	const localRows: FileRow[] = (files || []).map((file) => ({
		...file,
		source: "local",
		rowId: `local-${file.fileId}`,
	}));

	const driveRows: FileRow[] = (driveFiles.data || []).map((file) => ({
		...file,
		source: "drive",
		rowId: `drive-${file.id}`,
		type: "drive",
		category: "Google Drive",
		isClientVisible: false,
		createdAt: file.createdTime,
		fileUrl: file.webContentLink || file.webViewLink,
	}));

	const rows = [...driveRows, ...localRows];

	const columns: Column<FileRow>[] = [
		{
			key: "name",
			header: "Name",
			render: (file) => (
				<div className="flex items-center gap-2">
					{file.type === "link" ? <Link2 className="h-4 w-4 text-muted-foreground" /> : file.source === "drive" ? <FolderSync className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
					<div>
						<p className="font-medium">{file.name}</p>
						{file.source === "local" && file.description && <p className="text-sm text-muted-foreground line-clamp-1">{file.description}</p>}
					</div>
				</div>
			),
		},
		{
			key: "category",
			header: "Category",
			render: (file) => <Badge variant="outline">{file.category}</Badge>,
		},
		{
			key: "size",
			header: "Size",
			render: (file) => (file.type === "link" ? "-" : formatFileSize(file.size ?? undefined)),
		},
		{
			key: "visibility",
			header: "Visibility",
			render: (file) => (file.source === "drive" ? <Badge variant="secondary">Drive</Badge> : <Badge variant={file.isClientVisible ? "default" : "secondary"}>{file.isClientVisible ? "Client Visible" : "Internal"}</Badge>),
		},
		{
			key: "createdAt",
			header: "Uploaded",
			render: (file) => (file.createdAt ? format(new Date(file.createdAt), "MMM d, yyyy") : "-"),
		},
		{
			key: "actions",
			header: "",
			render: (file) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => handleDownload(file)}>
							{file.type === "link" ? (
								<>
									<ExternalLink className="h-4 w-4 mr-2" />
									Open Link
								</>
							) : (
								<>
									<Download className="h-4 w-4 mr-2" />
									Download
								</>
							)}
						</DropdownMenuItem>
						{file.source === "local" && canDeleteProjectFiles && (
							<DropdownMenuItem
								onClick={() => setFileToDelete(file)}
								className="text-destructive"
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	return (
		<>
			<DataTable
				title="Files & Links"
				titleBadge={googleDriveFolderName ? `${rows.length} items • ${googleDriveFolderName}` : `${rows.length} items`}
				columns={columns}
				data={rows}
				keyExtractor={(file) => file.rowId}
				isLoading={isLoading || driveFiles.isLoading}
				emptyState={{
					icon: FileText,
					title: "No files yet",
					description: "Upload files or add links to share with your team.",
					action: canUploadProjectFiles ? { label: "Add File", onClick: () => setShowCreateDialog(true) } : undefined,
				}}
				headerActions={
					canManageProjectFiles || canUploadProjectFiles ? (
						<div className="flex gap-2">
							{canManageProjectFiles && (
								<Button
									variant="outline"
									onClick={() => setShowDriveDialog(true)}
								>
									<FolderSync className="h-4 w-4 mr-2" />
									{googleDriveFolderId ? "Change Drive Folder" : "Connect Drive Folder"}
								</Button>
							)}
							{canUploadProjectFiles && (
								<Button onClick={() => setShowCreateDialog(true)}>
									<Plus className="h-4 w-4 mr-2" />
									Add File
								</Button>
							)}
						</div>
					) : undefined
				}
			/>

			<FileFormDialog
				projectId={projectId}
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				driveFolderId={googleDriveFolderId}
			/>

			<DriveFolderDialog
				projectId={projectId}
				open={showDriveDialog}
				onOpenChange={setShowDriveDialog}
			/>

			<ConfirmDialog
				open={!!fileToDelete}
				onOpenChange={() => setFileToDelete(null)}
				title="Delete File"
				description={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
				variant="destructive"
				isLoading={isDeleting}
			/>
		</>
	);
}
