"use client";

import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { LeadSource, LeadSourceLabels, LeadPriority, LeadPriorityLabels, LeadTemperature, LeadTemperatureLabels, LeadStatus, LeadStatusLabels } from "@/entities/lead/model/types";
import { leadSchema, type LeadFormData, toCreateLeadPayload } from "../model/lead.schema";
import { useCreateLead } from "../model/use-lead-actions";
import { LeadFormFields } from "./LeadFormFields";

interface CreateLeadFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

const DEFAULT_VALUES: LeadFormData = {
	name: "",
	email: "",
	phone: "",
	company: "",
	projectName: "",
	country: "",
	source: undefined,
	priority: undefined,
	leadTemperature: undefined,
	expectedBudget: undefined,
	expectedCloseDate: undefined,
	notes: "",
	status: LeadStatus.NEW,
};

export function CreateLeadForm({ open, onOpenChange, onSuccess }: CreateLeadFormProps) {
	const createLead = useCreateLead();
	const form = useForm<LeadFormData>({
		resolver: zodResolver(leadSchema),
		defaultValues: DEFAULT_VALUES,
	});

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) form.reset(DEFAULT_VALUES);
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: LeadFormData) => {
		try {
			await createLead.mutateAsync(toCreateLeadPayload(data));
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
			title="New lead"
			description="Add a new sales lead to the pipeline."
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Create lead"
			isLoading={createLead.isPending}
		>
			<LeadFormFields form={form} />
		</FormDialog>
	);
}
