import TeamTimelinePage from "@/views/projects/TeamTimelinePage";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";

export default function ProjectTimelineRoute() {
	return (
		<ProtectedDashboardRoute requiredPermission="view_project_timeline">
			<TeamTimelinePage />
		</ProtectedDashboardRoute>
	);
}
