"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Clock } from "lucide-react";
import { AttendanceManagement } from "@/features/admin/components";

export default function AdminAttendancePage() {
	return (
		<div className="space-y-6">
			<PageHeader title="Attendance Management" description="Review attendance records and team requests." icon={Clock} />
			<AttendanceManagement />
		</div>
	);
}
