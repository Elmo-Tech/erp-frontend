"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import { SUPPORTED_CURRENCIES } from "@/entities/invoice/model/types";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect, type SelectOption } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { createInvoiceSchema, getCreateInvoiceDefaultValues, toCreateInvoicePayload, type CreateInvoiceFormData } from "../model/invoice.schema";
import { useCreateInvoice } from "../model/use-invoice-actions";

interface ProjectOption {
	projectId: number;
	title: string;
}

interface CreateInvoiceFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId?: number;
	projectTitle?: string;
	clientId?: number;
	projectOptions?: ProjectOption[];
	onSuccess?: () => void;
}

const CURRENCY_OPTIONS: SelectOption[] = SUPPORTED_CURRENCIES.map((currency) => ({
	value: currency,
	label: currency,
}));

export function CreateInvoiceForm({ open, onOpenChange, projectId, projectTitle, clientId, projectOptions = [], onSuccess }: CreateInvoiceFormProps) {
	const createInvoice = useCreateInvoice(clientId);
	const projectsQuery = useQuery({
		queryKey: projectKeys.list({ perPage: 100 }),
		queryFn: () => projectApi.getProjects({ perPage: 100 }),
		enabled: open && !projectId && projectOptions.length === 0,
		staleTime: 5 * 60 * 1000,
	});

	const availableProjects = useMemo<ProjectOption[]>(() => {
		if (projectId) {
			return [
				{
					projectId,
					title: projectTitle || `Project #${projectId}`,
				},
			];
		}

		if (projectOptions.length > 0) {
			return projectOptions;
		}

		return (projectsQuery.data?.projects ?? []).map((project) => ({
			projectId: project.projectId,
			title: project.title,
		}));
	}, [projectId, projectOptions, projectTitle, projectsQuery.data?.projects]);

	const projectSelectOptions = useMemo<SelectOption[]>(
		() =>
			availableProjects.map((project) => ({
				value: String(project.projectId),
				label: project.title,
			})),
		[availableProjects]
	);

	const initialProjectId = projectId ?? availableProjects[0]?.projectId;
	const form = useForm<CreateInvoiceFormData>({
		resolver: zodResolver(createInvoiceSchema),
		defaultValues: getCreateInvoiceDefaultValues(initialProjectId),
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		const nextProjectId = projectId ?? availableProjects[0]?.projectId;
		if (!nextProjectId || form.getValues("projectId")) {
			return;
		}

		form.setValue("projectId", nextProjectId, {
			shouldDirty: true,
			shouldValidate: true,
		});
	}, [availableProjects, form, open, projectId]);

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(getCreateInvoiceDefaultValues(projectId ?? availableProjects[0]?.projectId));
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateInvoiceFormData) => {
		try {
			await createInvoice.mutateAsync(toCreateInvoicePayload(data));
			toast.success("Invoice created");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to create invoice");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="New invoice"
			description="Create an invoice against an existing project."
			submitLabel="Create invoice"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={createInvoice.isPending}
			isSubmitDisabled={availableProjects.length === 0 || projectsQuery.isLoading}
			size="xl"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					<FormSelect
						control={form.control}
						name="projectId"
						label="Project"
						placeholder="Select project"
						options={projectSelectOptions}
						disabled={Boolean(projectId)}
						onValueChange={(value) => form.setValue("projectId", Number(value), { shouldDirty: true, shouldValidate: true })}
					/>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
						<FormInput
							control={form.control}
							name="amount"
							label="Amount"
							type="number"
							placeholder="0.00"
							min={0}
							step="0.01"
						/>
						<FormSelect
							control={form.control}
							name="currency"
							label="Currency"
							options={CURRENCY_OPTIONS}
						/>
					</div>

					<FormInput
						control={form.control}
						name="dueDate"
						label="Due date"
						type="date"
					/>

					<FormTextarea
						control={form.control}
						name="notes"
						label="Notes"
						placeholder="Optional invoice note"
						rows={3}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
