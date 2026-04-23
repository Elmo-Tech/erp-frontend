"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/shared/ui";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { Lead } from "../types/lead";
import { useCanConvertLead, useConvertLead } from "../hooks/useLeadConversion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const convertSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	phone: z.string().optional(),
	company: z.string().optional(),
	position: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	website: z.string().url("Invalid URL").optional().or(z.literal("")),
	notes: z.string().optional(),
});

type ConvertFormData = z.infer<typeof convertSchema>;

interface ConvertLeadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	lead: Lead;
}

const getDefaultValues = (lead: Lead): ConvertFormData => ({
	name: lead.name,
	email: lead.email,
	phone: lead.phone || "",
	company: lead.company || "",
	position: "",
	address: "",
	city: "",
	country: lead.country || "",
	website: "",
	notes: lead.notes || "",
});

export function ConvertLeadDialog({ open, onOpenChange, lead }: ConvertLeadDialogProps) {
	const router = useRouter();
	const { data: canConvertData, isLoading: checkingConvert } = useCanConvertLead(lead.leadId);
	const convertLead = useConvertLead();
	const [showForm, setShowForm] = useState(false);

	const form = useForm<ConvertFormData>({
		resolver: zodResolver(convertSchema),
		defaultValues: getDefaultValues(lead),
		values: getDefaultValues(lead),
	});

	const handleQuickConvert = async () => {
		try {
			const result = await convertLead.mutateAsync({ leadId: lead.leadId });
			toast.success(result.message);
			onOpenChange(false);
			router.push(`/dashboard/clients/${result.data.clientId}`);
		} catch {
			toast.error("Failed to convert lead");
		}
	};

	const onSubmit = async (data: ConvertFormData) => {
		try {
			const result = await convertLead.mutateAsync({ leadId: lead.leadId, payload: data });
			toast.success(result.message);
			onOpenChange(false);
			router.push(`/dashboard/clients/${result.data.clientId}`);
		} catch {
			toast.error("Failed to convert lead");
		}
	};

	const isLoading = convertLead.isPending;

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={
				<span className="flex items-center gap-2">
					<UserPlus className="h-5 w-5" />
					Convert Lead to Client
				</span>
			}
			description={`Convert "${lead.name}" to a client to start creating projects and invoices.`}
			showFooter={false}
			size="xxl"
		>
			{checkingConvert ? (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
			) : !canConvertData?.canConvert ? (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{canConvertData?.reason}</AlertDescription>
				</Alert>
			) : canConvertData?.existingClientId ? (
				<div className="space-y-4">
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							A client with email &quot;{lead.email}&quot; already exists: <strong>{canConvertData.existingClientName}</strong>. The lead will be linked to this existing client.
						</AlertDescription>
					</Alert>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleQuickConvert}
							disabled={isLoading}
						>
							{isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Link to Existing Client
						</Button>
					</div>
				</div>
			) : !showForm ? (
				<div className="space-y-4">
					<Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
						<CheckCircle2 className="h-4 w-4 text-green-600" />
						<AlertDescription className="text-green-800 dark:text-green-200">This lead can be converted to a client. You can convert quickly with the lead&apos;s existing data or customize the client details.</AlertDescription>
					</Alert>
					<div className="flex flex-col sm:flex-row justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							variant="secondary"
							onClick={() => setShowForm(true)}
						>
							Customize Details
						</Button>
						<Button
							onClick={handleQuickConvert}
							disabled={isLoading}
						>
							{isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Quick Convert
						</Button>
					</div>
				</div>
			) : (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<div className="grid grid-cols-2 gap-4">
							<FormInput
								control={form.control}
								name="name"
								label="Name"
							/>
							<FormInput
								control={form.control}
								name="email"
								label="Email"
								type="email"
							/>
							<FormInput
								control={form.control}
								name="phone"
								label="Phone"
							/>
							<FormInput
								control={form.control}
								name="company"
								label="Company"
							/>
							<FormInput
								control={form.control}
								name="position"
								label="Position"
							/>
							<FormInput
								control={form.control}
								name="website"
								label="Website"
							/>
							<FormInput
								control={form.control}
								name="city"
								label="City"
							/>
							<FormInput
								control={form.control}
								name="country"
								label="Country"
							/>
						</div>
						<FormInput
							control={form.control}
							name="address"
							label="Address"
						/>
						<FormTextarea
							control={form.control}
							name="notes"
							label="Notes"
							rows={3}
						/>

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowForm(false)}
							>
								Back
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
							>
								{isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Convert to Client
							</Button>
						</div>
					</form>
				</Form>
			)}
		</FormDialog>
	);
}
