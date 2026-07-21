"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormCombobox, type ComboboxOption } from "@/shared/ui/forms/FormCombobox";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import { useShifts, useAssignHrProfile, useUpdateHrProfile } from "@/features/hr/model/use-hr-actions";
import { assignHrProfileSchema, editHrProfileSchema, ASSIGN_HR_PROFILE_DEFAULT_VALUES, type AssignHrProfileFormData, type EditHrProfileFormData } from "@/features/hr/model/hr.schema";
import type { EmployeeProfile } from "@/entities/hr/model/types";
import { useEmployeePermissions } from "@/entities/user/model/permissions";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface AssignHrProfileModalProps {
	open: boolean;
	onClose: () => void;
	/**
	 * When provided, the modal is in edit mode.
	 * When null, the modal is in "assign" (create) mode.
	 */
	editTarget: EmployeeProfile | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Assign Mode (Create)
// ─────────────────────────────────────────────────────────────────────────────

function AssignForm({ open, onClose }: { open: boolean; onClose: () => void }) {
	const { canCreateEmployees } = useEmployeePermissions();
	const assignProfile = useAssignHrProfile();
	const usersQuery = useGetInternalUsers(open);
	const shiftsQuery = useShifts();

	const form = useForm<AssignHrProfileFormData>({
		resolver: zodResolver(assignHrProfileSchema),
		defaultValues: ASSIGN_HR_PROFILE_DEFAULT_VALUES,
	});

	useEffect(() => {
		if (open) form.reset(ASSIGN_HR_PROFILE_DEFAULT_VALUES);
	}, [open, form]);

	const userOptions = useMemo<ComboboxOption[]>(
		() =>
			(usersQuery.data?.users ?? []).map((u) => ({
				value: String(u.id),
				label: u.name,
				description: u.email,
			})),
		[usersQuery.data?.users],
	);

	const shiftOptions = useMemo<ComboboxOption[]>(
		() => [
			{ value: "", label: "No Shift Assigned" },
			...(shiftsQuery.data ?? []).map((s) => ({
				value: String(s.id),
				label: s.name,
				description: `${s.startTime.slice(0, 5)} – ${s.endTime.slice(0, 5)}`,
			})),
		],
		[shiftsQuery.data],
	);

	const handleSubmit = async (data: AssignHrProfileFormData) => {
		if (!canCreateEmployees) {
			toast.error("You do not have permission to create employee profiles");
			return;
		}

		try {
			await assignProfile.mutateAsync(data);
			toast.success("HR profile assigned successfully");
			onClose();
		} catch {
			toast.error("Failed to assign HR profile");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title="Assign HR Profile"
			description="Assign salary, shift, and HR information to an existing user account."
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Assign Profile"
			isLoading={assignProfile.isPending}
			size="lg"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					{/* PBAC Rule: FormCombobox for relational entity (User) */}
					<FormCombobox
						control={form.control}
						name="user_id"
						label="Select User"
						placeholder="Search for a user to assign…"
						searchPlaceholder="Search by name or email…"
						emptyText="No users found."
						options={userOptions}
						disabled={assignProfile.isPending || usersQuery.isLoading}
					/>

					{/* PBAC Rule: FormCombobox for relational entity (Shift) */}
					<FormCombobox
						control={form.control}
						name="shift_id"
						label="Assign Shift"
						placeholder="Select a shift (optional)…"
						searchPlaceholder="Search shifts…"
						emptyText="No shifts found. Create a shift first."
						options={shiftOptions}
						disabled={assignProfile.isPending || shiftsQuery.isLoading}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="base_salary"
							label="Base Salary (USD)"
							type="number"
							step="0.01"
							min={0}
							placeholder="5000.00"
							disabled={assignProfile.isPending}
						/>
						<FormInput
							control={form.control}
							name="hourly_rate"
							label="Hourly Rate (USD)"
							type="number"
							step="0.01"
							min={0}
							placeholder="25.00"
							disabled={assignProfile.isPending}
						/>
					</div>

					<FormDatePicker
						control={form.control}
						name="join_date"
						label="Join Date"
						placeholder="Select join date"
						disabled={assignProfile.isPending}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Mode (Update — user_id is immutable)
// ─────────────────────────────────────────────────────────────────────────────

function EditForm({ open, onClose, editTarget }: { open: boolean; onClose: () => void; editTarget: EmployeeProfile }) {
	const { canEditEmployees } = useEmployeePermissions();
	const updateProfile = useUpdateHrProfile();
	const shiftsQuery = useShifts();

	const form = useForm<EditHrProfileFormData>({
		resolver: zodResolver(editHrProfileSchema),
		defaultValues: {
			shift_id: editTarget.shiftId,
			base_salary: editTarget.baseSalary,
			hourly_rate: editTarget.hourlyRate,
			join_date: editTarget.joinDate,
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				shift_id: editTarget.shiftId,
				base_salary: editTarget.baseSalary,
				hourly_rate: editTarget.hourlyRate,
				join_date: editTarget.joinDate,
			});
		}
	}, [open, editTarget, form]);

	const shiftOptions = useMemo<ComboboxOption[]>(
		() => [
			{ value: "", label: "No Shift Assigned" },
			...(shiftsQuery.data ?? []).map((s) => ({
				value: String(s.id),
				label: s.name,
				description: `${s.startTime.slice(0, 5)} – ${s.endTime.slice(0, 5)}`,
			})),
		],
		[shiftsQuery.data],
	);

	const handleSubmit = async (data: EditHrProfileFormData) => {
		if (!canEditEmployees) {
			toast.error("You do not have permission to edit employee profiles");
			return;
		}

		try {
			await updateProfile.mutateAsync({ id: editTarget.id, payload: data });
			toast.success("HR profile updated successfully");
			onClose();
		} catch {
			toast.error("Failed to update HR profile");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title="Edit HR Profile"
			description="Update salary, shift assignment, and HR information for this user."
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Save Changes"
			isLoading={updateProfile.isPending}
			size="lg"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					{/* Read-only user display — user_id is immutable on update */}
					{editTarget.user && (
						<div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
							<Avatar className="h-10 w-10 shrink-0">
								<AvatarImage src={editTarget.user.avatar ?? undefined} />
								<AvatarFallback>{editTarget.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="text-sm font-medium truncate">{editTarget.user.name}</p>
								<p className="text-xs text-muted-foreground truncate">{editTarget.user.email}</p>
							</div>
						</div>
					)}

					<FormCombobox
						control={form.control}
						name="shift_id"
						label="Assign Shift"
						placeholder="Select a shift (optional)…"
						searchPlaceholder="Search shifts…"
						emptyText="No shifts found. Create a shift first."
						options={shiftOptions}
						disabled={updateProfile.isPending || shiftsQuery.isLoading}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="base_salary"
							label="Base Salary (USD)"
							type="number"
							step="0.01"
							min={0}
							placeholder="5000.00"
							disabled={updateProfile.isPending}
						/>
						<FormInput
							control={form.control}
							name="hourly_rate"
							label="Hourly Rate (USD)"
							type="number"
							step="0.01"
							min={0}
							placeholder="25.00"
							disabled={updateProfile.isPending}
						/>
					</div>

					<FormDatePicker
						control={form.control}
						name="join_date"
						label="Join Date"
						placeholder="Select join date"
						disabled={updateProfile.isPending}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public component — delegates to Assign or Edit form
// ─────────────────────────────────────────────────────────────────────────────

export function AssignHrProfileModal({ open, onClose, editTarget }: AssignHrProfileModalProps) {
	if (editTarget) {
		return (
			<EditForm
				open={open}
				onClose={onClose}
				editTarget={editTarget}
			/>
		);
	}

	return (
		<AssignForm
			open={open}
			onClose={onClose}
		/>
	);
}
