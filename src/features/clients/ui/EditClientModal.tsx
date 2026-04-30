"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import type { Client } from "@/entities/client/model/types";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import type { SelectOption } from "@/shared/ui/forms";
import { addClientSchema, type AddClientFormData, toAddClientFormData, toEditClientPayload } from "../model/client.schema";
import { useUpdateClient } from "../model/use-client-actions";
import { AddClientForm } from "./AddClientForm";

interface EditClientModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	client: Client;
	onSuccess?: () => void;
}

export function EditClientModal({ open, onOpenChange, client, onSuccess }: EditClientModalProps) {
	const updateClient = useUpdateClient();
	const defaultValues = useMemo(() => toAddClientFormData(client), [client]);
	const form = useForm<AddClientFormData>({
		resolver: zodResolver(addClientSchema),
		defaultValues,
		shouldUnregister: true,
	});

	const usersQuery = useGetInternalUsers(open);

	const accountManagerOptions = useMemo<SelectOption[]>(() => {
		return (usersQuery.data?.users ?? []).map((user) => ({
			value: String(user.id),
			label: user.name,
		}));
	}, [usersQuery.data?.users]);

	useEffect(() => {
		if (open) {
			form.reset(defaultValues);
		}
	}, [defaultValues, form, open]);

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(defaultValues);
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: AddClientFormData) => {
		try {
			await updateClient.mutateAsync({
				id: client.clientId,
				payload: toEditClientPayload(data),
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
			title="Edit Client"
			description="Update the same company or individual profile fields used when creating a client."
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Save Changes"
			isLoading={updateClient.isPending}
			size="4xl"
		>
			<AddClientForm
				form={form}
				accountManagerOptions={accountManagerOptions}
				isLoadingAccountManagers={usersQuery.isLoading}
				disabled={updateClient.isPending}
			/>
		</FormDialog>
	);
}
