"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { employeeApi } from "@/entities/employee/api/employee.api";
import { employeeKeys } from "@/entities/employee/model/query-keys";
import { PROJECT_MEMBER_ROLES } from "@/entities/employee/model/types";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { Form } from "@/shared/ui/form";
import { FormSelect, type SelectOption } from "@/shared/ui/forms/FormSelect";
import { addProjectMemberSchema, getAddProjectMemberDefaultValues, toCreateProjectMemberPayload, type AddProjectMemberFormData } from "../model/employee.schema";
import { useAddProjectMember } from "../model/use-employee-actions";

interface AddProjectMemberFormProps {
	projectId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	existingMemberIds?: number[];
	onSuccess?: () => void;
}

const ROLE_OPTIONS: SelectOption[] = PROJECT_MEMBER_ROLES.map((role) => ({
	value: role.value,
	label: role.label,
}));

export function AddProjectMemberForm({ projectId, open, onOpenChange, existingMemberIds = [], onSuccess }: AddProjectMemberFormProps) {
	const addProjectMember = useAddProjectMember();
	const employeesQuery = useQuery({
		queryKey: employeeKeys.list({ isActive: true, perPage: 100 }),
		queryFn: () => employeeApi.getEmployees({ isActive: true, perPage: 100 }),
		enabled: open,
		staleTime: 5 * 60 * 1000,
	});

	const employeeOptions = useMemo<SelectOption[]>(() => {
		const existingIds = new Set(existingMemberIds);
		const availableEmployees = (employeesQuery.data?.employees ?? []).filter((employee) => !existingIds.has(employee.userId));

		if (employeesQuery.isLoading) {
			return [{ value: "0", label: "Loading employees...", disabled: true }];
		}

		if (availableEmployees.length === 0) {
			return [{ value: "0", label: "No available employees", disabled: true }];
		}

		return availableEmployees.map((employee) => ({
			value: String(employee.userId),
			label: `${employee.name} / ${employee.email}`,
		}));
	}, [employeesQuery.data?.employees, employeesQuery.isLoading, existingMemberIds]);

	const form = useForm<AddProjectMemberFormData>({
		resolver: zodResolver(addProjectMemberSchema),
		defaultValues: getAddProjectMemberDefaultValues(),
	});

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(getAddProjectMemberDefaultValues());
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: AddProjectMemberFormData) => {
		try {
			await addProjectMember.mutateAsync({
				projectId,
				payload: toCreateProjectMemberPayload(data),
			});
			toast.success("Team member added");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to add team member");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Add team member"
			description="Assign an employee to this project."
			submitLabel="Add member"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={addProjectMember.isPending}
			isSubmitDisabled={employeesQuery.isLoading || employeeOptions.every((option) => option.disabled)}
			size="md"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					<FormSelect
						control={form.control}
						name="userId"
						label="Employee"
						placeholder="Select employee"
						options={employeeOptions}
						onValueChange={(value) => form.setValue("userId", Number(value), { shouldDirty: true, shouldValidate: true })}
					/>
					<FormSelect
						control={form.control}
						name="role"
						label="Project role"
						placeholder="Select role"
						options={ROLE_OPTIONS}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
