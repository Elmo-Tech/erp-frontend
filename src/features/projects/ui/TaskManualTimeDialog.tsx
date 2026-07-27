"use client";

import type { UseFormReturn } from "react-hook-form";

import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import type { ManualTimeFormData } from "../model/use-task-manual-time-dialog";

interface TaskManualTimeDialogProps {
	open: boolean;
	form: UseFormReturn<ManualTimeFormData>;
	isEditing: boolean;
	isLoading: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
}

export function TaskManualTimeDialog({ open, form, isEditing, isLoading, onOpenChange, onSubmit }: TaskManualTimeDialogProps) {
	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={isEditing ? "Edit Time Entry" : "Log Time Manually"}
			description={isEditing ? "Update the recorded work time for this task." : "Record past work time for this task."}
			submitLabel={isEditing ? "Save Time" : "Log Time"}
			isLoading={isLoading}
			onSubmit={onSubmit}
			size="sm"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					<FormDatePicker
						control={form.control}
						name="date"
						label="Date"
					/>
					<div className="grid grid-cols-2 gap-3">
						<FormInput
							control={form.control}
							name="startTime"
							label="Start time"
							type="time"
						/>
						<FormInput
							control={form.control}
							name="endTime"
							label="End time"
							type="time"
						/>
					</div>
					<FormTextarea
						control={form.control}
						name="note"
						label="Note (optional)"
						placeholder="What did you work on?"
						rows={2}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
