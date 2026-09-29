"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users } from "lucide-react";
import { useEmployees, useDeactivateEmployee, useActivateEmployee } from "../../hooks";
import { EmployeeCard } from "../EmployeeCard";
import { EmployeeContractsDialog } from "../EmployeeContractsDialog";
import { EmployeeLeavesDialog } from "../EmployeeLeavesDialog";
import { EmployeeShortPermissionsDialog } from "../EmployeeShortPermissionsDialog";
import { EmployeeOvertimeRequestsDialog } from "../EmployeeOvertimeRequestsDialog";
import { EmployeeDirectDeductionsDialog } from "../EmployeeDirectDeductionsDialog";
import { EmployeeAdvancesDialog } from "../EmployeeAdvancesDialog";
import { EmployeePartialPaysDialog } from "../EmployeePartialPaysDialog";
import { EmployeeLateDeductionsDialog } from "../EmployeeLateDeductionsDialog";
import { EmployeeDocumentsDialog } from "../EmployeeDocumentsDialog";
import { CreateEmployeeForm, UpdateEmployeeForm } from "../employees";
import type { Employee } from "../../types";
import { useRoles } from "@/features/admin/hooks/useRoles";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoleLabel } from "@/config/simplification";
import { useAuthStore } from "@/store/authStore";

