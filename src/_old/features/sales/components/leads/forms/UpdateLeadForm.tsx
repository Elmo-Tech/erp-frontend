"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/shared/ui";
import { createLeadSchema, CreateLeadFormData } from "../../../schemas/leadSchema";
import { Lead } from "../../../types/lead";
import { useUpdateLead } from "../../../hooks/useLeads";
import { LeadFormFields } from "./LeadFormFields";
import { toast } from "sonner";

interface UpdateLeadFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	lead: Lead;
	onSuccess?: () => void;
}

export function UpdateLeadForm({ open, onOpenChange, lead, onSuccess }: UpdateLeadFormProps) {
	const updateMutation = useUpdateLead();

	const form = useForm<CreateLeadFormData>({
		resolver: zodResolver(createLeadSchema),
		defaultValues: {
			name: lead.name,
			email: lead.email,
			company: lead.company || "",
			source: lead.source,
			status: lead.status,
		},
	});

	const setFormData = (leadData: Lead) => {
		form.reset({
			name: leadData.name,
			email: leadData.email,
			company: leadData.company || "",
			source: leadData.source,
			status: leadData.status,
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			setFormData(lead);
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateLeadFormData) => {
		try {
			await updateMutation.mutateAsync({
				id: lead.leadId,
				payload: data,
			});
			toast.success("Lead updated successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to update lead");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Edit Lead"
			description="Update lead information"
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Update"
			isLoading={updateMutation.isPending}
			size="md"
		>
			<LeadFormFields form={form} />
		</FormDialog>
	);
}
