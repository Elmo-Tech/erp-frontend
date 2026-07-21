import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";
import { LeadDetailsView } from "@/views/leads/LeadDetailsView";

interface LeadDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
	const { id } = await params;
	const leadId = Number(id);

	return (
		<ProtectedDashboardRoute requiredPermission={["manage_leads", "view_leads", "create_leads", "edit_leads", "delete_leads", "convert_leads", "view_quotations", "create_quotations", "edit_quotations", "delete_quotations", "calculate_quotations", "manage_contracts", "view_contracts", "create_contracts", "edit_contracts", "delete_contracts", "sign_contracts"]}>
			<LeadDetailsView leadId={leadId} />
		</ProtectedDashboardRoute>
	);
}
