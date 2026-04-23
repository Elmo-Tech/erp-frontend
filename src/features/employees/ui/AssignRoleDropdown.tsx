"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeApi } from "@/entities/employee/api/employee.api";
import { employeeKeys } from "@/entities/employee/model/query-keys";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { DEFAULT_EMPLOYEE_ROLE_OPTIONS } from "../model/employee.schema";
import { useUpdateEmployee } from "../model/use-employee-actions";

interface AssignRoleDropdownProps {
	employeeId: number;
	currentRole: string;
	disabled?: boolean;
	className?: string;
}

export function AssignRoleDropdown({ employeeId, currentRole, disabled = false, className }: AssignRoleDropdownProps) {
	const updateEmployee = useUpdateEmployee();
	const rolesQuery = useQuery({
		queryKey: employeeKeys.roles(),
		queryFn: employeeApi.getRoles,
		staleTime: 10 * 60 * 1000,
	});

	const roleOptions = useMemo(() => {
		const roles = rolesQuery.data ?? [];
		if (roles.length === 0) {
			return [...DEFAULT_EMPLOYEE_ROLE_OPTIONS];
		}

		return roles.map((role) => ({
			value: role.name,
			label: role.displayName || role.name,
		}));
	}, [rolesQuery.data]);

	const currentLabel = roleOptions.find((role) => role.value === currentRole)?.label ?? currentRole ?? "No role";

	const handleAssignRole = async (role: string) => {
		if (role === currentRole || updateEmployee.isPending) {
			return;
		}

		try {
			await updateEmployee.mutateAsync({ id: employeeId, payload: { role } });
			toast.success("Role updated");
		} catch {
			toast.error("Failed to update role");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={disabled || updateEmployee.isPending}
					className={cn("h-auto justify-start p-0", className)}
				>
					<Badge
						variant="outline"
						className="rounded-sm px-1.5 py-0 font-mono text-[11px] uppercase"
					>
						{currentLabel}
					</Badge>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuGroup>
					{roleOptions.map((role) => (
						<DropdownMenuItem
							key={role.value}
							disabled={role.value === currentRole}
							onClick={() => handleAssignRole(role.value)}
						>
							{role.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
