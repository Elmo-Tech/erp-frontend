"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/components/shared";
import { createLeadSchema, CreateLeadFormData } from "../../../schemas/leadSchema";
import { LeadStatus } from "../../../types/lead";
import { useCreateLead } from "../../../hooks/useLeads";
import { LeadFormFields } from "./LeadFormFields";
import { toast } from "sonner";

interface CreateLeadFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultStatus?: LeadStatus;
	onSuccess?: () => void;
}

export function CreateLeadForm({ open, onOpenChange, defaultStatus, onSuccess }: CreateLeadFormProps) {
	const createMutation = useCreateLead();

	const form = useForm<CreateLeadFormData>({
		resolver: zodResolver(createLeadSchema),
		defaultValues: {
			name: "",
			email: "",
			company: "",
			source: undefined,
			status: defaultStatus || LeadStatus.NEW,
		},
	});

	const resetForm = () => {
		form.reset({
			name: "",
			email: "",
			company: "",
			source: undefined,
			status: defaultStatus || LeadStatus.NEW,
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			resetForm();
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateLeadFormData) => {
		try {
			await createMutation.mutateAsync(data);
			toast.success("Lead created successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to create lead");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Create New Lead"
			description="Add a new lead to your pipeline"
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Create"
			isLoading={createMutation.isPending}
			size="md"
		>
			<LeadFormFields form={form} />
		</FormDialog>
	);
}
