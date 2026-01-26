"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { TaskDeliverable } from "@/features/projects/types/taskDeliverable";
import { adminChangeStatusSchema, AdminChangeStatusFormData } from "../../schemas/adminDeliverableSchemas";
import { useAdminChangeDeliverableStatus } from "../../hooks/useAdminDeliverables";

interface AdminChangeStatusDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable;
}

const statusOptions = [
	{ label: "Pending", value: "pending" },
	{ label: "Submitted", value: "submitted" },
	{ label: "Under Review", value: "under_review" },
	{ label: "Approved", value: "approved" },
	{ label: "Rejected", value: "rejected" },
];

export function AdminChangeStatusDialog({ open, onOpenChange, deliverable }: AdminChangeStatusDialogProps) {
	const changeStatusMutation = useAdminChangeDeliverableStatus();

	const form = useForm<AdminChangeStatusFormData>({
		resolver: zodResolver(adminChangeStatusSchema),
		defaultValues: {
			status: deliverable.status,
			reason: "",
		},
	});

	const onSubmit = (data: AdminChangeStatusFormData) => {
		changeStatusMutation.mutate(
			{ deliverableId: deliverable.deliverableId, data },
			{
				onSuccess: () => {
					onOpenChange(false);
					form.reset();
				},
			},
		);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Deliverable Status</DialogTitle>
					<DialogDescription>Change status directly without following workflow. Provide a reason for audit trail.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormSelect
							control={form.control}
							name="status"
							label="New Status"
							placeholder="Select status"
							options={statusOptions}
						/>

						<FormTextarea
							control={form.control}
							name="reason"
							label="Reason"
							placeholder="Why are you changing the status?"
							rows={3}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={changeStatusMutation.isPending}
							>
								{changeStatusMutation.isPending ? "Changing..." : "Change Status"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
