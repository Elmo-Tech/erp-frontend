"use client";

import { useState } from "react";
import { Clock, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { DatePicker } from "@/components/shared/forms/DatePicker";
import { useAttendanceList } from "../hooks/useAttendance";
import { usePermissions } from "../hooks/usePermissions";
import { AttendanceFilters, Attendance } from "../types/attendance";
import { AttendanceFormDialog } from "./AttendanceFormDialog";
import { getAttendanceColumns } from "./columns/attendanceColumns";
import { useEmployees } from "@/features/hr/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmployeeShortPermissionsPanel } from "@/features/hr/components/EmployeeShortPermissionsDialog";
import { useAuthStore } from "@/store/authStore";
import { ShortPermissionPendingQueue } from "@/features/hr/components/ShortPermissionPendingQueue";
import type { PendingEmployeeShortPermission, PermissionCompensationType } from "@/features/hr/types/short-permissions";

export function AttendanceManagement() {
	const [filters, setFilters] = useState<AttendanceFilters>({});
	const [page, setPage] = useState(1);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
	const [permissionsOpen, setPermissionsOpen] = useState(false);
	const [permissionEmployeeId, setPermissionEmployeeId] = useState(0);
	const [permissionMonth, setPermissionMonth] = useState<string | undefined>();
	const currentUser = useAuthStore((state) => state.user);
	const [reviewRequest, setReviewRequest] = useState<{ permission: PendingEmployeeShortPermission; compensationType?: PermissionCompensationType; revision: number } | undefined>();

	const { data, isLoading, error } = useAttendanceList(filters, page);
	const { data: employeesData } = useEmployees({ perPage: 100 });
	const { canManageAttendance, canViewAllAttendance, hasAnyPermission } = usePermissions();
	const canReviewPermissions = hasAnyPermission(["manage_permissions", "manage_employees"]);
	const permissionEmployee = employeesData?.employees.find((employee) => employee.userId === permissionEmployeeId)
		?? (currentUser?.userId === permissionEmployeeId ? currentUser : undefined)
		?? (reviewRequest?.permission.employeeId === permissionEmployeeId ? reviewRequest.permission.employee : undefined);

	const handleUserFilterChange = (value: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			userId: value ? parseInt(value) : undefined,
		}));
		setPage(1);
	};

	const handleStartDateChange = (value: string) => {
		setFilters((prev) => ({
			...prev,
			startDate: value || undefined,
		}));
		setPage(1);
	};

	const handleEndDateChange = (value: string) => {
		setFilters((prev) => ({
			...prev,
			endDate: value || undefined,
		}));
		setPage(1);
	};

	const handleEdit = (attendance: Attendance) => {
		setEditingAttendance(attendance);
		setDialogOpen(true);
	};

	const handleAdd = () => {
		setEditingAttendance(null);
		setDialogOpen(true);
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
		setEditingAttendance(null);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	// User options for filter
	const userOptions =
		employeesData?.employees?.map((employee) => ({
			value: employee.userId.toString(),
			label: employee.name,
		})) || [];

	// Get columns
	const columns = getAttendanceColumns({
		onEdit: handleEdit,
		canManage: canManageAttendance,
		onReviewPermissions: canReviewPermissions ? (attendance) => {
			setReviewRequest(undefined);
			setPermissionEmployeeId(attendance.userId);
			setPermissionMonth(attendance.date.slice(0, 7));
			setPermissionsOpen(true);
		} : undefined,
	});

	if (!canViewAllAttendance) {
		return (
			<DataTable
				title="Attendance Management"
				columns={[]}
				data={[]}
				keyExtractor={() => "empty"}
				emptyState={{
					icon: Clock,
					title: "Access Denied",
					description: "You don't have permission to view attendance records",
				}}
			/>
		);
	}

	return (
		<>
			<DataTable
				title="Attendance Management"
				titleBadge={data?.pagination ? `${data.pagination.total} records` : undefined}
				columns={columns}
				data={data?.attendances || []}
				keyExtractor={(attendance) => attendance.attendanceId}
				isLoading={isLoading}
				error={error}
				pagination={data?.pagination}
				onPageChange={handlePageChange}
				emptyState={{
					icon: Clock,
					title: "No attendance records",
					description: "No attendance records found for the selected filters.",
				}}
				headerActions={
					<FilterBar
						actions={
							<div className="flex gap-2">
							{canReviewPermissions && <Button variant="outline" onClick={() => {
								setReviewRequest(undefined);
								setPermissionEmployeeId(filters.userId ?? 0);
								setPermissionMonth(undefined);
								setPermissionsOpen(true);
							}}>Review short permissions</Button>}
							{canManageAttendance && (
								<Button onClick={handleAdd}>
									<Plus className="h-4 w-4 mr-2" />
									Add Record
								</Button>
							)}
							</div>
						}
					>
						<FilterSelect
							value={filters.userId?.toString()}
							onChange={handleUserFilterChange}
							options={userOptions}
							placeholder="Employee"
							allLabel="All Employees"
							icon={User}
							className="w-48"
						/>
						<DatePicker
							value={filters.startDate}
							onChange={handleStartDateChange}
							placeholder="From Date"
							className="w-fit!"
						/>
						<DatePicker
							value={filters.endDate}
							onChange={handleEndDateChange}
							placeholder="To Date"
							className="w-fit!"
						/>
					</FilterBar>
				}
			/>

			{canManageAttendance && (
				<AttendanceFormDialog
					open={dialogOpen}
					onClose={handleDialogClose}
					attendance={editingAttendance}
				/>
			)}
			{canReviewPermissions && <Dialog open={permissionsOpen} onOpenChange={setPermissionsOpen}>
				<DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
					<DialogHeader><DialogTitle>Review short permissions</DialogTitle><DialogDescription>Select an employee to submit or approve paid and unpaid short permissions.</DialogDescription></DialogHeader>
					<ShortPermissionPendingQueue isActive={permissionsOpen} onReview={(permission, compensationType) => {
						setPermissionEmployeeId(permission.employeeId);
						setPermissionMonth(permission.permissionDate.slice(0, 7));
						setReviewRequest((previous) => ({ permission, compensationType, revision: (previous?.revision ?? 0) + 1 }));
					}} onView={(permission) => {
						setPermissionEmployeeId(permission.employeeId);
						setPermissionMonth(permission.permissionDate.slice(0, 7));
						setReviewRequest(undefined);
					}} />
					<Label htmlFor="permission-employee">Employee</Label>
					<select id="permission-employee" className="rounded-md border p-2" value={permissionEmployeeId} onChange={(event) => { setReviewRequest(undefined); setPermissionMonth(undefined); setPermissionEmployeeId(Number(event.target.value)); }}>
						<option value={0}>Select an employee</option>
						{employeesData?.employees.map((employee) => <option key={employee.userId} value={employee.userId}>{employee.name}</option>)}
						{currentUser && !employeesData?.employees.some((employee) => employee.userId === currentUser.userId) && <option value={currentUser.userId}>{currentUser.name}</option>}
						{permissionEmployee && permissionEmployee.userId !== currentUser?.userId && !employeesData?.employees.some((employee) => employee.userId === permissionEmployee.userId) && <option value={permissionEmployee.userId}>{permissionEmployee.name}</option>}
					</select>
					{permissionEmployee && <EmployeeShortPermissionsPanel key={`${permissionEmployeeId}-${permissionMonth}-${reviewRequest?.revision}`} employeeId={permissionEmployeeId} employeeName={permissionEmployee.name} canManage isActive={permissionsOpen} initialMonth={permissionMonth} initialReview={reviewRequest} />}
				</DialogContent>
			</Dialog>}
		</>
	);
}
