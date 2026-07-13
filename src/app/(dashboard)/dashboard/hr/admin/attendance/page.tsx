import type { Metadata } from "next";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";
import { AttendanceManagementWidget } from "@/widgets/hr-management/ui/AttendanceManagementWidget";

export const metadata: Metadata = {
	title: "Attendance Management | HR Admin",
};

export default function Page() {
	return (
		<ProtectedDashboardRoute requiredPermission="manage_attendance">
			<AttendanceManagementWidget />
		</ProtectedDashboardRoute>
	);
}
