"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/shared/ui";
import { useUpdateProject } from "../../../hooks/useProjects";
import { Project, ProjectStatus } from "../../../types/project";
import { ProjectFormFields } from "./ProjectFormFields";
import { toast } from "sonner";

const projectSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	budget: z.number().min(0, "Budget must be positive"),
	deadline: z.string().optional(),
	status: z.nativeEnum(ProjectStatus),
	reason: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface UpdateProjectFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project: Project;
	onSuccess?: () => void;
}

export function UpdateProjectForm({ open, onOpenChange, project, onSuccess }: UpdateProjectFormProps) {
	const updateProject = useUpdateProject();

	const form = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			title: project.title,
			description: project.description || "",
			budget: project.budget,
			deadline: project.deadline || "",
			status: project.status,
			reason: "",
		},
	});

	const setFormData = (projectData: Project) => {
		form.reset({
			title: projectData.title,
			description: projectData.description || "",
			budget: projectData.budget,
			deadline: projectData.deadline || "",
			status: projectData.status,
			reason: "",
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			setFormData(project);
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: ProjectFormData) => {
		try {
			await updateProject.mutateAsync({
				id: project.projectId,
				payload: {
					title: data.title,
					description: data.description,
					budget: data.budget,
					deadline: data.deadline || undefined,
					status: data.status,
					reason: data.reason || undefined,
				},
			});
			toast.success("Project updated successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to update project");
		}
	};

	const showReasonField = form.watch("budget") !== project.budget || form.watch("deadline") !== (project.deadline || "");

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Edit Project"
			description="Update project details"
			submitLabel="Update Project"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={updateProject.isPending}
			isSubmitDisabled={!form.formState.isValid}
		>
			<ProjectFormFields
				form={form}
				showReasonField={showReasonField}
			/>
		</FormDialog>
	);
}
