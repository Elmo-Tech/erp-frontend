"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import { useCreateLeaveRequest, useUpdateLeaveRequest } from "../model/use-hr-actions";
import { leaveRequestSchema, LEAVE_REQUEST_DEFAULT_VALUES, type LeaveRequestFormData } from "../model/hr.schema";
import type { LeaveRequest } from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Static option lists
// ─────────────────────────────────────────────────────────────────────────────

const LEAVE_TYPE_OPTIONS = [
	{ value: "annual", label: "Annual Leave" },
	{ value: "sick", label: "Sick Leave" },
	{ value: "unpaid", label: "Unpaid Leave" },
	{ value: "permission", label: "Permission" },
];

const LEAVE_STATUS_OPTIONS = [
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface LeaveRequestFormModalProps {
	open: boolean;
	onClose: () => void;
	/** null = create mode, LeaveRequest = edit mode */
	editTarget: LeaveRequest | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function LeaveRequestFormModal({ open, onClose, editTarget }: LeaveRequestFormModalProps) {
	const isEditing = editTarget !== null;
	const createLeaveRequest = useCreateLeaveRequest();
	const updateLeaveRequest = useUpdateLeaveRequest();

	const usersQuery = useGetInternalUsers(open);
	const employeeOptions = useMemo(
		() =>
			(usersQuery.data?.users ?? []).map((u) => ({
				value: String(u.id),
				label: u.name,
				description: u.email,
			})),
		[usersQuery.data],
	);

	const form = useForm<LeaveRequestFormData>({
		resolver: zodResolver(leaveRequestSchema),
		defaultValues: LEAVE_REQUEST_DEFAULT_VALUES,
	});

	useEffect(() => {
		if (!open) return;
		if (editTarget) {
			form.reset({
				user_id: editTarget.userId,
				start_date: editTarget.startDate,
				end_date: editTarget.endDate,
				type: editTarget.type,
				status: editTarget.status,
				reason: editTarget.reason ?? "",
			});
		} else {
			form.reset(LEAVE_REQUEST_DEFAULT_VALUES);
		}
	}, [open, editTarget, form]);

	const isPending = createLeaveRequest.isPending || updateLeaveRequest.isPending;

	const handleSubmit = async (data: LeaveRequestFormData) => {
		try {
			if (isEditing) {
				await updateLeaveRequest.mutateAsync({
					id: editTarget.id,
					payload: {
						start_date: data.start_date,
						end_date: data.end_date,
						type: data.type,
						status: data.status,
						reason: data.reason || null,
					},
				});
				toast.success("Leave request updated successfully");
			} else {
				await createLeaveRequest.mutateAsync({
					user_id: data.user_id,
					start_date: data.start_date,
					end_date: data.end_date,
					type: data.type,
					status: data.status,
					reason: data.reason || null,
				});
				toast.success("Leave request created successfully");
			}
			onClose();
		} catch {
			toast.error(isEditing ? "Failed to update leave request" : "Failed to create leave request");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title={isEditing ? "Edit Leave Request" : "New Leave Request"}
			description={isEditing ? "Update the leave request details or change its status." : "Submit a leave request on behalf of an employee."}
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel={isEditing ? "Save Changes" : "Create Request"}
			isLoading={isPending}
			size="lg"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					{/* Employee — locked in edit mode */}
					<FormCombobox
						control={form.control}
						name="user_id"
						label="Employee"
						placeholder={usersQuery.isLoading ? "Loading employees…" : "Select employee…"}
						searchPlaceholder="Search employees…"
						emptyText="No employee found."
						options={employeeOptions}
						disabled={isPending || usersQuery.isLoading || isEditing}
						description={isEditing ? "Employee cannot be changed after creation." : undefined}
					/>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormInput
							control={form.control}
							name="start_date"
							label="Start Date"
							type="date"
							disabled={isPending}
						/>
						<FormInput
							control={form.control}
							name="end_date"
							label="End Date"
							type="date"
							disabled={isPending}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormSelect
							control={form.control}
							name="type"
							label="Leave Type"
							placeholder="Select type…"
							options={LEAVE_TYPE_OPTIONS}
							disabled={isPending}
						/>
						<FormSelect
							control={form.control}
							name="status"
							label="Status"
							placeholder="Select status…"
							options={LEAVE_STATUS_OPTIONS}
							disabled={isPending}
						/>
					</div>

					<FormTextarea
						control={form.control}
						name="reason"
						label="Reason (optional)"
						placeholder="Provide context for this leave request…"
						rows={3}
						disabled={isPending}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
