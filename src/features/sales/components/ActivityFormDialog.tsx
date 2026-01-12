"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormSelect, FormTextarea } from "@/components/shared";
import { useAddLeadActivity } from "../hooks/useLeads";
import { toast } from "sonner";

const activitySchema = z.object({
	type: z.enum(["call", "email", "meeting", "note"]),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	outcome: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

const TYPE_OPTIONS = [
	{ value: "call", label: "Phone Call" },
	{ value: "email", label: "Email" },
	{ value: "meeting", label: "Meeting" },
	{ value: "note", label: "Note" },
];

interface ActivityFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	leadId: number;
}

export function ActivityFormDialog({ open, onOpenChange, leadId }: ActivityFormDialogProps) {
	const addActivity = useAddLeadActivity();

	const form = useForm<ActivityFormData>({
		resolver: zodResolver(activitySchema),
		defaultValues: {
			type: "call",
			title: "",
			description: "",
			outcome: "",
		},
	});

	const onSubmit = async (data: ActivityFormData) => {
		try {
			await addActivity.mutateAsync({ leadId, payload: data });
			toast.success("Activity added successfully");
			form.reset();
			onOpenChange(false);
		} catch {
			toast.error("Failed to add activity");
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			form.reset();
		}
		onOpenChange(open);
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Add Activity"
			description="Log an interaction with this lead"
			submitLabel="Add Activity"
			isLoading={addActivity.isPending}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormSelect
						control={form.control}
						name="type"
						label="Activity Type"
						options={TYPE_OPTIONS}
					/>

					<FormInput
						control={form.control}
						name="title"
						label="Title"
						placeholder="e.g., Initial discovery call"
					/>

					<FormTextarea
						control={form.control}
						name="description"
						label="Description"
						placeholder="Details about the activity..."
						rows={3}
					/>

					<FormInput
						control={form.control}
						name="outcome"
						label="Outcome"
						placeholder="e.g., Scheduled follow-up meeting"
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
