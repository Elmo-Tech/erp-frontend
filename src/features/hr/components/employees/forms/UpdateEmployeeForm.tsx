"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/components/shared";
import { Form } from "@/components/ui/form";
import { useUpdateEmployee, useUploadEmployeeAvatar } from "../../../hooks";
import { useUserSpecializations } from "@/features/admin/hooks/useEnums";
import type { Employee, UpdateEmployeePayload } from "../../../types";
import { EmployeeFormFields } from "./EmployeeFormFields";
import { toast } from "sonner";
import { handleApiError } from "@/lib/errorHandling";

const employeeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
	role: z.string().optional(),
	specialization: z.string().optional(),
	isActive: z.boolean(),
	salary: z.number().min(0).optional().nullable(),
	workHoursPerDay: z.number().min(1).max(24),
	workStartTime: z.string(),
	graceDaysAllowed: z.number().min(0).max(31),
	internalHourlyCost: z.number().min(0).optional().nullable(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface UpdateEmployeeFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employee: Employee;
	roles?: Array<{ value: string; label: string }>;
	onSuccess?: () => void;
}

export function UpdateEmployeeForm({ open, onOpenChange, employee, roles = [], onSuccess }: UpdateEmployeeFormProps) {
	const updateEmployee = useUpdateEmployee();
	const uploadEmployeeAvatar = useUploadEmployeeAvatar();
	const { data: specializationsData } = useUserSpecializations();
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	const form = useForm<EmployeeFormData>({
		resolver: zodResolver(employeeSchema),
		defaultValues: {
			name: employee.name,
			email: employee.email,
			password: "",
			role: employee.role || "",
			specialization: employee.specialization || "",
			isActive: employee.isActive,
			salary: employee.salary,
			workHoursPerDay: employee.workHoursPerDay,
			workStartTime: employee.workStartTime?.slice(0, 5) || "10:00",
			graceDaysAllowed: employee.graceDaysAllowed,
			internalHourlyCost: employee.internalHourlyCost,
		},
	});

	useEffect(() => {
		if (open) {
			setAvatarFile(null);
		}
	}, [open]);

	const setFormData = (emp: Employee) => {
		form.reset({
			name: emp.name,
			email: emp.email,
			password: "",
			role: emp.role || "",
			specialization: emp.specialization || "",
			isActive: emp.isActive,
			salary: emp.salary,
			workHoursPerDay: emp.workHoursPerDay,
			workStartTime: emp.workStartTime?.slice(0, 5) || "10:00",
			graceDaysAllowed: emp.graceDaysAllowed,
			internalHourlyCost: emp.internalHourlyCost,
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			setFormData(employee);
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: EmployeeFormData) => {
		const payload: UpdateEmployeePayload = {};
		if (data.name !== employee.name) payload.name = data.name;
		if (data.email !== employee.email) payload.email = data.email;
		if (data.password) payload.password = data.password;
		if (data.role !== employee.role) payload.role = data.role;
		if (data.specialization !== employee.specialization) payload.specialization = data.specialization;
		if (data.isActive !== employee.isActive) payload.isActive = data.isActive;
		if (data.salary !== employee.salary) payload.salary = data.salary;
		if (data.workHoursPerDay !== employee.workHoursPerDay) payload.workHoursPerDay = data.workHoursPerDay;
		if (data.workStartTime !== employee.workStartTime?.slice(0, 5)) payload.workStartTime = data.workStartTime;
		if (data.graceDaysAllowed !== employee.graceDaysAllowed) payload.graceDaysAllowed = data.graceDaysAllowed;
		if (data.internalHourlyCost !== employee.internalHourlyCost) payload.internalHourlyCost = data.internalHourlyCost;

		try {
			if (Object.keys(payload).length > 0) {
				await updateEmployee.mutateAsync({ id: employee.userId, payload });
			}
		} catch (error) {
			toast.error(handleApiError(error));
			return;
		}

		if (avatarFile) {
			try {
				await uploadEmployeeAvatar.mutateAsync({ id: employee.userId, avatar: avatarFile });
			} catch (error) {
				toast.error(
					Object.keys(payload).length > 0
						? "Employee details were updated, but the photo could not be uploaded."
						: "The employee photo could not be uploaded.",
					{ description: handleApiError(error) }
				);
				onOpenChange(false);
				onSuccess?.();
				return;
			}
		}

		if (Object.keys(payload).length > 0 || avatarFile) {
			toast.success("Employee updated successfully");
		}
		onOpenChange(false);
		onSuccess?.();
	};

	const specializationOptions = [
		...(specializationsData?.data?.map((spec) => ({
			value: spec.value,
			label: spec.label,
		})) || []),
	];

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Edit Employee"
			description="Update employee details"
			submitLabel="Update"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={updateEmployee.isPending || uploadEmployeeAvatar.isPending}
			isSubmitDisabled={!form.formState.isValid}
			size="xxxl"
		>
			<Form {...form}>
				<EmployeeFormFields
					control={form.control}
					isEditing={true}
					roleOptions={roles}
					specializationOptions={specializationOptions}
					avatarFile={avatarFile}
					currentAvatarUrl={employee.avatar}
					disabled={updateEmployee.isPending || uploadEmployeeAvatar.isPending}
					onAvatarChange={setAvatarFile}
				/>
			</Form>
		</FormDialog>
	);
}
