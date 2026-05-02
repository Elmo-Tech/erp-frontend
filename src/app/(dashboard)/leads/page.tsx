"use client";

import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";
import LeadsPipelinePage from "@/views/leads/LeadsPipelinePage";

export default function LeadsPage() {
	return (
		<ProtectedDashboardRoute requiredPermission="view_leads">
			<LeadsPipelinePage />
		</ProtectedDashboardRoute>
	);
}
