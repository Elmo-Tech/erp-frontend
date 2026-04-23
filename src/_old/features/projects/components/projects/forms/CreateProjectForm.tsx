"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/shared/ui";
import { useCreateDirectProject } from "../../../hooks/useProjects";
import { ProjectStatus } from "../../../types/project";
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

interface CreateProjectFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	clientId: number;
	onSuccess?: () => void;
}

export function CreateProjectForm({ open, onOpenChange, clientId, onSuccess }: CreateProjectFormProps) {
	const createProject = useCreateDirectProject();

	const form = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			title: "",
			description: "",
			budget: 0,
			deadline: "",
			status: ProjectStatus.DRAFT,
			reason: "",
		},
	});

	const resetForm = () => {
		form.reset({
			title: "",
			description: "",
			budget: 0,
			deadline: "",
			status: ProjectStatus.DRAFT,
			reason: "",
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			resetForm();
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: ProjectFormData) => {
		try {
			await createProject.mutateAsync({
				clientId,
				title: data.title,
				description: data.description,
				budget: data.budget,
				deadline: data.deadline || undefined,
				status: data.status,
			});
			toast.success("Project created successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to create project");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Create Project"
			description="Create a new project"
			submitLabel="Create Project"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={createProject.isPending}
			isSubmitDisabled={!form.formState.isValid}
		>
			<ProjectFormFields form={form} />
		</FormDialog>
	);
}
