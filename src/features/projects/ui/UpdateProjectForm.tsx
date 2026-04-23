"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ProjectStatus, type Project } from "@/entities/project/model/types";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { createDirectProjectSchema, toUpdateProjectPayload, type CreateDirectProjectFormData } from "../model/project.schema";
import { useUpdateProject } from "../model/use-project-actions";
import { ProjectFormFields } from "./ProjectFormFields";

interface UpdateProjectFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project: Project;
	onSuccess?: () => void;
}

function getDefaultValues(project: Project): CreateDirectProjectFormData {
	return {
		clientId: project.clientId,
		title: project.title,
		description: project.description || "",
		budget: Number(project.budget || 0),
		deadline: project.deadline || "",
		status: project.status || ProjectStatus.DRAFT,
	};
}

export function UpdateProjectForm({ open, onOpenChange, project, onSuccess }: UpdateProjectFormProps) {
	const updateProject = useUpdateProject();
	const form = useForm<CreateDirectProjectFormData>({
		resolver: zodResolver(createDirectProjectSchema),
		defaultValues: getDefaultValues(project),
	});
	const clientOptions = [
		{
			value: String(project.clientId),
			label: project.client?.name || `Client #${project.clientId}`,
		},
	];

	useEffect(() => {
		if (open) {
			form.reset(getDefaultValues(project));
		}
	}, [form, open, project]);

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(getDefaultValues(project));
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateDirectProjectFormData) => {
		try {
			await updateProject.mutateAsync({
				id: project.projectId,
				payload: toUpdateProjectPayload(data),
			});
			toast.success("Project updated");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to update project");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Edit project"
			description="Update project scope, budget, deadline, and status."
			submitLabel="Update project"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={updateProject.isPending}
			size="xxl"
		>
			<ProjectFormFields
				form={form}
				clientOptions={clientOptions}
				lockClient
			/>
		</FormDialog>
	);
}
