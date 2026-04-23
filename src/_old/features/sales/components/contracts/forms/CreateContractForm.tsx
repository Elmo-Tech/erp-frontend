"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { createContractSchema, CreateContractFormData } from "../../../schemas/contractSchema";
import { useCreateContract } from "../../../hooks/useContracts";
import { useQuotations } from "../../../hooks/useQuotations";
import { ContractFormFields } from "./ContractFormFields";
import { toast } from "sonner";

interface CreateContractFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	quotationId?: number;
	onSuccess?: () => void;
}

export function CreateContractForm({ open, onOpenChange, quotationId, onSuccess }: CreateContractFormProps) {
	const [activeTab, setActiveTab] = useState("details");
	const createMutation = useCreateContract();
	const { data: quotationsData } = useQuotations();

	const form = useForm({
		resolver: zodResolver(createContractSchema),
		defaultValues: {
			dataSource: "from_quotation" as const,
			quotationId: quotationId || 0,
			title: "",
			expiryDays: 30,
			projectDuration: "",
			deliverables: [""],
			startDate: "",
			endDate: "",
		},
	});

	const resetForm = () => {
		let initialAmount = 0;
		let initialCurrency = "USD";

		if (quotationId && quotationsData?.quotations) {
			const selectedQuotation = quotationsData.quotations.find((q) => q.quotationId === quotationId);
			if (selectedQuotation) {
				initialAmount = selectedQuotation.finalPrice;
				initialCurrency = selectedQuotation.currency;
			}
		}

		form.reset({
			dataSource: "from_quotation" as const,
			quotationId: quotationId || 0,
			title: "",
			expiryDays: 30,
			projectDuration: "",
			deliverables: [""],
			startDate: "",
			endDate: "",
		});
		setActiveTab("details");
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			resetForm();
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateContractFormData) => {
		try {
			await createMutation.mutateAsync(data as Parameters<typeof createMutation.mutateAsync>[0]);
			toast.success("Contract created successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to create contract");
		}
	};

	const quotationOptions =
		quotationsData?.quotations
			?.filter((q) => q.status === "approved")
			?.map((q) => ({
				value: q.quotationId.toString(),
				label: `#${q.quotationId} - ${q.lead?.company || q.lead?.name || "Unknown"} (${q.currency} ${q.finalPrice.toLocaleString()})`,
			})) || [];

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Create Contract"
			description="Create a new contract"
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Create Contract"
			isLoading={createMutation.isPending}
			size="full"
			className="max-w-4xl"
		>
			<Form {...form}>
				<ContractFormFields
					control={form.control}
					quotationOptions={quotationOptions}
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>
			</Form>
		</FormDialog>
	);
}
