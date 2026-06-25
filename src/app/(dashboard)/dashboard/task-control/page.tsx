import TaskControlPage from "@/views/projects/TaskControlPage";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";

export default function TaskControlRoute() {
	return (
		<ProtectedDashboardRoute requiredPermission="view_task_control">
			<TaskControlPage />
		</ProtectedDashboardRoute>
	);
}
