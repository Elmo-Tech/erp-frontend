"use client";

import { MainDashboardWidget } from "@/widgets/dashboard-management/ui/MainDashboardWidget";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";

export default function AdminDashboardPage() {
	return (
		<ProtectedDashboardRoute requiredPermission="view_global_stats">
			<MainDashboardWidget scope="admin" />
		</ProtectedDashboardRoute>
	);
}
