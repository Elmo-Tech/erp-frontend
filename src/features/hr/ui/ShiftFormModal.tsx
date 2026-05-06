"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormCheckboxGroup } from "@/shared/ui/forms/FormCheckboxGroup";
import { useCreateShift, useUpdateShift } from "@/features/hr/model/use-hr-actions";
import { shiftSchema, SHIFT_DEFAULT_VALUES, type ShiftFormData } from "@/features/hr/model/hr.schema";
import type { DayOfWeek, Shift } from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DAY_OPTIONS = [
	{ value: "Sun", label: "Sunday" },
	{ value: "Mon", label: "Monday" },
	{ value: "Tue", label: "Tuesday" },
	{ value: "Wed", label: "Wednesday" },
	{ value: "Thu", label: "Thursday" },
	{ value: "Fri", label: "Friday" },
	{ value: "Sat", label: "Saturday" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ShiftFormModalProps {
	/** Controls dialog visibility */
	open: boolean;
	onClose: () => void;
	/**
	 * When provided, the modal is in edit mode.
	 * When null, the modal is in create mode.
	 */
	editTarget: Shift | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ShiftFormModal({ open, onClose, editTarget }: ShiftFormModalProps) {
	const isEditing = editTarget !== null;
	const createShift = useCreateShift();
	const updateShift = useUpdateShift();

	const form = useForm<ShiftFormData>({
		resolver: zodResolver(shiftSchema),
		defaultValues: SHIFT_DEFAULT_VALUES,
	});

	// Sync form values whenever the modal opens or the target changes
	useEffect(() => {
		if (!open) return;

		if (editTarget) {
			form.reset({
				name: editTarget.name,
				// Normalise HH:MM:SS → HH:MM for the <input type="time">
				start_time: editTarget.startTime.slice(0, 5),
				end_time: editTarget.endTime.slice(0, 5),
				working_days: editTarget.workingDays as DayOfWeek[],
				grace_period_minutes: editTarget.gracePeriodMinutes,
			});
		} else {
			form.reset(SHIFT_DEFAULT_VALUES);
		}
	}, [open, editTarget, form]);

	const handleSubmit = async (data: ShiftFormData) => {
		try {
			if (isEditing) {
				await updateShift.mutateAsync({ id: editTarget.id, payload: data });
				toast.success("Shift updated successfully");
			} else {
				await createShift.mutateAsync(data);
				toast.success("Shift created successfully");
			}
			onClose();
		} catch {
			toast.error(isEditing ? "Failed to update shift" : "Failed to create shift");
		}
	};

	const isPending = createShift.isPending || updateShift.isPending;

	return (
		<FormDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title={isEditing ? "Edit Shift" : "Create Shift"}
			description={isEditing ? "Update the shift schedule and working days." : "Define a new work shift with its schedule and grace period."}
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel={isEditing ? "Save Changes" : "Create Shift"}
			isLoading={isPending}
			size="lg"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					<FormInput
						control={form.control}
						name="name"
						label="Shift Name"
						placeholder="e.g. Morning Shift"
						disabled={isPending}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="start_time"
							label="Start Time"
							type="time"
							disabled={isPending}
						/>
						<FormInput
							control={form.control}
							name="end_time"
							label="End Time"
							type="time"
							disabled={isPending}
						/>
					</div>

					<FormInput
						control={form.control}
						name="grace_period_minutes"
						label="Grace Period (minutes)"
						type="number"
						min={0}
						max={120}
						placeholder="15"
						description="Minutes allowed after start time before marking as late."
						disabled={isPending}
					/>

					<FormCheckboxGroup
						control={form.control}
						name="working_days"
						label="Working Days"
						options={DAY_OPTIONS}
						columns={4}
						disabled={isPending}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
