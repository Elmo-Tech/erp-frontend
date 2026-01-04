"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormSelect } from "@/components/shared";
import { createLeadSchema, CreateLeadFormData } from "../schemas/leadSchema";
import { LeadStatus, Lead } from "../types/lead";
import { useCreateLead, useUpdateLead } from "../hooks/useLeads";
import { useEffect } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
	{ value: LeadStatus.NEW, label: "New" },
	{ value: LeadStatus.CONTACTED, label: "Contacted" },
	{ value: LeadStatus.QUALIFIED, label: "Qualified" },
	{ value: LeadStatus.PROPOSAL, label: "Proposal" },
	{ value: LeadStatus.NEGOTIATION, label: "Negotiation" },
	{ value: LeadStatus.WON, label: "Won" },
	{ value: LeadStatus.LOST, label: "Lost" },
];

const SOURCE_OPTIONS = [
	{ value: "website", label: "Website" },
	{ value: "referral", label: "Referral" },
	{ value: "social_media", label: "Social Media" },
	{ value: "cold_call", label: "Cold Call" },
	{ value: "email_campaign", label: "Email Campaign" },
	{ value: "event", label: "Event" },
	{ value: "other", label: "Other" },
];

interface LeadFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	lead?: Lead | null;
	defaultStatus?: LeadStatus;
	onSuccess?: () => void;
}

export function LeadFormDialog({ open, onOpenChange, lead, defaultStatus, onSuccess }: LeadFormDialogProps) {
	const isEditing = !!lead;
	const createMutation = useCreateLead();
	const updateMutation = useUpdateLead();

	const form = useForm<CreateLeadFormData>({
		resolver: zodResolver(createLeadSchema),
		defaultValues: {
			name: "",
			email: "",
			company: "",
			source: "",
			status: defaultStatus || LeadStatus.NEW,
		},
	});

	// Reset form when dialog opens/closes or lead changes
	useEffect(() => {
		if (open) {
			if (lead) {
				form.reset({
					name: lead.name,
					email: lead.email,
					company: lead.company || "",
					source: lead.source || "",
					status: lead.status,
				});
			} else {
				form.reset({
					name: "",
					email: "",
					company: "",
					source: "",
					status: defaultStatus || LeadStatus.NEW,
				});
			}
		}
	}, [open, lead, defaultStatus, form]);

	const handleSubmit = async (data: CreateLeadFormData) => {
		try {
			if (isEditing && lead) {
				await updateMutation.mutateAsync({
					id: lead.leadId,
					payload: data,
				});
				toast.success("Lead updated successfully");
			} else {
				await createMutation.mutateAsync(data);
				toast.success("Lead created successfully");
			}
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error(isEditing ? "Failed to update lead" : "Failed to create lead");
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={isEditing ? "Edit Lead" : "Create New Lead"}
			description={isEditing ? "Update lead information" : "Add a new lead to your pipeline"}
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel={isEditing ? "Update" : "Create"}
			isLoading={isLoading}
			size="md"
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormInput
						control={form.control}
						name="name"
						label="Name"
						placeholder="Enter lead name"
					/>

					<FormInput
						control={form.control}
						name="email"
						label="Email"
						type="email"
						placeholder="Enter email address"
					/>

					<FormInput
						control={form.control}
						name="company"
						label="Company"
						placeholder="Enter company name (optional)"
					/>

					<FormSelect
						control={form.control}
						name="source"
						label="Source"
						placeholder="Select lead source"
						options={SOURCE_OPTIONS}
					/>

					<FormSelect
						control={form.control}
						name="status"
						label="Status"
						placeholder="Select status"
						options={STATUS_OPTIONS}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
