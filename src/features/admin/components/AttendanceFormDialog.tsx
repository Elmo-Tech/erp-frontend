"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormTimePicker } from "@/components/shared/forms/FormTimePicker";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { FormDatePicker } from "@/components/shared/forms/FormDatePicker";
import { Attendance, AttendanceFormData } from "../types/attendance";
import { useCreateAttendance, useUpdateAttendance, useAddAttendanceDeduction, useMarkGraceDay, useRemoveGraceDay } from "../hooks/useAttendance";
import { useUsers } from "../hooks/useUsers";
import { formatTimeForInput, combineDateTimeForAPI } from "@/lib/dateUtils";
import { toast } from "sonner";

const formSchema = z.object({
	userId: z.string().min(1, "Please select an employee"),
	date: z.string().min(1, "Date is required"),
	clockIn: z.string().min(1, "Clock in time is required"),
	clockOut: z.string().optional(),
	isGraceDay: z.boolean().optional(),
	deductionMinutes: z.number().optional(),
	notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const getDefaultValues = (attendance: Attendance | null): FormValues => {
	if (attendance) {
		return {
			userId: attendance.userId.toString(),
			date: attendance.date,
			clockIn: formatTimeForInput(attendance.clockIn),
			clockOut: formatTimeForInput(attendance.clockOut),
			isGraceDay: attendance.usedGraceDay,
			deductionMinutes: attendance.deductionMinutes || undefined,
			notes: attendance.notes || "",
		};
	}
	return {
		userId: "",
		date: format(new Date(), "yyyy-MM-dd"),
		clockIn: "",
		clockOut: "",
		isGraceDay: false,
		deductionMinutes: undefined,
		notes: "",
	};
};

interface AttendanceFormDialogProps {
	open: boolean;
	onClose: () => void;
	attendance: Attendance | null;
}

export function AttendanceFormDialog({ open, onClose, attendance }: AttendanceFormDialogProps) {
	const isEditing = !!attendance;
	const { data: usersData } = useUsers();
	const createMutation = useCreateAttendance();
	const updateMutation = useUpdateAttendance();
	const deductionMutation = useAddAttendanceDeduction();
	const markGraceDayMutation = useMarkGraceDay();
	const removeGraceDayMutation = useRemoveGraceDay();

	const [activeTab, setActiveTab] = useState<"attendance" | "deduction">("attendance");

	const defaultValues = useMemo(() => getDefaultValues(attendance), [attendance]);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
		values: defaultValues,
	});

	// Watch deduction minutes for enabling/disabling the button
	// eslint-disable-next-line react-hooks/incompatible-library
	const watchedDeductionMinutes = form.watch("deductionMinutes");

	const onSubmit = async (values: FormValues) => {
		const data: AttendanceFormData = {
			userId: parseInt(values.userId),
			date: values.date,
			clockIn: combineDateTimeForAPI(values.date, values.clockIn),
			clockOut: values.clockOut ? combineDateTimeForAPI(values.date, values.clockOut) : undefined,
			notes: values.notes,
			isGraceDay: values.isGraceDay,
			deductionMinutes: values.deductionMinutes,
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

	const handleAddDeduction = async () => {
		if (!attendance) return;

		const deductionMinutes = form.getValues("deductionMinutes");
		if (!deductionMinutes || deductionMinutes <= 0) {
			toast.error("Please enter valid deduction minutes");
			return;
		}

		try {
			await deductionMutation.mutateAsync({
				id: attendance.attendanceId,
				data: {
					reason: "Manual deduction from attendance management",
					late_minutes: deductionMinutes,
				},
			});
			// Close dialog after mutation completes and cache is invalidated
			onClose();
		} catch {
			// Error handled in mutation
		}
	};

	const handleToggleGraceDay = async () => {
		if (!attendance) return;

		try {
			if (attendance.usedGraceDay) {
				await removeGraceDayMutation.mutateAsync(attendance.attendanceId);
			} else {
				await markGraceDayMutation.mutateAsync(attendance.attendanceId);
			}
			// Close dialog after mutation completes successfully
			onClose();
		} catch {
			// Error handled in mutation
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending || deductionMutation.isPending || markGraceDayMutation.isPending || removeGraceDayMutation.isPending;

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
			description="Late minutes, grace days, and deductions are calculated automatically based on clock-in time."
			size="lg"
			showFooter={false}
		>
			{/* Tab Navigation for Edit Mode */}
			{isEditing && (
				<div className="flex border-b mb-4">
					<button
						type="button"
						onClick={() => setActiveTab("attendance")}
						className={`px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === "attendance"
								? "border-b-2 border-primary text-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Attendance
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("deduction")}
						className={`px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === "deduction"
								? "border-b-2 border-primary text-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Deductions & Grace Days
					</button>
				</div>
			)}

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					{/* Attendance Tab */}
					{(!isEditing || activeTab === "attendance") && (
						<>
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
								<FormTimePicker
									control={form.control}
									name="clockIn"
									label="Clock In"
								/>

								<FormTimePicker
									control={form.control}
									name="clockOut"
									label="Clock Out"
								/>
							</div>

							<FormTextarea
								control={form.control}
								name="notes"
								label="Notes"
								placeholder="Add notes (optional)"
								rows={3}
							/>
						</>
					)}

					{/* Deductions Tab (only in edit mode) */}
					{isEditing && activeTab === "deduction" && (
						<div className="space-y-4 py-4">
							{/* Grace Day Section */}
							<div className="border rounded-lg p-4 space-y-3">
								<h4 className="font-medium text-sm">Grace Day</h4>
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">
											{attendance.usedGraceDay ? "Grace Day Used" : "No Grace Day"}
										</p>
										<p className="text-xs text-muted-foreground">
											{attendance.user?.graceDaysRemaining !== undefined
												? `${attendance.user.graceDaysRemaining} grace days remaining`
												: "Grace days info unavailable"}
										</p>
									</div>
									<Button
										type="button"
										variant={attendance.usedGraceDay ? "destructive" : "default"}
										size="sm"
										onClick={handleToggleGraceDay}
										disabled={isPending || (!attendance.usedGraceDay && (attendance.user?.graceDaysRemaining || 0) <= 0)}
									>
										{attendance.usedGraceDay ? "Remove Grace Day" : "Mark as Grace Day"}
									</Button>
								</div>
							</div>

							{/* Manual Deduction Section */}
							<div className="border rounded-lg p-4 space-y-3">
								<h4 className="font-medium text-sm">Add Manual Deduction</h4>
								<div className="space-y-3">
									<FormInput
										control={form.control}
										name="deductionMinutes"
										label="Deduction Minutes"
										type="number"
										placeholder="Enter minutes to deduct"
										min={0}
									/>
									<div className="flex gap-2">
										<Button
											type="button"
											variant="default"
											size="sm"
											onClick={handleAddDeduction}
											disabled={isPending || !watchedDeductionMinutes}
										>
											Add Deduction
										</Button>
									</div>
								</div>
								{attendance.deductionMinutes > 0 && (
									<p className="text-sm text-muted-foreground">
										Current deduction: {attendance.deductionMinutes} minutes
									</p>
								)}
							</div>
						</div>
					)}

					{/* Only show main submit button for attendance tab or new records */}
					{(!isEditing || activeTab === "attendance") && (
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
					)}
				</form>
			</Form>
		</FormDialog>
	);
}
