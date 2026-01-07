"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { createContractSchema, CreateContractFormData } from "../../../schemas/contractSchema";
import { Contract } from "../../../types/contract";
import { useUpdateContract } from "../../../hooks/useContracts";
import { useQuotations } from "../../../hooks/useQuotations";
import { ContractFormFields } from "./ContractFormFields";
import { toast } from "sonner";

interface UpdateContractFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contract: Contract;
	onSuccess?: () => void;
}

export function UpdateContractForm({ open, onOpenChange, contract, onSuccess }: UpdateContractFormProps) {
	const [activeTab, setActiveTab] = useState("details");
	const updateMutation = useUpdateContract();
	const { data: quotationsData } = useQuotations();

	const form = useForm({
		resolver: zodResolver(createContractSchema),
		defaultValues: {
			quotationId: contract.quotationId?.toString() || "",
			title: contract.title,
			content: contract.content,
			partyOne: contract.partyOne,
			partyTwo: contract.partyTwo,
			totalAmount: contract.totalAmount,
			currency: contract.currency,
			paymentTerms: contract.paymentTerms,
			startDate: contract.startDate,
			endDate: contract.endDate || "",
			milestones: contract.milestones || [],
		},
	});

	const setFormData = (contractData: Contract) => {
		form.reset({
			quotationId: contractData.quotationId?.toString() || "",
			title: contractData.title,
			content: contractData.content,
			partyOne: contractData.partyOne,
			partyTwo: contractData.partyTwo,
			totalAmount: contractData.totalAmount,
			currency: contractData.currency,
			paymentTerms: contractData.paymentTerms,
			startDate: contractData.startDate,
			endDate: contractData.endDate || "",
			milestones: contractData.milestones || [],
		});
		setActiveTab("details");
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			setFormData(contract);
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateContractFormData) => {
		try {
			const payload = {
				...data,
				quotationId: data.quotationId ? parseInt(data.quotationId, 10) : undefined,
			};
			await updateMutation.mutateAsync({
				id: contract.contractId,
				payload: payload as Parameters<typeof updateMutation.mutateAsync>[0]["payload"],
			});
			toast.success("Contract updated successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to update contract");
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
			title="Edit Contract"
			description="Update contract details"
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Update Contract"
			isLoading={updateMutation.isPending}
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
