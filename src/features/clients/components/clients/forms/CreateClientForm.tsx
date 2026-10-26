"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { useCreateClient } from "../../../hooks/useClients";
import { ClientStatus } from "../../../types";
import { clientSchema, ClientFormData } from "../../../schemas/clientSchema";
import { ClientFormFields } from "./ClientFormFields";
import { notifyApiError } from "@/lib/errorHandling";

interface CreateClientFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function CreateClientForm({ open, onOpenChange, onSuccess }: CreateClientFormProps) {
	const createClient = useCreateClient();

	const form = useForm<ClientFormData>({
		resolver: zodResolver(clientSchema),
		defaultValues: {
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
		},
	});

	const resetForm = () => {
		form.reset({
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
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			resetForm();
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: ClientFormData) => {
		try {
			await createClient.mutateAsync(data);
			onOpenChange(false);
			onSuccess?.();
		} catch (error) {
			notifyApiError(error);
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Add New Client"
			description="Create a new client"
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Create Client"
			isLoading={createClient.isPending}
			size="xxl"
		>
			<ClientFormFields form={form} />
		</FormDialog>
	);
}
