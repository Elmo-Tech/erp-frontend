"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users } from "lucide-react";
import { useEmployees, useDeactivateEmployee, useActivateEmployee } from "../../hooks";
import { EmployeeCard } from "../EmployeeCard";
import { EmployeePerformanceDialog } from "../EmployeePerformanceDialog";
import { CreateEmployeeForm, UpdateEmployeeForm } from "../employees";
import type { Employee } from "../../types";
import { useRoles } from "@/features/admin/hooks/useRoles";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoleLabel } from "@/config/simplification";

export function EmployeesWrapper() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showUpdateDialog, setShowUpdateDialog] = useState(false);
	const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

	const { data, isLoading } = useEmployees({
		search: search || undefined,
		isActive: statusFilter === "all" ? undefined : statusFilter === "active",
	});

	const { data: rolesData } = useRoles();
	const deactivateEmployee = useDeactivateEmployee();
	const activateEmployee = useActivateEmployee();

	const roleOptions = rolesData?.roles?.map((role) => ({ value: role.name, label: getRoleLabel(role.name) })) || [];

	const handleEdit = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowUpdateDialog(true);
	};

	const handleViewPerformance = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowPerformanceDialog(true);
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

	const handleUpdateClose = () => {
		setShowUpdateDialog(false);
		setSelectedEmployee(null);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Users className="h-6 w-6" />
						Employees
					</h1>
					<p className="text-muted-foreground">Manage your team members</p>
				</div>
				<Button onClick={() => setShowCreateDialog(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Add Employee
				</Button>
			</div>

			<div className="flex gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
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
					<SelectTrigger className="w-[150px]">
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
			) : data?.employees && data.employees.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{data.employees.map((employee) => (
						<EmployeeCard
							key={employee.userId}
							employee={employee}
							onEdit={handleEdit}
							onToggleStatus={handleToggleStatus}
							onViewPerformance={handleViewPerformance}
							showSalary
						/>
					))}
				</div>
			) : (
				<div className="text-center py-12 text-muted-foreground">
					<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
					<p>No employees found</p>
					<Button
						variant="outline"
						className="mt-4"
						onClick={() => setShowCreateDialog(true)}
					>
						Add your first employee
					</Button>
				</div>
			)}

			<CreateEmployeeForm
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				roles={roleOptions}
			/>

			{selectedEmployee && (
				<UpdateEmployeeForm
					open={showUpdateDialog}
					onOpenChange={handleUpdateClose}
					employee={selectedEmployee}
					roles={roleOptions}
				/>
			)}

			<EmployeePerformanceDialog
				open={showPerformanceDialog}
				onOpenChange={setShowPerformanceDialog}
				employee={selectedEmployee}
			/>
		</div>
	);
}
