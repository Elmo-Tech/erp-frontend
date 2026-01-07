"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { useUpdateClient } from "../../../hooks/useClients";
import { Client, ClientStatus } from "../../../types";
import { clientSchema, ClientFormData } from "../../../schemas/clientSchema";
import { ClientFormFields } from "./ClientFormFields";
import { toast } from "sonner";

interface UpdateClientFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	client: Client;
	onSuccess?: () => void;
}

export function UpdateClientForm({ open, onOpenChange, client, onSuccess }: UpdateClientFormProps) {
	const updateClient = useUpdateClient();

	const form = useForm<ClientFormData>({
		resolver: zodResolver(clientSchema),
		defaultValues: {
			name: client.name,
			email: client.email,
			phone: client.phone || "",
			company: client.company || "",
			position: client.position || "",
			address: client.address || "",
			city: client.city || "",
			country: client.country || "",
			website: client.website || "",
			notes: client.notes || "",
			status: client.status || ClientStatus.ACTIVE,
		},
	});

	const setFormData = (clientData: Client) => {
		form.reset({
			name: clientData.name,
			email: clientData.email,
			phone: clientData.phone || "",
			company: clientData.company || "",
			position: clientData.position || "",
			address: clientData.address || "",
			city: clientData.city || "",
			country: clientData.country || "",
			website: clientData.website || "",
			notes: clientData.notes || "",
			status: clientData.status || ClientStatus.ACTIVE,
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			setFormData(client);
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: ClientFormData) => {
		try {
			await updateClient.mutateAsync({ id: client.clientId, payload: data });
			toast.success("Client updated successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to update client");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Edit Client"
			description="Update client information"
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Update Client"
			isLoading={updateClient.isPending}
			size="xxl"
		>
			<ClientFormFields form={form} />
		</FormDialog>
	);
}