export function EmployeesWrapper() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showUpdateDialog, setShowUpdateDialog] = useState(false);
	const [showContractsDialog, setShowContractsDialog] = useState(false);
	const [showLeavesDialog, setShowLeavesDialog] = useState(false);
	const [showShortPermissionsDialog, setShowShortPermissionsDialog] = useState(false);
	const [showOvertimeRequestsDialog, setShowOvertimeRequestsDialog] = useState(false);
	const [showDirectDeductionsDialog, setShowDirectDeductionsDialog] = useState(false);
	const [showAdvancesDialog, setShowAdvancesDialog] = useState(false);
	const [showPartialPaysDialog, setShowPartialPaysDialog] = useState(false);
	const [showLateDeductionsDialog, setShowLateDeductionsDialog] = useState(false);
	const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

	const { data, isLoading } = useEmployees({
		search: search || undefined,
		isActive: statusFilter === "all" ? undefined : statusFilter === "active",
	});

	const { data: rolesData } = useRoles();
	const canManageProtectedUsers = useAuthStore((state) => state.hasPermission("manage_protected_users"));
	const canManageEmployees = useAuthStore((state) => state.hasPermission("manage_employees"));
	const deactivateEmployee = useDeactivateEmployee();
	const activateEmployee = useActivateEmployee();

	const roleOptions =
		rolesData?.roles
			?.filter((role) => role.name !== "super-admin" || canManageProtectedUsers)
			.map((role) => ({ value: role.name, label: getRoleLabel(role.name) })) || [];

	const handleEdit = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowUpdateDialog(true);
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

	const handleManageContracts = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowContractsDialog(true);
	};

	const handleManageLeaves = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowLeavesDialog(true);
	};

	const handleManageShortPermissions = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowShortPermissionsDialog(true);
	};

	const handleManageOvertimeRequests = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowOvertimeRequestsDialog(true);
	};

	const handleManageDirectDeductions = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowDirectDeductionsDialog(true);
	};

	const handleManageAdvances = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowAdvancesDialog(true);
	};

	const handleManagePartialPays = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowPartialPaysDialog(true);
	};

	const handleManageLateDeductions = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowLateDeductionsDialog(true);
	};

	const handleManageDocuments = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowDocumentsDialog(true);
	};

	const handleUpdateClose = () => {
		setShowUpdateDialog(false);
		setSelectedEmployee(null);
	};

	const handleContractsClose = (isOpen: boolean) => {
		setShowContractsDialog(isOpen);
		if (!isOpen) setSelectedEmployee(null);
	};

	const handleLeavesClose = (isOpen: boolean) => {
		setShowLeavesDialog(isOpen);
		if (!isOpen) setSelectedEmployee(null);
	};

	const handleShortPermissionsClose = (isOpen: boolean) => {
		setShowShortPermissionsDialog(isOpen);
		if (!isOpen) setSelectedEmployee(null);
	};

	const handleOvertimeRequestsClose = (isOpen: boolean) => {
		setShowOvertimeRequestsDialog(isOpen);
		if (!isOpen) setSelectedEmployee(null);
	};

	const handleDirectDeductionsClose = (isOpen: boolean) => {
		setShowDirectDeductionsDialog(isOpen);
		if (!isOpen) setSelectedEmployee(null);
	};

	const handleAdvancesClose = (isOpen: boolean) => {
		setShowAdvancesDialog(isOpen);
		if (!isOpen) setSelectedEmployee(null);
	};

	const handlePartialPaysClose = (isOpen: boolean) => {
		setShowPartialPaysDialog(isOpen);
		if (!isOpen) setSelectedEmployee(null);
	};

	const handleLateDeductionsClose = (isOpen: boolean) => {
		setShowLateDeductionsDialog(isOpen);
		if (!isOpen) setSelectedEmployee(null);
	};

	const handleDocumentsClose = (isOpen: boolean) => {
		setShowDocumentsDialog(isOpen);
		if (!isOpen) setSelectedEmployee(null);
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
				{canManageEmployees && (
					<Button onClick={() => setShowCreateDialog(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Employee
					</Button>
				)}
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
							onEdit={canManageEmployees ? handleEdit : undefined}
							onToggleStatus={canManageEmployees ? handleToggleStatus : undefined}
							onManageContracts={canManageEmployees ? handleManageContracts : undefined}
							onManageLeaves={canManageEmployees ? handleManageLeaves : undefined}
							onManageShortPermissions={canManageEmployees ? handleManageShortPermissions : undefined}
							onManageOvertimeRequests={canManageEmployees ? handleManageOvertimeRequests : undefined}
							onManageDirectDeductions={canManageEmployees ? handleManageDirectDeductions : undefined}
							onManageAdvances={canManageEmployees ? handleManageAdvances : undefined}
							onManagePartialPays={canManageEmployees ? handleManagePartialPays : undefined}
							onManageLateDeductions={canManageEmployees ? handleManageLateDeductions : undefined}
							onManageDocuments={canManageEmployees ? handleManageDocuments : undefined}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-12 text-muted-foreground">
					<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
					<p>No employees found</p>
					{canManageEmployees && (
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

			{canManageEmployees && (
				<CreateEmployeeForm
					open={showCreateDialog}
					onOpenChange={setShowCreateDialog}
					roles={roleOptions}
				/>
			)}

			{selectedEmployee && canManageEmployees && (
				<UpdateEmployeeForm
					open={showUpdateDialog}
					onOpenChange={handleUpdateClose}
					employee={selectedEmployee}
					roles={roleOptions}
				/>
			)}

			{selectedEmployee && canManageEmployees && (
				<EmployeeContractsDialog
					employeeId={selectedEmployee.userId}
					employeeName={selectedEmployee.name}
					open={showContractsDialog}
					onOpenChange={handleContractsClose}
					canManage={canManageEmployees}
				/>
			)}

			{selectedEmployee && canManageEmployees && (
				<EmployeeLeavesDialog
					employeeId={selectedEmployee.userId}
					employeeName={selectedEmployee.name}
					open={showLeavesDialog}
					onOpenChange={handleLeavesClose}
					canManage={canManageEmployees}
				/>
			)}

			{selectedEmployee && canManageEmployees && (
				<EmployeeShortPermissionsDialog
					employeeId={selectedEmployee.userId}
					employeeName={selectedEmployee.name}
					open={showShortPermissionsDialog}
					onOpenChange={handleShortPermissionsClose}
					canManage={canManageEmployees}
				/>
			)}

			{selectedEmployee && canManageEmployees && (
				<EmployeeOvertimeRequestsDialog
					employeeId={selectedEmployee.userId}
					employeeName={selectedEmployee.name}
					open={showOvertimeRequestsDialog}
					onOpenChange={handleOvertimeRequestsClose}
					canManage={canManageEmployees}
				/>
			)}

			{selectedEmployee && canManageEmployees && (
				<EmployeeDirectDeductionsDialog
					employeeId={selectedEmployee.userId}
					employeeName={selectedEmployee.name}
					open={showDirectDeductionsDialog}
					onOpenChange={handleDirectDeductionsClose}
					canManage={canManageEmployees}
				/>
			)}

			{selectedEmployee && canManageEmployees && (
				<EmployeeAdvancesDialog
					employeeId={selectedEmployee.userId}
					employeeName={selectedEmployee.name}
					open={showAdvancesDialog}
					onOpenChange={handleAdvancesClose}
					canManage={canManageEmployees}
				/>
			)}

			{selectedEmployee && canManageEmployees && (
				<EmployeePartialPaysDialog
					employeeId={selectedEmployee.userId}
					employeeName={selectedEmployee.name}
					open={showPartialPaysDialog}
					onOpenChange={handlePartialPaysClose}
					canManage={canManageEmployees}
				/>
			)}

			{selectedEmployee && canManageEmployees && (
				<EmployeeLateDeductionsDialog
					employeeId={selectedEmployee.userId}
					employeeName={selectedEmployee.name}
					open={showLateDeductionsDialog}
					onOpenChange={handleLateDeductionsClose}
					canManage={canManageEmployees}
				/>
			)}

			{selectedEmployee && canManageEmployees && (
				<EmployeeDocumentsDialog
					employeeId={selectedEmployee.userId}
					employeeName={selectedEmployee.name}
					open={showDocumentsDialog}
					onOpenChange={handleDocumentsClose}
					canManage={canManageEmployees}
				/>
			)}
		</div>
	);
}
