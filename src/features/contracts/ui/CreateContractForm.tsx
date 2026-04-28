"use client";

import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { contractSchema, type ContractFormData, toCreateContractPayload } from "../model/contract.schema";
import { useCreateContract } from "../model/use-contract-actions";
import { ContractFormFields } from "./ContractFormFields";

interface CreateContractFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
	projectId?: number;
}

const DEFAULT_VALUES: ContractFormData = {
	title: "",
	projectId: undefined,
	content: "",
	startDate: "",
	endDate: "",
	totalAmount: undefined,
	currency: "USD",
	paymentTerms: "",
	partyOne: undefined,
	partyTwo: undefined,
	milestones: undefined,
};

export function CreateContractForm({ open, onOpenChange, onSuccess, projectId }: CreateContractFormProps) {
	const createContract = useCreateContract();
	const form = useForm<ContractFormData>({
		resolver: zodResolver(contractSchema),
		defaultValues: { ...DEFAULT_VALUES, projectId },
	});

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) form.reset({ ...DEFAULT_VALUES, projectId });
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: ContractFormData) => {
		try {
			await createContract.mutateAsync(toCreateContractPayload(data));
			toast.success("Contract created successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to create contract");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="New contract"
			description="Create a new contract with terms and milestones."
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Create contract"
			isLoading={createContract.isPending}
			size="xxl"
		>
			<ContractFormFields form={form} />
		</FormDialog>
	);
}
