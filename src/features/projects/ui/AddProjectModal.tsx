"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import { ProjectStatus } from "@/entities/project/model/types";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import type { SelectOption } from "@/shared/ui/forms";
import { addProjectSchema, PaymentStatus, type AddProjectFormData, toAddProjectPayload } from "../model/add-project.schema";
import { useCreateDirectProject } from "../model/use-project-actions";
import { AddProjectForm } from "./AddProjectForm";

interface AddProjectModalProps {
	clientId: number;
	clientName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

function today() {
	return new Date().toISOString().slice(0, 10);
}

function defaultValues(clientId: number, clientName: string): AddProjectFormData {
	return {
		clientId,
		clientName,
		projectName: "",
		projectType: "",
		assignedSalesRepId: "",
		status: ProjectStatus.DRAFT,
		paymentStatus: PaymentStatus.UNPAID,
		startDate: today(),
		deliveryDate: "",
		details: "",
	};
}

export function AddProjectModal({ clientId, clientName, open, onOpenChange, onSuccess }: AddProjectModalProps) {
	const createProject = useCreateDirectProject();
	const form = useForm<AddProjectFormData>({
		resolver: zodResolver(addProjectSchema),
		defaultValues: defaultValues(clientId, clientName),
	});

	const usersQuery = useGetInternalUsers(open);

	const salesRepOptions = useMemo<SelectOption[]>(() => {
		return (usersQuery.data?.users ?? []).map((user) => ({
			value: String(user.id),
			label: user.name,
		}));
	}, [usersQuery.data?.users]);

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(defaultValues(clientId, clientName));
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: AddProjectFormData) => {
		try {
			await createProject.mutateAsync(toAddProjectPayload(data));
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
			title="New Project"
			description="Create a delivery workspace linked to this client."
			submitLabel="Create Project"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={createProject.isPending}
			size="4xl"
		>
			<AddProjectForm
				form={form}
				salesRepOptions={salesRepOptions}
				isLoadingSalesReps={usersQuery.isLoading}
				disabled={createProject.isPending}
			/>
		</FormDialog>
	);
}
