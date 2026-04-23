"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { ClientStatus, type Client } from "@/entities/client/model/types";
import { clientSchema, type ClientFormData, toUpdateClientPayload } from "../model/client.schema";
import { useUpdateClient } from "../model/use-client-actions";
import { ClientFormFields } from "./ClientFormFields";

interface UpdateClientFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	client: Client;
	onSuccess?: () => void;
}

function getDefaultValues(client: Client): ClientFormData {
	return {
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
	};
}

export function UpdateClientForm({ open, onOpenChange, client, onSuccess }: UpdateClientFormProps) {
	const updateClient = useUpdateClient();
	const form = useForm<ClientFormData>({
		resolver: zodResolver(clientSchema),
		defaultValues: getDefaultValues(client),
	});

	useEffect(() => {
		if (open) {
			form.reset(getDefaultValues(client));
		}
	}, [client, form, open]);

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(getDefaultValues(client));
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: ClientFormData) => {
		try {
			await updateClient.mutateAsync({
				id: client.clientId,
				payload: toUpdateClientPayload(data),
			});
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
			title="Edit client"
			description="Update the client profile and contact details."
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Update client"
			isLoading={updateClient.isPending}
			size="xxl"
		>
			<ClientFormFields form={form} />
		</FormDialog>
	);
}
