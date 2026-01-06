"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput, FormSelect, FormTextarea } from "@/components/shared";
import { Loader2 } from "lucide-react";
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
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Activity</DialogTitle>
					<DialogDescription>Log an interaction with this lead</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
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

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={addActivity.isPending}
							>
								{addActivity.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Add Activity
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
