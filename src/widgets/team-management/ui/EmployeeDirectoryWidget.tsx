"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Plus, UserCheck, UserRoundX, Users } from "lucide-react";
import { toast } from "sonner";
import { employeeApi } from "@/entities/employee/api/employee.api";
import { employeeKeys } from "@/entities/employee/model/query-keys";
import type { Employee, EmployeeFilters } from "@/entities/employee/model/types";
import { EmployeeCard } from "@/entities/employee/ui/EmployeeCard";
import { useEmployeePermissions } from "@/entities/user/model/permissions";
import { useActivateEmployee, useDeactivateEmployee } from "@/features/employees/model/use-employee-actions";
import { AssignRoleDropdown } from "@/features/employees/ui/AssignRoleDropdown";
import { CreateEmployeeForm } from "@/features/employees/ui/CreateEmployeeForm";
import { Button } from "@/shared/ui/button";
import { Pagination } from "@/shared/ui/data-display/Pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface EmployeeDirectoryWidgetProps {
	className?: string;
}

const DEFAULT_PER_PAGE = 15;
const STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];

export function EmployeeDirectoryWidget({ className }: EmployeeDirectoryWidgetProps) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string | undefined>();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const { canManageUsers, canViewUsers, canCreateUsers, canEditUsers } = useEmployeePermissions();
	const activateEmployee = useActivateEmployee();
	const deactivateEmployee = useDeactivateEmployee();
	const canView = canManageUsers || canViewUsers;
	const canCreate = canManageUsers || canCreateUsers;
	const canEdit = canManageUsers || canEditUsers;

	const filters = useMemo<EmployeeFilters>(
		() => ({
			search: search.trim() || undefined,
			isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
			page,
			perPage: DEFAULT_PER_PAGE,
		}),
		[page, search, statusFilter]
	);

	const employeesQuery = useQuery({
		queryKey: employeeKeys.list(filters),
		queryFn: () => employeeApi.getEmployees(filters),
		enabled: canView,
		staleTime: 5 * 60 * 1000,
	});

	const employees = useMemo(() => employeesQuery.data?.employees ?? [], [employeesQuery.data?.employees]);
	const pagination = employeesQuery.data?.pagination;

	const handleSearchChange = (value: string) => {
		setPage(1);
		setSearch(value);
	};

	const handleStatusChange = (value: string | undefined) => {
		setPage(1);
		setStatusFilter(value);
	};

	const handleToggleStatus = async (employee: Employee) => {
		try {
			if (employee.isActive) {
				await deactivateEmployee.mutateAsync(employee.userId);
				toast.success("Employee deactivated");
			} else {
				await activateEmployee.mutateAsync(employee.userId);
				toast.success("Employee activated");
			}
		} catch {
			toast.error("Failed to update employee status");
		}
	};

	if (!canView) {
		return (
			<section className={cn("flex min-h-48 flex-col items-center justify-center rounded-md border px-4 text-center", className)}>
				<div className="text-sm font-medium">Employees are restricted</div>
				<div className="text-sm text-muted-foreground">Your account cannot view the employee directory.</div>
			</section>
		);
	}

	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
					<p className="text-sm text-muted-foreground">{pagination ? `${pagination.total} team members` : "Manage team members, roles, and workspace access."}</p>
				</div>

				{canCreate && (
					<Button
						size="sm"
						onClick={() => setCreateDialogOpen(true)}
					>
						<Plus data-icon="inline-start" />
						New employee
					</Button>
				)}
			</div>

			<div className="flex flex-col gap-3 border-y py-3 md:flex-row md:items-center md:justify-between">
				<SearchInput
					value={search}
					onChange={handleSearchChange}
					placeholder="Search employees"
					className="w-full md:max-w-sm"
				/>
				<div className="flex flex-col gap-2 md:flex-row md:items-center">
					<FilterSelect
						value={statusFilter}
						onChange={handleStatusChange}
						options={STATUS_OPTIONS}
						placeholder="Status"
						allLabel="All employees"
						className="w-full md:w-44"
					/>
					<p className="text-xs tabular-nums text-muted-foreground md:min-w-24 md:text-right">{pagination ? `${pagination.total} records` : "Loading"}</p>
				</div>
			</div>

			<div className="overflow-hidden rounded-md border bg-background">
				<div className="hidden border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(180px,1.4fr)_minmax(120px,0.8fr)_minmax(130px,0.9fr)_90px_100px_120px_40px] md:items-center md:gap-3">
					<span>Employee</span>
					<span>Role</span>
					<span>Schedule</span>
					<span>Status</span>
					<span>Points</span>
					<span>Compensation</span>
					<span className="sr-only">Actions</span>
				</div>

				{employeesQuery.isLoading ? (
					<EmployeeRowsSkeleton />
				) : employeesQuery.error ? (
					<div className="flex min-h-40 flex-col items-center justify-center gap-1 px-4 text-center">
						<div className="text-sm font-medium">Unable to load employees</div>
						<div className="text-sm text-muted-foreground">{employeesQuery.error.message}</div>
					</div>
				) : employees.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
						<Users className="size-6 text-muted-foreground" />
						<div className="flex flex-col gap-1">
							<div className="text-sm font-medium">No employees found</div>
							<div className="text-sm text-muted-foreground">Create an employee or adjust your filters.</div>
						</div>
						{canCreate && (
							<Button
								size="sm"
								variant="outline"
								onClick={() => setCreateDialogOpen(true)}
							>
								<Plus data-icon="inline-start" />
								New employee
							</Button>
						)}
					</div>
				) : (
					employees.map((employee) => (
						<EmployeeCard
							key={employee.userId}
							employee={employee}
							showCompensation
							roleControl={
								canEdit ? (
									<AssignRoleDropdown
										employeeId={employee.userId}
										currentRole={employee.role}
									/>
								) : undefined
							}
							actions={
								canEdit ? (
									<EmployeeActionsMenu
										employee={employee}
										onToggleStatus={handleToggleStatus}
									/>
								) : undefined
							}
						/>
					))
				)}
			</div>

			{pagination && pagination.totalPages > 1 && (
				<Pagination
					pagination={pagination}
					onPageChange={setPage}
				/>
			)}

			<CreateEmployeeForm
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>
		</section>
	);
}

function EmployeeActionsMenu({ employee, onToggleStatus }: { employee: Employee; onToggleStatus: (employee: Employee) => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={`Open actions for ${employee.name}`}
				>
					<MoreHorizontal />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => onToggleStatus(employee)}>
						{employee.isActive ? <UserRoundX data-icon="inline-start" /> : <UserCheck data-icon="inline-start" />}
						{employee.isActive ? "Deactivate" : "Activate"}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function EmployeeRowsSkeleton() {
	return (
		<div className="flex flex-col">
			{Array.from({ length: 8 }).map((_, index) => (
				<div
					key={index}
					className="grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 last:border-b-0 md:grid-cols-[minmax(180px,1.4fr)_minmax(120px,0.8fr)_minmax(130px,0.9fr)_90px_100px_120px_40px] md:items-center md:gap-3"
				>
					<div className="flex items-center gap-3">
						<Skeleton className="size-8 rounded-full" />
						<div className="flex flex-col gap-1">
							<Skeleton className="h-4 w-36" />
							<Skeleton className="h-3 w-44" />
						</div>
					</div>
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-4 w-14" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="size-8" />
				</div>
			))}
		</div>
	);
}
