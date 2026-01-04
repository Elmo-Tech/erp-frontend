/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormTextarea, FormSelect } from "@/components/shared";
import { useCreateDirectProject, useUpdateProject } from "../hooks/useProjects";
import { Project, ProjectStatus } from "../types/project";
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

interface ProjectFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	clientId?: number;
	project?: Project | null;
}

const statusOptions = [
	{ value: ProjectStatus.DRAFT, label: "Draft" },
	{ value: ProjectStatus.ACTIVE, label: "Active" },
	{ value: ProjectStatus.UI_UX, label: "UI/UX" },
	{ value: ProjectStatus.DEVELOPMENT, label: "Development" },
	{ value: ProjectStatus.TESTING, label: "Testing" },
	{ value: ProjectStatus.COMPLETED, label: "Completed" },
	{ value: ProjectStatus.ON_HOLD, label: "On Hold" },
	{ value: ProjectStatus.CANCELLED, label: "Cancelled" },
];

export function ProjectFormDialog({ open, onOpenChange, clientId, project }: ProjectFormDialogProps) {
	const isEditing = !!project;
	const createProject = useCreateDirectProject();
	const updateProject = useUpdateProject();

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

	useEffect(() => {
		if (open) {
			if (project) {
				form.reset({
					title: project.title,
					description: project.description || "",
					budget: project.budget,
					deadline: project.deadline || "",
					status: project.status,
					reason: "",
				});
			} else {
				form.reset({
					title: "",
					description: "",
					budget: 0,
					deadline: "",
					status: ProjectStatus.DRAFT,
					reason: "",
				});
			}
		}
	}, [open, project, form]);

	const onSubmit = async (data: ProjectFormData) => {
		try {
			if (isEditing && project) {
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
			} else if (clientId) {
				await createProject.mutateAsync({
					clientId,
					title: data.title,
					description: data.description,
					budget: data.budget,
					deadline: data.deadline || undefined,
					status: data.status,
				});
				toast.success("Project created successfully");
			}
			onOpenChange(false);
		} catch {
			toast.error(isEditing ? "Failed to update project" : "Failed to create project");
		}
	};

	const showReasonField = isEditing && project && (form.watch("budget") !== project.budget || form.watch("deadline") !== (project.deadline || ""));

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={isEditing ? "Edit Project" : "Create Project"}
			description={isEditing ? "Update project details" : "Create a new project"}
			submitLabel={isEditing ? "Update Project" : "Create Project"}
			onSubmit={form.handleSubmit(onSubmit)}
			isLoading={createProject.isPending || updateProject.isPending}
			isSubmitDisabled={!form.formState.isValid}
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormInput
						control={form.control}
						name="title"
						label="Project Title"
						placeholder="Enter project title"
					/>

					<FormTextarea
						control={form.control}
						name="description"
						label="Description"
						placeholder="Enter project description"
						rows={3}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="budget"
							label="Budget"
							type="number"
							placeholder="0.00"
							min={0}
						/>

						<FormInput
							control={form.control}
							name="deadline"
							label="Deadline"
							type="date"
						/>
					</div>

					<FormSelect
						control={form.control}
						name="status"
						label="Status"
						placeholder="Select status"
						options={statusOptions}
					/>

					{showReasonField && (
						<FormTextarea
							control={form.control}
							name="reason"
							label="Reason for Change"
							placeholder="Explain why budget or deadline is being changed..."
							rows={2}
						/>
					)}
				</div>
			</Form>
		</FormDialog>
	);
}
