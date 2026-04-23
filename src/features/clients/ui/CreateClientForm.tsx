"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { ClientStatus } from "@/entities/client/model/types";
import { clientSchema, type ClientFormData, toCreateClientPayload } from "../model/client.schema";
import { useCreateClient } from "../model/use-client-actions";
import { ClientFormFields } from "./ClientFormFields";

interface CreateClientFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

const DEFAULT_VALUES: ClientFormData = {
	name: "",
	email: "",
	phone: "",
	company: "",
	position: "",
	address: "",
	city: "",
	country: "",
	website: "",
	notes: "",
	status: ClientStatus.ACTIVE,
};

export function CreateClientForm({ open, onOpenChange, onSuccess }: CreateClientFormProps) {
	const createClient = useCreateClient();
	const form = useForm<ClientFormData>({
		resolver: zodResolver(clientSchema),
		defaultValues: DEFAULT_VALUES,
	});

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(DEFAULT_VALUES);
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: ClientFormData) => {
		try {
			await createClient.mutateAsync(toCreateClientPayload(data));
			toast.success("Client created successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to create client");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="New client"
			description="Create a client profile for projects, invoices, and portal access."
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Create client"
			isLoading={createClient.isPending}
			size="xxl"
		>
			<ClientFormFields form={form} />
		</FormDialog>
	);
}
