"use client";

import { useState } from "react";
import { useAttendanceHistory, AttendanceHistoryRecord } from "../../hooks/useAttendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { Calendar, Clock, History } from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";

export function AttendanceHistoryTable() {
	const [page, setPage] = useState(1);
	const { data: historyData, isLoading } = useAttendanceHistory(page, 10);

	const formatDate = (dateString: string) => {
		const date = parseISO(dateString);
		if (isToday(date)) return "Today";
		if (isYesterday(date)) return "Yesterday";
		return format(date, "EEE, MMM d");
	};

	const formatTime = (timeString: string | null) => {
		if (!timeString) return "—";
		try {
			const date = new Date(timeString);
			return format(date, "hh:mm a");
		} catch {
			return timeString;
		}
	};

	const getStatusBadge = (record: AttendanceHistoryRecord) => {
		if (!record.clockIn) {
			return (
				<Badge
					variant="outline"
					className="text-gray-500"
				>
					Absent
				</Badge>
			);
		}
		if (!record.clockOut) {
			return (
				<Badge
					variant="default"
					className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
				>
					Active
				</Badge>
			);
		}
		if (record.lateMinutes > 0) {
			return (
				<Badge
					variant="outline"
					className="text-amber-600 border-amber-300"
				>
					Late {record.lateMinutes}m
				</Badge>
			);
		}
		return (
			<Badge
				variant="outline"
				className="text-green-600 border-green-300"
			>
				Complete
			</Badge>
		);
	};

	const columns = [
		{
			key: "date",
			header: "Date",
			render: (record: AttendanceHistoryRecord) => (
				<div className="flex items-center gap-2">
					<Calendar className="h-4 w-4 text-muted-foreground" />
					<span className={cn("font-medium", isToday(parseISO(record.date)) && "text-blue-600")}>{formatDate(record.date)}</span>
				</div>
			),
		},
		{
			key: "clockIn",
			header: "Clock In",
			render: (record: AttendanceHistoryRecord) => (
				<div className="flex items-center gap-1 text-sm">
					<Clock className="h-3 w-3 text-green-500" />
					{formatTime(record.clockIn)}
				</div>
			),
		},
		{
			key: "clockOut",
			header: "Clock Out",
			render: (record: AttendanceHistoryRecord) => (
				<div className="flex items-center gap-1 text-sm">
					<Clock className="h-3 w-3 text-red-500" />
					{formatTime(record.clockOut)}
				</div>
			),
		},
		{
			key: "workedDuration",
			header: "Worked",
			render: (record: AttendanceHistoryRecord) => <span className="text-sm font-medium text-green-600">{record.workedDuration || "0m"}</span>,
		},
		{
			key: "idleDuration",
			header: "Idle",
			render: (record: AttendanceHistoryRecord) => <span className="text-sm text-orange-500">{record.idleDuration || "0m"}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (record: AttendanceHistoryRecord) => getStatusBadge(record),
		},
	];

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<History className="h-4 w-4 text-muted-foreground" />
					Attendance History
				</CardTitle>
			</CardHeader>
			<CardContent>
				<DataTable
					columns={columns}
					data={historyData?.records || []}
					keyExtractor={(record) => record.attendanceId.toString()}
					isLoading={isLoading}
					pagination={
						historyData?.pagination
							? {
									total: historyData.pagination.total,
									count: historyData.records?.length || 0,
									currentPage: historyData.pagination.currentPage,
									perPage: historyData.pagination.perPage,
									totalPages: historyData.pagination.totalPages,
							  }
							: undefined
					}
					onPageChange={handlePageChange}
					emptyState={{
						icon: Calendar,
						title: "No attendance records",
						description: "Your attendance history will appear here once you start tracking.",
					}}
				/>
			</CardContent>
		</Card>
	);
}
