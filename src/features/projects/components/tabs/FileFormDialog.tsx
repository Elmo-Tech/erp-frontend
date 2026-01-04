"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormSelect, FormTextarea, FormSwitch } from "@/components/shared";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "../../hooks/useProjects";
import api from "@/lib/axios";
import { toast } from "sonner";

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
}

export function FileFormDialog({ projectId, open, onOpenChange }: FileFormDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const queryClient = useQueryClient();

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

	const handleSubmit = async (data: FileFormData) => {
		try {
			setIsSubmitting(true);
			await api.post(`/projects/${projectId}/files`, data);
			toast.success("File added successfully");
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
			form.reset();
			onOpenChange(false);
		} catch {
			toast.error("Failed to add file");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Add File or Link"
			description="Add a file or external link to this project"
			submitLabel="Add"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={isSubmitting}
			isSubmitDisabled={!form.formState.isValid}
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
