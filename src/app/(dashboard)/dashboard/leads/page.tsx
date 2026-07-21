"use client";

import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";
import LeadsPipelinePage from "@/views/leads/LeadsPipelinePage";

export default function LeadsPage() {
	return (
		<ProtectedDashboardRoute requiredPermission={["manage_leads", "view_leads", "create_leads", "edit_leads", "delete_leads", "convert_leads", "view_quotations", "create_quotations", "edit_quotations", "delete_quotations", "calculate_quotations", "manage_contracts", "view_contracts", "create_contracts", "edit_contracts", "delete_contracts", "sign_contracts"]}>
			<LeadsPipelinePage />
		</ProtectedDashboardRoute>
	);
}
