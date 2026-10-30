"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users } from "lucide-react";
import { useEmployees, useDeactivateEmployee, useActivateEmployee, useDeleteEmployee } from "../../hooks";
import { EmployeeCard } from "../EmployeeCard";
import { CreateEmployeeForm, UpdateEmployeeForm } from "../employees";
import type { Employee } from "../../types";
import { useRoles } from "@/features/admin/hooks/useRoles";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { getRoleLabel } from "@/config/simplification";
import { useAuthStore } from "@/store/authStore";
import { notifyApiError } from "@/lib/errorHandling";

export function EmployeesWrapper() {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showUpdateDialog, setShowUpdateDialog] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

	const { data, isLoading, isError, refetch } = useEmployees({
		search: search || undefined,
		isActive: statusFilter === "all" ? undefined : statusFilter === "active",
	});

	const { data: rolesData } = useRoles();
	const canManageProtectedUsers = useAuthStore((state) => state.hasPermission("manage_protected_users"));
	const canCreateEmployees = useAuthStore((state) => state.hasPermission("manage_employees") || state.hasPermission("create_employees"));
	const canEditEmployees = useAuthStore((state) => state.hasPermission("manage_employees") || state.hasPermission("edit_employees"));
	const canDeleteEmployees = useAuthStore((state) => state.hasPermission("manage_employees") || state.hasPermission("delete_employees"));
	const canToggleEmployees = useAuthStore((state) => state.hasPermission("manage_employees") || state.hasPermission("toggle_employee_status"));
	const deactivateEmployee = useDeactivateEmployee();
	const activateEmployee = useActivateEmployee();
	const deleteEmployee = useDeleteEmployee();
	const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

	const roleOptions =
		rolesData?.roles
			?.filter((role) => role.name !== "super-admin" || canManageProtectedUsers)
			.map((role) => ({ value: role.name, label: getRoleLabel(role.name) })) || [];

	const handleEdit = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowUpdateDialog(true);
	};

	const handleOpenEmployeeDetails = (employee: Employee) => {
		router.push(`/dashboard/employees/${employee.userId}`);
	};

	const handleToggleStatus = async (employee: Employee) => {
		try {
			if (employee.isActive) {
				await deactivateEmployee.mutateAsync(employee.userId);
			} else {
				await activateEmployee.mutateAsync(employee.userId);
			}
			// Success toast comes from the backend message via the axios interceptor.
		} catch (error) {
			notifyApiError(error);
		}
	};

	const handleDelete = async () => {
		if (!employeeToDelete) return;

		try {
			await deleteEmployee.mutateAsync(employeeToDelete.userId);
			// Success toast comes from the backend message via the axios interceptor.
			setEmployeeToDelete(null);
		} catch (error) {
			notifyApiError(error);
		}
	};

	const handleUpdateClose = () => {
		setShowUpdateDialog(false);
		setSelectedEmployee(null);
	};

	return (
		<div className="space-y-6">
			<PageHeader title="Employees" description="Find your teammates and their information in one place." icon={Users}
				actions={canCreateEmployees && <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4" />Add Employee</Button>}
			/>

			<div className="flex flex-wrap gap-3">
				<div className="relative min-w-[min(100%,14rem)] flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						aria-label="Search employees"
						placeholder="Search employees..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select
					value={statusFilter}
					onValueChange={setStatusFilter}
				>
					<SelectTrigger aria-label="Employee status" className="w-[150px]">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="inactive">Inactive</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{isLoading ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<Skeleton
							key={i}
							className="h-64"
						/>
					))}
				</div>
			) : isError ? (
				<div role="alert" className="rounded-2xl border bg-card p-8 text-center">
					<p className="font-medium">Could not load employees</p>
					<p className="mt-1 text-sm text-muted-foreground">Please try again.</p>
					<Button variant="outline" className="mt-4" onClick={() => void refetch()}>Retry</Button>
				</div>
			) : data?.employees && data.employees.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{data.employees.map((employee) => (
						<EmployeeCard
							key={employee.userId}
							employee={employee}
							onOpen={handleOpenEmployeeDetails}
							onEdit={canEditEmployees ? handleEdit : undefined}
							onToggleStatus={canToggleEmployees ? handleToggleStatus : undefined}
							onDelete={canDeleteEmployees ? setEmployeeToDelete : undefined}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-12 text-muted-foreground">
					<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
					<p>{search || statusFilter !== "all" ? "No employees match your filters" : "No employees found"}</p>
					{(search || statusFilter !== "all") && <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setStatusFilter("all"); }}>Clear filters</Button>}
					{canCreateEmployees && !search && statusFilter === "all" && (
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => setShowCreateDialog(true)}
						>
							Add your first employee
						</Button>
					)}
				</div>
			)}

			{canCreateEmployees && (
				<CreateEmployeeForm
					open={showCreateDialog}
					onOpenChange={setShowCreateDialog}
					roles={roleOptions}
				/>
			)}

			{selectedEmployee && canEditEmployees && (
				<UpdateEmployeeForm
					open={showUpdateDialog}
					onOpenChange={handleUpdateClose}
					employee={selectedEmployee}
					roles={roleOptions}
				/>
			)}

			<ConfirmDialog
				open={employeeToDelete !== null}
				onOpenChange={(open) => { if (!open) setEmployeeToDelete(null); }}
				title="Delete Employee"
				description={`Are you sure you want to delete ${employeeToDelete?.name}? History is kept (soft delete) and the employee can no longer sign in.`}
				confirmLabel="Delete"
				onConfirm={() => void handleDelete()}
				variant="destructive"
				isLoading={deleteEmployee.isPending}
			/>

		</div>
	);
}
