"use client";

import { AttendanceDashboard } from "./AttendanceDashboard";
import { AttendanceHistoryTable } from "./AttendanceHistoryTable";
import { Clock } from "lucide-react";

export function MyAttendanceWrapper() {
	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Clock className="h-6 w-6" />
					My Attendance
				</h1>
				<p className="text-muted-foreground">Track your daily attendance and work hours</p>
			</div>

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
