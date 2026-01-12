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

export function AttendanceManagement() {
	const [filters, setFilters] = useState<AttendanceFilters>({});
	const [page, setPage] = useState(1);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);

	const { data, isLoading, error } = useAttendanceList(filters, page);
	const { data: employeesData } = useEmployees({ perPage: 100 });
	const { canManageAttendance, canViewAllAttendance } = usePermissions();

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
							canManageAttendance && (
								<Button onClick={handleAdd}>
									<Plus className="h-4 w-4 mr-2" />
									Add Record
								</Button>
							)
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
		</>
	);
}
