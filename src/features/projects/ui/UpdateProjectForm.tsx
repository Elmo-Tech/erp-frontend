"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ProjectStatus, type Project } from "@/entities/project/model/types";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { Form } from "@/shared/ui/form";
import { createDirectProjectSchema, toChangedUpdateProjectPayload, type CreateDirectProjectFormData } from "../model/project.schema";
import { useUpdateProject } from "../model/use-project-actions";
import { ProjectFormFields } from "./ProjectFormFields";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle } from "lucide-react";

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
		reason: "",
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

	const watchedBudget = useWatch({ control: form.control, name: "budget" });
	const watchedDeadline = useWatch({ control: form.control, name: "deadline" });

	const requiresReason = useMemo(() => {
		const budgetChanged = watchedBudget !== Number(project.budget || 0);
		const deadlineChanged = watchedDeadline !== (project.deadline || "");
		return budgetChanged || deadlineChanged;
	}, [watchedBudget, watchedDeadline, project.budget, project.deadline]);

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
		// Validate reason is provided if budget or deadline changed
		if (requiresReason && !data.reason?.trim()) {
			form.setError("reason", {
				type: "manual",
				message: "A reason is required when changing the budget or deadline.",
			});
			return;
		}

		try {
			await updateProject.mutateAsync({
				id: project.projectId,
				payload: toChangedUpdateProjectPayload(data, project),
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
			<Form {...form}>
				<ProjectFormFields
					form={form}
					clientOptions={clientOptions}
					lockClient
				/>

				{requiresReason && (
					<div className="space-y-3">
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>You are changing the budget or deadline. Please provide a reason for this change.</AlertDescription>
						</Alert>
						<FormTextarea
							control={form.control}
							name="reason"
							label="Reason for change"
							placeholder="Explain why the budget or deadline is being changed..."
							rows={3}
						/>
					</div>
				)}
			</Form>
		</FormDialog>
	);
}
