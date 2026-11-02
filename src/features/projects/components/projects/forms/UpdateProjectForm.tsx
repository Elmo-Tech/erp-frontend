"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/components/shared";
import { useUpdateProject } from "../../../hooks/useProjects";
import { Project } from "../../../types/project";
import { ProjectFormFields } from "./ProjectFormFields";
import { notifyApiError } from "@/lib/errorHandling";
import { useLookupOptions } from "@/features/settings/hooks/useLookupOptions";

const projectSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	deadline: z.string().optional(),
	status: z.string().min(1, "Select a project status"),
	projectTypeId: z.number().int().positive().optional(),
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
	const { data: projectTypesResponse, isLoading: isProjectTypesLoading } = useLookupOptions("project_type");
	const { data: statusesResponse, isLoading: isStatusesLoading, isError: statusesError } = useLookupOptions("project_status");
	const statusOptions = useMemo(() => {
		const statuses = statusesResponse?.data ?? [];
		const options = statuses.filter((status) => status.is_active).map((status) => ({ value: status.value, label: status.label }));
		if (!options.some((status) => status.value === project.status)) {
			const current = statuses.find((status) => status.value === project.status);
			options.push({ value: project.status, label: `${current?.label ?? project.status} (Inactive)` });
		}
		return options;
	}, [project.status, statusesResponse?.data]);
	const projectTypeOptions = useMemo(() => {
		const projectTypes = projectTypesResponse?.data ?? [];
		const options = projectTypes
			.filter((projectType) => projectType.is_active)
			.map((projectType) => ({ value: String(projectType.id), label: projectType.label }));
		const currentProjectType = projectTypes.find((projectType) => projectType.id === project.projectTypeId);

		if (currentProjectType && !currentProjectType.is_active) {
			options.push({ value: String(currentProjectType.id), label: `${currentProjectType.label} (Inactive)` });
		}

		return options;
	}, [project.projectTypeId, projectTypesResponse?.data]);

	const form = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
		mode: "onChange",
		defaultValues: {
			title: project.title,
			description: project.description || "",
			deadline: project.deadline || "",
			status: project.status,
			projectTypeId: project.projectTypeId ?? undefined,
			reason: "",
		},
	});
	const watchedDeadline = useWatch({ control: form.control, name: "deadline" });
	const watchedReason = useWatch({ control: form.control, name: "reason" });

	const setFormData = (projectData: Project) => {
		form.reset({
			title: projectData.title,
			description: projectData.description || "",
			deadline: projectData.deadline || "",
			status: projectData.status,
			projectTypeId: projectData.projectTypeId ?? undefined,
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
		const isDeadlineChanged = data.deadline !== (project.deadline || "");
		if (isDeadlineChanged && !data.reason?.trim()) {
			form.setError("reason", { type: "manual", message: "Reason is required when changing deadline" });
			return;
		}

		try {
			await updateProject.mutateAsync({
				id: project.projectId,
				payload: {
					title: data.title,
					description: data.description,
					deadline: data.deadline || undefined,
					status: data.status,
					projectTypeId: data.projectTypeId,
					reason: data.reason || undefined,
				},
			});
			onOpenChange(false);
			onSuccess?.();
		} catch (error) {
			notifyApiError(error);
		}
	};

	const showReasonField = watchedDeadline !== (project.deadline || "");

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Edit Project"
			description="Update project details"
			submitLabel="Update Project"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={updateProject.isPending}
			isSubmitDisabled={!form.formState.isValid || isStatusesLoading || statusesError || (showReasonField && !watchedReason?.trim())}
		>
			{statusesError && <p role="alert" className="text-sm text-destructive">Unable to load project statuses. Please reopen the form or try again.</p>}
			<ProjectFormFields
				form={form}
				showReasonField={showReasonField}
				projectTypeOptions={projectTypeOptions}
				isProjectTypesLoading={isProjectTypesLoading}
				statusOptions={statusOptions}
				isStatusesLoading={isStatusesLoading}
			/>
		</FormDialog>
	);
}
