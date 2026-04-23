"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
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

type ContractFormValues = z.input<typeof createContractSchema>;

function getContractFormValues(contractData: Contract): ContractFormValues {
	const milestones =
		contractData.milestones?.map((milestone) => ({
			id: milestone.milestoneId.toString(),
			title: milestone.title,
			description: milestone.description ?? "",
			percentage: milestone.percentage,
			amount: milestone.amount,
			sortOrder: milestone.sortOrder,
			dueDate: milestone.dueDate,
			triggerType: milestone.triggerType,
			triggerValue: milestone.triggerValue,
		})) ?? [];

	const baseValues = {
		title: contractData.title,
		content: contractData.content || "",
		expiryDays: 30,
		projectDuration: contractData.endDate ? `${contractData.startDate} to ${contractData.endDate}` : "To be defined",
		deliverables: milestones.length > 0 ? milestones.map((milestone) => milestone.title) : [contractData.title],
		partyOne: {
			company: contractData.partyOne.company || "",
			representative: contractData.partyOne.representative || "",
			title: contractData.partyOne.title || "",
			address: contractData.partyOne.address,
			idNumber: contractData.partyOne.idNumber,
		},
		partyTwo: {
			company: contractData.partyTwo.company || "",
			representative: contractData.partyTwo.representative || "",
			title: contractData.partyTwo.title || "",
			address: contractData.partyTwo.address,
			idNumber: contractData.partyTwo.idNumber,
		},
		totalAmount: contractData.totalAmount,
		currency: contractData.currency || "USD",
		paymentTerms: contractData.paymentTerms || "",
		startDate: contractData.startDate,
		endDate: contractData.endDate || "",
		milestones,
	};

	if (contractData.quotationId) {
		return {
			...baseValues,
			dataSource: "from_quotation",
			quotationId: contractData.quotationId,
		};
	}

	return {
		...baseValues,
		dataSource: "new_terms",
	};
}

export function UpdateContractForm({ open, onOpenChange, contract, onSuccess }: UpdateContractFormProps) {
	const [activeTab, setActiveTab] = useState("details");
	const updateMutation = useUpdateContract();
	const { data: quotationsData } = useQuotations();

	const form = useForm<ContractFormValues, undefined, CreateContractFormData>({
		resolver: zodResolver(createContractSchema),
		defaultValues: getContractFormValues(contract),
	});

	const setFormData = (contractData: Contract) => {
		form.reset(getContractFormValues(contractData));
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
			await updateMutation.mutateAsync({
				id: contract.contractId,
				payload: data as Parameters<typeof updateMutation.mutateAsync>[0]["payload"],
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
