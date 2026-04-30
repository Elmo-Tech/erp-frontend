"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { clientApi } from "@/entities/client/api/client.api";
import { clientKeys } from "@/entities/client/model/query-keys";
import { ProjectStatus } from "@/entities/project/model/types";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { createDirectProjectSchema, type CreateDirectProjectFormData, toCreateDirectProjectPayload } from "../model/project.schema";
import { useCreateDirectProject } from "../model/use-project-actions";
import { ProjectFormFields } from "./ProjectFormFields";

interface CreateProjectFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	clientId?: number;
	clientName?: string;
	onSuccess?: () => void;
}

function defaultValues(clientId?: number): CreateDirectProjectFormData {
	return {
		clientId: clientId ?? 0,
		title: "",
		description: "",
		budget: 0,
		deadline: "",
		status: ProjectStatus.DRAFT,
	};
}

export function CreateProjectForm({ open, onOpenChange, clientId, clientName, onSuccess }: CreateProjectFormProps) {
	const createProject = useCreateDirectProject();
	const clientsQuery = useQuery({
		queryKey: clientKeys.list({ perPage: 100 }),
		queryFn: () => clientApi.getClients({ perPage: 100 }),
		enabled: open && !clientId,
		staleTime: 5 * 60 * 1000,
	});

	const clientOptions = useMemo(() => {
		if (clientId) {
			return [
				{
					value: String(clientId),
					label: clientName || `Client #${clientId}`,
				},
			];
		}

		return (clientsQuery.data?.clients ?? []).map((client) => ({
			value: String(client.id),
			label: client.company_name ? `${client.display_name} / ${client.company_name}` : client.display_name,
		}));
	}, [clientId, clientName, clientsQuery.data?.clients]);

	const form = useForm<CreateDirectProjectFormData>({
		resolver: zodResolver(createDirectProjectSchema),
		defaultValues: defaultValues(clientId),
	});

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(defaultValues(clientId));
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateDirectProjectFormData) => {
		try {
			await createProject.mutateAsync(toCreateDirectProjectPayload(data));
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
			title="New project"
			description="Create a direct project for a client."
			submitLabel="Create project"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={createProject.isPending}
			isSubmitDisabled={!clientId && clientsQuery.isLoading}
			size="xxl"
		>
			<ProjectFormFields
				form={form}
				clientOptions={clientOptions}
				lockClient={Boolean(clientId)}
			/>
		</FormDialog>
	);
}
