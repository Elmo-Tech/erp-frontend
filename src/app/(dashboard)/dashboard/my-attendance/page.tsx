"use client";

import { EmployeeAttendanceWidget } from "@/widgets/attendance/ui/EmployeeAttendanceWidget";

export default function MyAttendancePage() {
	return (
		<div className="mx-auto max-w-4xl space-y-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">My attendance</h1>
				<p className="text-sm text-muted-foreground">Today&apos;s status and recent attendance history.</p>
			</div>
			<EmployeeAttendanceWidget />
		</div>
	);
}
