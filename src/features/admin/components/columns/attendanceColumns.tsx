"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Column } from "@/components/shared/data-display/DataTable";
import { Attendance } from "../../types/attendance";
import { Edit } from "lucide-react";

interface AttendanceColumnsOptions {
	onEdit?: (attendance: Attendance) => void;
	canManage?: boolean;
}

function formatTime(dateString: string | null): string {
	if (!dateString) return "-";
	return format(new Date(dateString), "hh:mm a");
}

function formatMinutes(minutes: number): string {
	if (minutes === 0) return "-";
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours > 0) return `${hours}h ${mins}m`;
	return `${mins}m`;
}

export function getAttendanceColumns({ onEdit, canManage }: AttendanceColumnsOptions): Column<Attendance>[] {
	const columns: Column<Attendance>[] = [
		{
			key: "employee",
			header: "Employee",
			render: (attendance) => (
				<div className="flex items-center gap-2">
					<Avatar className="h-8 w-8">
						<AvatarImage src={attendance.user?.avatar} />
						<AvatarFallback>{attendance.user?.name?.charAt(0) || "?"}</AvatarFallback>
					</Avatar>
					<span className="font-medium">{attendance.user?.name}</span>
				</div>
			),
		},
		{
			key: "date",
			header: "Date",
			render: (attendance) => format(new Date(attendance.date), "yyyy/MM/dd"),
		},
		{
			key: "clockIn",
			header: "Clock In",
			render: (attendance) => formatTime(attendance.clockIn),
		},
		{
			key: "clockOut",
			header: "Clock Out",
			render: (attendance) => formatTime(attendance.clockOut),
		},
		{
			key: "late",
			header: "Late",
			render: (attendance) => {
				if (!attendance.isLate) {
					return <Badge variant="secondary">On Time</Badge>;
				}
				return (
					<div className="flex flex-col gap-1">
						<Badge variant="destructive">{formatMinutes(attendance.lateMinutes)}</Badge>
						{attendance.usedGraceDay && (
							<Badge
								variant="outline"
								className="text-xs"
							>
								Grace Day
							</Badge>
						)}
					</div>
				);
			},
		},
		{
			key: "worked",
			header: "Worked",
			render: (attendance) => formatMinutes(attendance.workedMinutes),
		},
		{
			key: "deduction",
			header: "Deduction",
			render: (attendance) => (attendance.deductionMinutes > 0 ? <Badge variant="destructive">{formatMinutes(attendance.deductionMinutes)}</Badge> : "-"),
		},
		{
			key: "status",
			header: "Status",
			render: (attendance) => (attendance.isClockedIn ? <Badge className="bg-green-500">Present</Badge> : <Badge variant="secondary">Left</Badge>),
		},
	];

	if (canManage && onEdit) {
		columns.push({
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (attendance) => (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onEdit(attendance)}
				>
					<Edit className="h-4 w-4" />
				</Button>
			),
		});
	}

	return columns;
}
