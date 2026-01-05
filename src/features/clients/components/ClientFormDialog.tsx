"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { useCreateClient, useUpdateClient } from "../hooks/useClients";
import { Client, ClientStatus, ClientStatusLabels } from "../types";
import { clientSchema, ClientFormData } from "../schemas/clientSchema";
import { toast } from "sonner";

interface ClientFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	client?: Client | null;
}

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
	const isEditing = !!client;
	const createClient = useCreateClient();
	const updateClient = useUpdateClient();

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

	useEffect(() => {
		if (client) {
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
				status: client.status,
			});
		} else {
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
		}
	}, [client, form]);

	const onSubmit = async (data: ClientFormData) => {
		try {
			if (isEditing && client) {
				await updateClient.mutateAsync({ id: client.clientId, payload: data });
				toast.success("Client updated successfully");
			} else {
				await createClient.mutateAsync(data);
				toast.success("Client created successfully");
			}
			onOpenChange(false);
		} catch {
			toast.error(isEditing ? "Failed to update client" : "Failed to create client");
		}
	};

	const isLoading = createClient.isPending || updateClient.isPending;

	const statusOptions = Object.values(ClientStatus).map((status) => ({
		value: status,
		label: ClientStatusLabels[status],
	}));

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={isEditing ? "Edit Client" : "Add New Client"}
			submitLabel={isEditing ? "Update Client" : "Create Client"}
			isLoading={isLoading}
			onSubmit={form.handleSubmit(onSubmit)}
			showFooter={false}
			size="xxl"
		>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="name"
							label="Name"
							placeholder="John Doe"
						/>

						<FormInput
							control={form.control}
							name="email"
							label="Email"
							type="email"
							placeholder="john@example.com"
						/>

						<FormInput
							control={form.control}
							name="phone"
							label="Phone"
							type="tel"
							placeholder="+1 234 567 890"
						/>

						<FormInput
							control={form.control}
							name="company"
							label="Company"
							placeholder="Acme Inc."
						/>

						<FormInput
							control={form.control}
							name="position"
							label="Position"
							placeholder="CEO"
						/>

						<FormInput
							control={form.control}
							name="website"
							label="Website"
							type="url"
							placeholder="https://example.com"
						/>

						<FormInput
							control={form.control}
							name="city"
							label="City"
							placeholder="New York"
						/>

						<FormInput
							control={form.control}
							name="country"
							label="Country"
							placeholder="USA"
						/>
					</div>

					<FormInput
						control={form.control}
						name="address"
						label="Address"
						placeholder="123 Main St"
					/>

					<FormTextarea
						control={form.control}
						name="notes"
						label="Notes"
						placeholder="Additional notes about the client..."
						rows={3}
					/>

					<FormSelect
						control={form.control}
						name="status"
						label="Status"
						options={statusOptions}
					/>

					<div className="flex justify-end gap-2 pt-4">
						<button
							type="button"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
							disabled={isLoading}
						>
							{isLoading ? "Saving..." : isEditing ? "Update Client" : "Create Client"}
						</button>
					</div>
				</form>
			</Form>
		</FormDialog>
	);
}
