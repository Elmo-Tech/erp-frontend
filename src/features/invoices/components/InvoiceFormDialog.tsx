"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { useCreateInvoice } from "../hooks/useInvoices";
import { createInvoiceSchema, CreateInvoiceFormData } from "../schemas/invoiceSchema";
import { toast } from "sonner";

interface InvoiceFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	clientId: number;
	projects: Array<{ projectId: number; title: string }>;
}

const currencyOptions = [
	{ value: "USD", label: "USD - US Dollar" },
	{ value: "EUR", label: "EUR - Euro" },
	{ value: "GBP", label: "GBP - British Pound" },
	{ value: "SAR", label: "SAR - Saudi Riyal" },
	{ value: "AED", label: "AED - UAE Dirham" },
	{ value: "EGP", label: "EGP - Egyptian Pound" },
];

export function InvoiceFormDialog({ open, onOpenChange, clientId, projects }: InvoiceFormDialogProps) {
	const createInvoice = useCreateInvoice(clientId);

	const form = useForm<CreateInvoiceFormData>({
		resolver: zodResolver(createInvoiceSchema),
		defaultValues: {
			projectId: 0,
			amount: 0,
			currency: "USD",
			dueDate: "",
			notes: "",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				projectId: projects.length > 0 ? projects[0].projectId : 0,
				amount: 0,
				currency: "USD",
				dueDate: "",
				notes: "",
			});
		}
	}, [open, projects, form]);

	const onSubmit = async (data: CreateInvoiceFormData) => {
		try {
			await createInvoice.mutateAsync(data);
			toast.success("Invoice created successfully");
			onOpenChange(false);
		} catch {
			toast.error("Failed to create invoice");
		}
	};

	const projectOptions = projects.map((p) => ({
		value: p.projectId.toString(),
		label: p.title,
	}));

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Add New Invoice"
			showFooter={false}
		>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<FormSelect<CreateInvoiceFormData>
						control={form.control}
						name="projectId"
						label="Project"
						placeholder="Select project"
						options={projectOptions}
						onValueChange={(value: string) => form.setValue("projectId", Number(value))}
					/>

					<FormInput<CreateInvoiceFormData>
						control={form.control}
						name="amount"
						label="Amount"
						type="number"
						placeholder="0.00"
					/>

					<FormSelect<CreateInvoiceFormData>
						control={form.control}
						name="currency"
						label="Currency"
						placeholder="Select currency"
						options={currencyOptions}
					/>

					<FormInput<CreateInvoiceFormData>
						control={form.control}
						name="dueDate"
						label="Due Date"
						type="date"
					/>

					<FormTextarea<CreateInvoiceFormData>
						control={form.control}
						name="notes"
						label="Notes"
						placeholder="Enter invoice notes (optional)"
					/>

					<div className="flex justify-end gap-2 pt-4">
						<button
							type="button"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
							onClick={() => onOpenChange(false)}
							disabled={createInvoice.isPending}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
							disabled={createInvoice.isPending || projects.length === 0}
						>
							{createInvoice.isPending ? "Creating..." : "Create Invoice"}
						</button>
					</div>
				</form>
			</Form>
		</FormDialog>
	);
}
