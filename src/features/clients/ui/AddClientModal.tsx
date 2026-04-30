"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import type { SelectOption } from "@/shared/ui/forms";
import { DEFAULT_ADD_CLIENT_VALUES, addClientSchema, type AddClientFormData, toAddClientPayload } from "../model/client.schema";
import { useCreateClient } from "../model/use-client-actions";
import { AddClientForm } from "./AddClientForm";

interface AddClientModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function AddClientModal({ open, onOpenChange, onSuccess }: AddClientModalProps) {
	const createClient = useCreateClient();
	const form = useForm<AddClientFormData>({
		resolver: zodResolver(addClientSchema),
		defaultValues: DEFAULT_ADD_CLIENT_VALUES,
		shouldUnregister: true,
	});

	const usersQuery = useGetInternalUsers(open);

	const accountManagerOptions = useMemo<SelectOption[]>(() => {
		return (usersQuery.data?.users ?? []).map((user) => ({
			value: String(user.id),
			label: user.name,
		}));
	}, [usersQuery.data?.users]);

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(DEFAULT_ADD_CLIENT_VALUES);
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: AddClientFormData) => {
		try {
			await createClient.mutateAsync(toAddClientPayload(data));
			toast.success("Client created successfully");
			form.reset(DEFAULT_ADD_CLIENT_VALUES);
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
			title="Add Client"
			description="Create a company or individual client profile with ownership and interest data."
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Create Client"
			isLoading={createClient.isPending}
			size="4xl"
		>
			<AddClientForm
				form={form}
				accountManagerOptions={accountManagerOptions}
				isLoadingAccountManagers={usersQuery.isLoading}
				disabled={createClient.isPending}
			/>
		</FormDialog>
	);
}
