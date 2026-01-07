"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { useCreateInvoice } from "../../../hooks/useInvoices";
import { createInvoiceSchema, CreateInvoiceFormData } from "../../../schemas/invoiceSchema";
import { InvoiceFormFields } from "./InvoiceFormFields";
import { toast } from "sonner";

interface CreateInvoiceFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	clientId: number;
	projects: Array<{ projectId: number; title: string }>;
	onSuccess?: () => void;
}

export function CreateInvoiceForm({ open, onOpenChange, clientId, projects, onSuccess }: CreateInvoiceFormProps) {
	const createInvoice = useCreateInvoice(clientId);

	const form = useForm<CreateInvoiceFormData>({
		resolver: zodResolver(createInvoiceSchema),
		defaultValues: {
			projectId: projects.length > 0 ? projects[0].projectId : 0,
			amount: 0,
			currency: "USD",
			dueDate: "",
			notes: "",
		},
	});

	const resetForm = () => {
		form.reset({
			projectId: projects.length > 0 ? projects[0].projectId : 0,
			amount: 0,
			currency: "USD",
			dueDate: "",
			notes: "",
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			resetForm();
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateInvoiceFormData) => {
		try {
			await createInvoice.mutateAsync(data);
			toast.success("Invoice created successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to create invoice");
		}
	};

	const projectOptions = projects.map((p) => ({
		value: p.projectId.toString(),
		label: p.title,
	}));

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Add New Invoice"
			description="Create a new invoice for the client"
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Create Invoice"
			isLoading={createInvoice.isPending}
			isSubmitDisabled={projects.length === 0}
		>
			<InvoiceFormFields
				form={form}
				projectOptions={projectOptions}
			/>
		</FormDialog>
	);
}
