"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { useUpdateClient } from "../../../hooks/useClients";
import { Client, ClientStatus } from "../../../types";
import { clientSchema, ClientFormData } from "../../../schemas/clientSchema";
import { ClientFormFields } from "./ClientFormFields";
import { notifyApiError } from "@/lib/errorHandling";
import { isAxiosError } from "axios";

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

	useEffect(() => {
		if (!open) return;
		form.reset({
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
		});
	}, [client, open, form]);

	const handleSubmit = async (data: ClientFormData) => {
		try {
			await updateClient.mutateAsync({ id: client.clientId, payload: data });
			// Success toast comes from the backend message via the axios interceptor.
			onOpenChange(false);
			onSuccess?.();
		} catch (error) {
			const errors = isAxiosError<{ errors?: Record<string, string[]> }>(error) ? error.response?.data.errors : undefined;
			if (errors) {
				for (const [field, messages] of Object.entries(errors)) {
					if (field in data) form.setError(field as keyof ClientFormData, { type: "server", message: messages[0] });
				}
			}
			notifyApiError(error);
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
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
