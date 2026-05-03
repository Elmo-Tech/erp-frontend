import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";
import { LeadDetailsView } from "@/views/leads/LeadDetailsView";

interface LeadDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
	const { id } = await params;
	const leadId = Number(id);

	return (
		<ProtectedDashboardRoute requiredPermission="view_leads">
			<LeadDetailsView leadId={leadId} />
		</ProtectedDashboardRoute>
	);
}
