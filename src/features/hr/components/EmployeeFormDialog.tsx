"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormSelect, FormSwitch } from "@/components/shared";
import { useCreateEmployee, useUpdateEmployee } from "../hooks";
import { useUserSpecializations } from "@/features/admin/hooks/useEnums";
import type { Employee } from "../types";
import { toast } from "sonner";

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

interface EmployeeFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employee?: Employee | null;
	roles?: Array<{ value: string; label: string }>;
}

export function EmployeeFormDialog({ open, onOpenChange, employee, roles = [] }: EmployeeFormDialogProps) {
	const isEditing = !!employee;
	const createEmployee = useCreateEmployee();
	const updateEmployee = useUpdateEmployee();
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

	useEffect(() => {
		if (employee) {
			form.reset({
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
			});
		} else {
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
		}
	}, [employee, form]);

	const handleSubmit = async (data: EmployeeFormData) => {
		try {
			if (isEditing && employee) {
				const payload: Record<string, unknown> = {};
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

				if (Object.keys(payload).length > 0) {
					await updateEmployee.mutateAsync({ id: employee.userId, payload });
					toast.success("Employee updated successfully");
				}
			} else {
				await createEmployee.mutateAsync({
					name: data.name,
					email: data.email,
					password: data.password || "",
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
			}
			form.reset();
			onOpenChange(false);
		} catch {
			toast.error(isEditing ? "Failed to update employee" : "Failed to create employee");
		}
	};

	const roleOptions = [...roles];

	// Transform specializations to select options
	const specializationOptions = [
		{ value: "", label: "No Specialization" },
		...(specializationsData?.data?.map((spec) => ({
			value: spec.value,
			label: spec.label,
		})) || []),
	];

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={isEditing ? "Edit Employee" : "Add Employee"}
			description={isEditing ? "Update employee details" : "Add a new employee to the system"}
			submitLabel={isEditing ? "Update" : "Create"}
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={createEmployee.isPending || updateEmployee.isPending}
			isSubmitDisabled={!form.formState.isValid}
			size="lg"
		>
			<Form {...form}>
				<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="name"
							label="Name"
							placeholder="John Doe"
						/>
						<FormInput
							control={form.control}
							name="email"
							label="Email"
							type="email"
							placeholder="john@example.com"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="password"
							label={isEditing ? "New Password (optional)" : "Password"}
							type="password"
							placeholder="••••••••"
						/>
						<FormSelect
							control={form.control}
							name="role"
							label="Role"
							placeholder="Select a role"
							options={roleOptions}
						/>
					</div>

					<FormSelect
						control={form.control}
						name="specialization"
						label="Specialization"
						placeholder="Select specialization..."
						options={specializationOptions}
						description="Determines which tasks the employee can see and work on"
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormInput
							control={form.control}
							name="salary"
							label="Monthly Salary"
							type="number"
							min={0}
							step={100}
						/>
						<FormInput
							control={form.control}
							name="internalHourlyCost"
							label="Internal Hourly Cost"
							type="number"
							min={0}
							step={1}
						/>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<FormInput
							control={form.control}
							name="workHoursPerDay"
							label="Work Hours/Day"
							type="number"
							min={1}
							max={24}
						/>
						<FormInput
							control={form.control}
							name="workStartTime"
							label="Start Time"
							type="time"
						/>
						<FormInput
							control={form.control}
							name="graceDaysAllowed"
							label="Grace Days/Month"
							type="number"
							min={0}
							max={31}
						/>
					</div>

					<FormSwitch
						control={form.control}
						name="isActive"
						label="Active"
						description="Employee can access the system"
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
