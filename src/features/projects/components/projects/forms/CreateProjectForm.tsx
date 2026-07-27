"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/components/shared";
import { useCreateDirectProject } from "../../../hooks/useProjects";
import { useClients } from "@/features/clients/hooks/useClients";
import { ProjectStatus } from "../../../types/project";
import { ProjectFormFields } from "./ProjectFormFields";
import { toast } from "sonner";
import { FormCombobox } from "@/components/shared/forms";
import { useClient } from "@/features/clients/hooks/useClients";

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
	clientId?: number;
	onSuccess?: () => void;
}

export function CreateProjectForm({ open, onOpenChange, clientId, onSuccess }: CreateProjectFormProps) {
	const createProject = useCreateDirectProject();
	const [selectedClientId, setSelectedClientId] = useState<number | undefined>(clientId && clientId > 0 ? clientId : undefined);

	const form = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
		mode: "onChange",
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
		setSelectedClientId(clientId && clientId > 0 ? clientId : undefined);
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
		const projectClientId = clientId && clientId > 0 ? clientId : selectedClientId;
		if (!projectClientId) {
			toast.error("Select a client first");
			return;
		}

		try {
			await createProject.mutateAsync({
				clientId: projectClientId,
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
			isSubmitDisabled={!form.formState.isValid || !(clientId && clientId > 0 ? clientId : selectedClientId)}
		>
			{!(clientId && clientId > 0) && (
				<ClientPicker
					selectedClientId={selectedClientId}
					onSelect={setSelectedClientId}
				/>
			)}
			<ProjectFormFields form={form} />
		</FormDialog>
	);
}

function ClientPicker({ selectedClientId, onSelect }: { selectedClientId?: number; onSelect: (clientId: number) => void }) {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const { data, isLoading } = useClients({ search: debouncedSearch || undefined, perPage: 25 });
	const { data: selectedClient } = useClient(selectedClientId ?? 0, Boolean(selectedClientId));

	useEffect(() => {
		const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
		return () => window.clearTimeout(timeout);
	}, [search]);

	const options = useMemo(() => {
		const clients = data?.clients ?? [];
		const uniqueClients = selectedClient
			? [selectedClient, ...clients.filter((client) => client.clientId !== selectedClient.clientId)]
			: clients;

		return uniqueClients.map((client) => ({
			value: String(client.clientId),
			label: client.name,
		}));
	}, [data?.clients, selectedClient]);

	return (
		<FormCombobox
			id="project-client"
			label="Client"
			value={selectedClientId ? String(selectedClientId) : undefined}
			options={options}
			onValueChange={(value) => onSelect(Number(value))}
			searchValue={search}
			onSearchChange={setSearch}
			placeholder="Select a client"
			searchPlaceholder="Search clients..."
			emptyMessage="No clients found"
			isLoading={isLoading}
		/>
	);
}
