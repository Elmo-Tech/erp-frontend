"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormSelect, FormTextarea, FormSwitch } from "@/components/shared";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "../../hooks/useProjects";
import api from "@/lib/axios";
import { toast } from "sonner";
import { notifyApiError } from "@/lib/errorHandling";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, FileIcon } from "lucide-react";
import { useUploadProjectDriveFile } from "../../hooks/useProjectDrive";

const fileSchema = z.object({
	name: z.string().min(1, "Name is required"),
	type: z.enum(["file", "link"]),
	fileUrl: z.string().optional(),
	description: z.string().optional(),
	category: z.string().min(1, "Category is required"),
	isClientVisible: z.boolean(),
	isDownloadable: z.boolean(),
});

type FileFormData = z.infer<typeof fileSchema>;

const CATEGORY_OPTIONS = [
	{ value: "design", label: "Design" },
	{ value: "document", label: "Document" },
	{ value: "contract", label: "Contract" },
	{ value: "deliverable", label: "Deliverable" },
	{ value: "reference", label: "Reference" },
	{ value: "other", label: "Other" },
];

const TYPE_OPTIONS = [
	{ value: "link", label: "External Link" },
	{ value: "file", label: "Upload File" },
];

interface FileFormDialogProps {
	projectId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	driveFolderId?: string | null;
}

export function FileFormDialog({ projectId, open, onOpenChange, driveFolderId }: FileFormDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();
	const uploadDriveFile = useUploadProjectDriveFile(projectId);

	const form = useForm<FileFormData>({
		resolver: zodResolver(fileSchema),
		defaultValues: {
			name: "",
			type: "link",
			fileUrl: "",
			description: "",
			category: "document",
			isClientVisible: false,
			isDownloadable: true,
		},
	});

	const fileType = form.watch("type");

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			// Auto-fill name if empty
			if (!form.getValues("name")) {
				form.setValue("name", file.name.replace(/\.[^/.]+$/, ""));
			}
		}
	};

	const handleRemoveFile = () => {
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (data: FileFormData) => {
		try {
			setIsSubmitting(true);

			let driveFileUrl: string | null = null;

			if (data.type === "file" && selectedFile && driveFolderId) {
				const driveFile = await uploadDriveFile.mutateAsync(selectedFile);
				driveFileUrl = driveFile.webViewLink || driveFile.webContentLink || null;
			} else if (data.type === "file" && selectedFile) {
				// Upload file using FormData
				const formData = new FormData();
				formData.append("file", selectedFile);
				formData.append("name", data.name);
				formData.append("type", data.type);
				formData.append("description", data.description || "");
				formData.append("category", data.category);
				formData.append("isClientVisible", data.isClientVisible ? "1" : "0");
				formData.append("isDownloadable", data.isDownloadable ? "1" : "0");

				await api.post(`/projects/${projectId}/files`, formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});
			} else {
				// Send link data as JSON - Backend expects 'url' not 'fileUrl'
				await api.post(`/projects/${projectId}/files`, {
					name: data.name,
					type: data.type,
					url: data.fileUrl,
					description: data.description,
					category: data.category,
					isClientVisible: data.isClientVisible,
					isDownloadable: data.isDownloadable,
				});
			}

			if (driveFolderId && data.type === "file") toast.success("File uploaded to Google Drive", driveFileUrl ? { action: { label: "Open", onClick: () => window.open(driveFileUrl, "_blank") } } : undefined);
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
			form.reset();
			setSelectedFile(null);
			onOpenChange(false);
		} catch (error) {
			notifyApiError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			form.reset();
			setSelectedFile(null);
		}
		onOpenChange(newOpen);
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Add File or Link"
			description={driveFolderId ? "Files upload to the connected Google Drive folder. Links stay in ERP." : "Add a file or external link to this project"}
			submitLabel="Add"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={isSubmitting}
			isSubmitDisabled={!form.formState.isValid || (fileType === "file" && !selectedFile)}
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormSelect
						control={form.control}
						name="type"
						label="Type"
						options={TYPE_OPTIONS}
					/>
					<FormInput
						control={form.control}
						name="name"
						label="Name"
						placeholder="e.g., Design Mockups, API Documentation..."
					/>
					{fileType === "link" && (
						<FormInput
							control={form.control}
							name="fileUrl"
							label="URL"
							placeholder="https://..."
						/>
					)}
					{fileType === "file" && (
						<div className="space-y-2">
							<Label>File</Label>
							<input
								ref={fileInputRef}
								type="file"
								onChange={handleFileSelect}
								className="hidden"
								accept="*/*"
							/>
							{selectedFile ? (
								<div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
									<FileIcon className="h-8 w-8 text-muted-foreground" />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">{selectedFile.name}</p>
										<p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={handleRemoveFile}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<Button
									type="button"
									variant="outline"
									className="w-full h-24 border-dashed"
									onClick={() => fileInputRef.current?.click()}
								>
									<div className="flex flex-col items-center gap-2">
										<Upload className="h-6 w-6 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">Click to select a file</span>
									</div>
								</Button>
							)}
						</div>
					)}
					<FormTextarea
						control={form.control}
						name="description"
						label="Description"
						placeholder="Optional description..."
						rows={2}
					/>
					<FormSelect
						control={form.control}
						name="category"
						label="Category"
						options={CATEGORY_OPTIONS}
					/>
					<div className="space-y-3">
						<FormSwitch
							control={form.control}
							name="isClientVisible"
							label="Client Visible"
							description="Allow clients to see this file"
						/>
						<FormSwitch
							control={form.control}
							name="isDownloadable"
							label="Downloadable"
							description="Allow downloading this file"
						/>
					</div>
				</div>
			</Form>
		</FormDialog>
	);
}
