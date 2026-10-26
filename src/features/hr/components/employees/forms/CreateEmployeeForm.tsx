"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/components/shared";
import { Form } from "@/components/ui/form";
import { useCreateEmployee, useUploadEmployeeAvatar } from "../../../hooks";
import { useUserSpecializations } from "@/features/admin/hooks/useEnums";
import type { Employee } from "../../../types";
import { EmployeeFormFields } from "./EmployeeFormFields";
import { toast } from "sonner";
import { handleApiError, notifyApiError } from "@/lib/errorHandling";
import { employeeDetailsDefaults, employeeDetailsSchema } from "../../../lib/employee-details";

const employeeSchema = z.object({
	...employeeDetailsSchema,
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.string().optional(),
	specialization: z.string().optional(),
	isActive: z.boolean(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const defaultEmployeeValues: EmployeeFormData = {
	...employeeDetailsDefaults(),
	name: "",
	email: "",
	password: "",
	role: "",
	specialization: "",
	isActive: true,
};

interface CreateEmployeeFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	roles?: Array<{ value: string; label: string }>;
	onSuccess?: () => void;
}

export function CreateEmployeeForm({ open, onOpenChange, roles = [], onSuccess }: CreateEmployeeFormProps) {
	const createEmployee = useCreateEmployee();
	const uploadEmployeeAvatar = useUploadEmployeeAvatar();
	const { data: specializationsData } = useUserSpecializations();
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	const form = useForm<EmployeeFormData>({
		resolver: zodResolver(employeeSchema),
		defaultValues: defaultEmployeeValues,
	});

	useEffect(() => {
		if (open) {
			form.reset(defaultEmployeeValues);
		}
	}, [form, open]);

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) setAvatarFile(null);
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: EmployeeFormData) => {
		let employee: Employee;

		try {
			employee = await createEmployee.mutateAsync({
				...data,
				name: data.name,
				email: data.email,
				password: data.password,
				role: data.role,
				specialization: data.specialization,
				isActive: data.isActive,
			});
		} catch (error) {
			notifyApiError(error);
			return;
		}

		if (avatarFile) {
			try {
				await uploadEmployeeAvatar.mutateAsync({ id: employee.userId, avatar: avatarFile });
			} catch (error) {
				toast.error("Employee was created, but the photo could not be uploaded.", {
					description: `${handleApiError(error)} You can add the photo by editing the employee.`,
				});
				handleOpenChange(false);
				onSuccess?.();
				return;
			}
		}

		// Success toast comes from the backend message via the axios interceptor.
		handleOpenChange(false);
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
			title="Add Employee"
			description="Add a new employee to the system"
			submitLabel="Create"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={createEmployee.isPending || uploadEmployeeAvatar.isPending}
			isSubmitDisabled={!form.formState.isValid}
			size="xxxl"
		>
			<Form {...form}>
				<EmployeeFormFields
					control={form.control}
					isEditing={false}
					roleOptions={roles}
					specializationOptions={specializationOptions}
					avatarFile={avatarFile}
					disabled={createEmployee.isPending || uploadEmployeeAvatar.isPending}
					onAvatarChange={setAvatarFile}
				/>
			</Form>
		</FormDialog>
	);
}
