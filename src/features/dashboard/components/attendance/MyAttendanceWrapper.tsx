"use client";

import { AttendanceDashboard } from "./AttendanceDashboard";
import { AttendanceHistoryTable } from "./AttendanceHistoryTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Clock } from "lucide-react";

export function MyAttendanceWrapper() {
	return (
		<div className="space-y-6">
			<PageHeader title="My Attendance" description="Track your daily attendance and work hours." icon={Clock} />

			{/* Main Content - Widget + History Table */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Today's Attendance Widget */}
				<div className="lg:col-span-1">
					<AttendanceDashboard />
				</div>

				{/* Attendance History Table */}
				<div className="lg:col-span-2">
					<AttendanceHistoryTable />
				</div>
			</div>
		</div>
	);
}
