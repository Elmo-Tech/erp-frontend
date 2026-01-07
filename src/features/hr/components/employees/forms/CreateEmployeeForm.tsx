"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/components/shared";
import { Form } from "@/components/ui/form";
import { useCreateEmployee } from "../../../hooks";
import { useUserSpecializations } from "@/features/admin/hooks/useEnums";
import { EmployeeFormFields } from "./EmployeeFormFields";
import { toast } from "sonner";

const employeeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
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

interface CreateEmployeeFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	roles?: Array<{ value: string; label: string }>;
	onSuccess?: () => void;
}

export function CreateEmployeeForm({ open, onOpenChange, roles = [], onSuccess }: CreateEmployeeFormProps) {
	const createEmployee = useCreateEmployee();
	const { data: specializationsData } = useUserSpecializations();

	const form = useForm<EmployeeFormData>({
		resolver: zodResolver(employeeSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: "",
			specialization: "",
			isActive: true,
			salary: null,
			workHoursPerDay: 8,
			workStartTime: "10:00",
			graceDaysAllowed: 5,
			internalHourlyCost: null,
		},
	});

	const resetForm = () => {
		form.reset({
			name: "",
			email: "",
			password: "",
			role: "",
			specialization: "",
			isActive: true,
			salary: null,
			workHoursPerDay: 8,
			workStartTime: "10:00",
			graceDaysAllowed: 5,
			internalHourlyCost: null,
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			resetForm();
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: EmployeeFormData) => {
		try {
			await createEmployee.mutateAsync({
				name: data.name,
				email: data.email,
				password: data.password,
				role: data.role,
				specialization: data.specialization,
				isActive: data.isActive,
				salary: data.salary ?? undefined,
				workHoursPerDay: data.workHoursPerDay,
				workStartTime: data.workStartTime,
				graceDaysAllowed: data.graceDaysAllowed,
				internalHourlyCost: data.internalHourlyCost ?? undefined,
			});
			toast.success("Employee created successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to create employee");
		}
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
			isLoading={createEmployee.isPending}
			isSubmitDisabled={!form.formState.isValid}
			size="lg"
		>
			<Form {...form}>
				<EmployeeFormFields
					control={form.control}
					isEditing={false}
					roleOptions={roles}
					specializationOptions={specializationOptions}
				/>
			</Form>
		</FormDialog>
	);
}
