"use client";

import { Download, FileText, FolderOpen, Link2, Trash2, Upload } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import type { ProjectFile } from "@/entities/project/model/types";
import { formatProjectFileSize, getProjectFileCategoryClass } from "../model/project-files";

interface ProjectFilesTableProps {
	files: ProjectFile[];
	isLoading: boolean;
	error: Error | null;
	isUploadPending: boolean;
	onUploadClick: () => void;
	onDeleteClick: (file: ProjectFile) => void;
}

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
		render: (file) => (
			<Badge
				variant="outline"
				className={`rounded-sm border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide ${getProjectFileCategoryClass(file.category)}`}
			>
				{file.category}
			</Badge>
		),
	},
	{
		key: "size",
		header: "Size",
		render: (file) => <span className="text-sm tabular-nums text-muted-foreground">{formatProjectFileSize(file.size)}</span>,
	},
	{
		key: "createdAt",
		header: "Created",
		render: (file) => <span className="text-sm text-muted-foreground">{formatDateDisplay(file.createdAt)}</span>,
	},
];

export function ProjectFilesTable({ files, isLoading, error, isUploadPending, onUploadClick, onDeleteClick }: ProjectFilesTableProps) {
	return (
		<DataTable
			title="Project Files"
			titleBadge={files.length > 0 ? String(files.length) : undefined}
			columns={projectFileColumns}
			data={files}
			keyExtractor={(file) => file.fileId}
			isLoading={isLoading}
			error={error}
			emptyState={{
				icon: FolderOpen,
				title: "No files yet",
				description: "Upload project files, deliverables, and design assets to keep everything in one place.",
				action: { label: "Upload File", onClick: onUploadClick },
			}}
			headerActions={
				<Button
					size="sm"
					onClick={onUploadClick}
					disabled={isUploadPending}
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
						onClick={() => onDeleteClick(file)}
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			)}
		/>
	);
}
