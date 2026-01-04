"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column, ConfirmDialog } from "@/components/shared";
import { ProjectFile } from "../../types/project";
import { FileFormDialog } from "./FileFormDialog";
import { Plus, FileText, Link2, Download, Trash2, MoreHorizontal, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "../../hooks/useProjects";

interface FilesTabProps {
	projectId: number;
	files: ProjectFile[];
	isLoading?: boolean;
}

export function FilesTab({ projectId, files, isLoading }: FilesTabProps) {
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();

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

	const handleDownload = (file: ProjectFile) => {
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

	const columns: Column<ProjectFile>[] = [
		{
			key: "name",
			header: "Name",
			render: (file) => (
				<div className="flex items-center gap-2">
					{file.type === "link" ? <Link2 className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
					<div>
						<p className="font-medium">{file.name}</p>
						{file.description && <p className="text-sm text-muted-foreground line-clamp-1">{file.description}</p>}
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
			render: (file) => (file.type === "link" ? "-" : formatFileSize(file.size)),
		},
		{
			key: "visibility",
			header: "Visibility",
			render: (file) => <Badge variant={file.isClientVisible ? "default" : "secondary"}>{file.isClientVisible ? "Client Visible" : "Internal"}</Badge>,
		},
		{
			key: "createdAt",
			header: "Uploaded",
			render: (file) => format(new Date(file.createdAt), "MMM d, yyyy"),
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
						<DropdownMenuItem
							onClick={() => setFileToDelete(file)}
							className="text-destructive"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	return (
		<>
			<DataTable
				title="Files & Links"
				titleBadge={files ? `${files.length} items` : undefined}
				columns={columns}
				data={files || []}
				keyExtractor={(file) => file.fileId}
				isLoading={isLoading}
				emptyState={{
					icon: FileText,
					title: "No files yet",
					description: "Upload files or add links to share with your team.",
					action: { label: "Add File", onClick: () => setShowCreateDialog(true) },
				}}
				headerActions={
					<Button onClick={() => setShowCreateDialog(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add File
					</Button>
				}
			/>

			<FileFormDialog
				projectId={projectId}
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
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
