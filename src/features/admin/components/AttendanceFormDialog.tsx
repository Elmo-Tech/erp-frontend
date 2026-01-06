/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { FormDatePicker } from "@/components/shared/forms/FormDatePicker";
import { FormCheckbox } from "@/components/shared/forms/FormCheckbox";
import { Attendance, AttendanceFormData } from "../types/attendance";
import { useCreateAttendance, useUpdateAttendance } from "../hooks/useAttendance";
import { useUsers } from "../hooks/useUsers";

const formSchema = z.object({
	userId: z.string().min(1, "Please select an employee"),
	date: z.string().min(1, "Date is required"),
	clockIn: z.string().min(1, "Clock in time is required"),
	clockOut: z.string().optional(),
	lateMinutes: z.number().min(0).optional(),
	isLate: z.boolean().optional(),
	usedGraceDay: z.boolean().optional(),
	deductionMinutes: z.number().min(0).optional(),
	notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AttendanceFormDialogProps {
	open: boolean;
	onClose: () => void;
	attendance: Attendance | null;
}

function formatDateTimeLocal(isoString: string | null): string {
	if (!isoString) return "";
	const date = new Date(isoString);
	return format(date, "HH:mm");
}

// Combine date and time into ISO datetime string
function combineDateTime(date: string, time: string): string {
	if (!time) return "";
	return `${date}T${time}:00`;
}

export function AttendanceFormDialog({ open, onClose, attendance }: AttendanceFormDialogProps) {
	const isEditing = !!attendance;
	const { data: usersData } = useUsers();
	const createMutation = useCreateAttendance();
	const updateMutation = useUpdateAttendance();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			userId: "",
			date: format(new Date(), "yyyy-MM-dd"),
			clockIn: "",
			clockOut: "",
			lateMinutes: 0,
			isLate: false,
			usedGraceDay: false,
			deductionMinutes: 0,
			notes: "",
		},
	});

	const watchUserId = form.watch("userId");
	const watchIsLate = form.watch("isLate");
	const watchLateMinutes = form.watch("lateMinutes");

	// Get selected user's grace days remaining
	const selectedUser = usersData?.users?.find((u) => u.userId.toString() === watchUserId);
	const graceDaysRemaining = selectedUser?.graceDaysRemaining ?? attendance?.user?.graceDaysRemaining ?? 0;

	// Show grace day option only if late > 30 min and has grace days remaining
	const showGraceDayOption = watchIsLate && (watchLateMinutes ?? 0) > 30 && graceDaysRemaining > 0;

	useEffect(() => {
		if (attendance) {
			form.reset({
				userId: attendance.userId.toString(),
				date: attendance.date,
				clockIn: formatDateTimeLocal(attendance.clockIn),
				clockOut: formatDateTimeLocal(attendance.clockOut),
				lateMinutes: attendance.lateMinutes,
				isLate: attendance.isLate,
				usedGraceDay: attendance.usedGraceDay,
				deductionMinutes: attendance.deductionMinutes,
				notes: attendance.notes || "",
			});
		} else {
			form.reset({
				userId: "",
				date: format(new Date(), "yyyy-MM-dd"),
				clockIn: "",
				clockOut: "",
				lateMinutes: 0,
				isLate: false,
				usedGraceDay: false,
				deductionMinutes: 0,
				notes: "",
			});
		}
	}, [attendance, form]);

	const onSubmit = async (values: FormValues) => {
		const data: AttendanceFormData = {
			userId: parseInt(values.userId),
			date: values.date,
			clockIn: combineDateTime(values.date, values.clockIn),
			clockOut: values.clockOut ? combineDateTime(values.date, values.clockOut) : undefined,
			lateMinutes: values.lateMinutes,
			isLate: values.isLate,
			usedGraceDay: values.usedGraceDay,
			deductionMinutes: values.deductionMinutes,
			notes: values.notes,
		};

		try {
			if (isEditing && attendance) {
				await updateMutation.mutateAsync({ id: attendance.attendanceId, data });
			} else {
				await createMutation.mutateAsync(data);
			}
			onClose();
		} catch {
			// Error handled in mutation
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	const userOptions =
		usersData?.users?.map((user) => ({
			value: user.userId.toString(),
			label: user.name,
		})) || [];

	return (
		<FormDialog
			open={open}
			onOpenChange={(o) => !o && onClose()}
			title={isEditing ? "Edit Attendance Record" : "Add Attendance Record"}
			size="xl"
			showFooter={false}
		>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<FormSelect
						control={form.control}
						name="userId"
						label="Employee"
						placeholder="Select employee"
						options={userOptions}
						disabled={isEditing}
					/>

					<FormDatePicker
						control={form.control}
						name="date"
						label="Date"
						disabled={isEditing}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="clockIn"
							label="Clock In"
							type="time"
						/>

						<FormInput
							control={form.control}
							name="clockOut"
							label="Clock Out"
							type="time"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="lateMinutes"
							label="Late Minutes"
							type="number"
							min={0}
						/>

						<FormInput
							control={form.control}
							name="deductionMinutes"
							label="Deduction Minutes"
							type="number"
							min={0}
						/>
					</div>

					<div className="flex flex-col gap-3">
						<FormCheckbox
							control={form.control}
							name="isLate"
							label="Mark as Late"
							description="Check if this attendance should be counted as late"
						/>

						{showGraceDayOption && (
							<FormCheckbox
								control={form.control}
								name="usedGraceDay"
								label="Use Grace Day"
								description={`Use one of the employee's grace days (${graceDaysRemaining} remaining)`}
							/>
						)}

						{watchIsLate && (watchLateMinutes ?? 0) > 30 && graceDaysRemaining === 0 && <p className="text-sm text-destructive">No grace days remaining for this employee</p>}
					</div>

					<FormTextarea
						control={form.control}
						name="notes"
						label="Notes"
						placeholder="Add notes (optional)"
						rows={3}
					/>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isPending}
						>
							{isPending ? "Saving..." : isEditing ? "Update" : "Add"}
						</Button>
					</div>
				</form>
			</Form>
		</FormDialog>
	);
}
