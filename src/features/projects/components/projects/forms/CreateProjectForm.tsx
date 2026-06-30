"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/components/shared";
import { useCreateDirectProject } from "../../../hooks/useProjects";
import { useClients } from "@/features/clients/hooks/useClients";
import { ProjectStatus } from "../../../types/project";
import { ProjectFormFields } from "./ProjectFormFields";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Client } from "@/features/clients/types";

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
	const { data, isLoading } = useClients({ search: search || undefined, perPage: 10 });
	const clients = data?.clients ?? [];

	return (
		<div className="space-y-2">
			<Label htmlFor="project-client-search">Client</Label>
			<Input
				id="project-client-search"
				value={search}
				onChange={(event) => setSearch(event.target.value)}
				placeholder="Search clients..."
			/>
			<div className="max-h-36 space-y-1 overflow-y-auto rounded-md border p-1">
				{isLoading && <p className="px-2 py-1 text-sm text-muted-foreground">Loading clients...</p>}
				{!isLoading && clients.length === 0 && <p className="px-2 py-1 text-sm text-muted-foreground">No clients found</p>}
				{clients.map((client: Client) => (
					<Button
						key={client.clientId}
						type="button"
						variant={selectedClientId === client.clientId ? "default" : "ghost"}
						className="w-full justify-start"
						onClick={() => onSelect(client.clientId)}
					>
						<span className="truncate">{client.name}</span>
					</Button>
				))}
			</div>
		</div>
	);
}
