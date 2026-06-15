import MyTasksPage from "@/views/dashboard/MyTasksPage";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";

export default function MyTasksRoute() {
	return (
		<ProtectedDashboardRoute requiredPermission="view_personal_tasks">
			<MyTasksPage />
		</ProtectedDashboardRoute>
	);
}
