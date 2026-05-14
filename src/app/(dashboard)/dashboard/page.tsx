import MyWorkspacePage from "@/views/dashboard/MyWorkspacePage";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";

export default function DashboardPage() {
	return (
		<ProtectedDashboardRoute requiredPermission="view_my_workspace">
			<MyWorkspacePage />
		</ProtectedDashboardRoute>
	);
}
