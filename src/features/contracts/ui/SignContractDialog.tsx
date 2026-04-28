"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { useSignContract } from "../model/use-contract-actions";

const signContractSchema = z.object({
	signedByClient: z.string().trim().min(1, "Signer name is required"),
	signedPdf: z.any().optional(),
});

type SignContractFormData = z.infer<typeof signContractSchema>;

interface SignContractDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contractId: number;
	contractTitle: string;
	onSuccess?: () => void;
}

export function SignContractDialog({ open, onOpenChange, contractId, contractTitle, onSuccess }: SignContractDialogProps) {
	const signContract = useSignContract();
	const form = useForm<SignContractFormData>({
		resolver: zodResolver(signContractSchema),
		defaultValues: { signedByClient: "", signedPdf: undefined },
	});

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) form.reset({ signedByClient: "", signedPdf: undefined });
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: SignContractFormData) => {
		try {
			await signContract.mutateAsync({
				id: contractId,
				payload: {
					signedByClient: data.signedByClient,
					signedPdf: data.signedPdf,
				},
			});
			toast.success("Contract signed successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to sign contract");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Sign contract"
			description={
				<span>
					Sign <span className="font-medium text-foreground">{contractTitle}</span>? This action records the signer and optional PDF.
				</span>
			}
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Sign contract"
			isLoading={signContract.isPending}
		>
			<Form {...form}>
				<div className="grid gap-4">
					<FormInput control={form.control} name="signedByClient" label="Signed by" />
					<div className="space-y-1.5">
						<label className="text-sm font-medium">Signed PDF (optional)</label>
						<input
							type="file"
							accept=".pdf"
							onChange={(event) => {
								const file = event.target.files?.[0];
								form.setValue("signedPdf", file);
							}}
							className="text-sm"
						/>
					</div>
				</div>
			</Form>
		</FormDialog>
	);
}
