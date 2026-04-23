"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { employeeApi } from "@/entities/employee/api/employee.api";
import { employeeKeys } from "@/entities/employee/model/query-keys";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect, type SelectOption } from "@/shared/ui/forms/FormSelect";
import { FormSwitch } from "@/shared/ui/forms/FormSwitch";
import { createEmployeeSchema, DEFAULT_EMPLOYEE_ROLE_OPTIONS, getCreateEmployeeDefaultValues, toCreateEmployeePayload, type CreateEmployeeFormData } from "../model/employee.schema";
import { useCreateEmployee } from "../model/use-employee-actions";

interface CreateEmployeeFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function CreateEmployeeForm({ open, onOpenChange, onSuccess }: CreateEmployeeFormProps) {
	const createEmployee = useCreateEmployee();
	const rolesQuery = useQuery({
		queryKey: employeeKeys.roles(),
		queryFn: employeeApi.getRoles,
		enabled: open,
		staleTime: 10 * 60 * 1000,
	});

	const roleOptions = useMemo<SelectOption[]>(() => {
		const roles = rolesQuery.data ?? [];
		if (roles.length === 0) {
			return [...DEFAULT_EMPLOYEE_ROLE_OPTIONS];
		}

		return roles.map((role) => ({
			value: role.name,
			label: role.displayName || role.name,
		}));
	}, [rolesQuery.data]);

	const form = useForm<CreateEmployeeFormData>({
		resolver: zodResolver(createEmployeeSchema),
		defaultValues: getCreateEmployeeDefaultValues(roleOptions[0]?.value),
	});

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(getCreateEmployeeDefaultValues(roleOptions[0]?.value));
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateEmployeeFormData) => {
		try {
			await createEmployee.mutateAsync(toCreateEmployeePayload(data));
			toast.success("Employee created");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to create employee");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="New employee"
			description="Create an employee profile and workspace access."
			submitLabel="Create employee"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={createEmployee.isPending}
			size="xxl"
		>
			<Form {...form}>
				<div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormInput
							control={form.control}
							name="name"
							label="Name"
							placeholder="Jane Cooper"
						/>
						<FormInput
							control={form.control}
							name="email"
							label="Email"
							type="email"
							placeholder="jane@example.com"
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormInput
							control={form.control}
							name="password"
							label="Password"
							type="password"
							placeholder="Minimum 8 characters"
						/>
						<FormSelect
							control={form.control}
							name="role"
							label="Role"
							placeholder="Select role"
							options={roleOptions}
						/>
					</div>

					<FormInput
						control={form.control}
						name="specialization"
						label="Specialization"
						placeholder="Frontend, QA, operations"
					/>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormInput
							control={form.control}
							name="salary"
							label="Monthly salary"
							type="number"
							min={0}
							step={100}
						/>
						<FormInput
							control={form.control}
							name="internalHourlyCost"
							label="Internal hourly cost"
							type="number"
							min={0}
							step={1}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<FormInput
							control={form.control}
							name="workHoursPerDay"
							label="Hours/day"
							type="number"
							min={1}
							max={24}
						/>
						<FormInput
							control={form.control}
							name="workStartTime"
							label="Start time"
							type="time"
						/>
						<FormInput
							control={form.control}
							name="graceDaysAllowed"
							label="Grace days/month"
							type="number"
							min={0}
							max={31}
						/>
					</div>

					<FormSwitch
						control={form.control}
						name="isActive"
						label="Active"
						description="Active employees can access the workspace."
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
