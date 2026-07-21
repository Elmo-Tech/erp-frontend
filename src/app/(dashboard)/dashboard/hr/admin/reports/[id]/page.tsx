import type { Metadata } from "next";
import EmployeeReportPage from "@/views/hr/admin/EmployeeReportPage";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";

interface PageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { id } = await params;
	return { title: `Employee Report #${id} | HR Admin` };
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	return (
		<ProtectedDashboardRoute requiredPermission={["manage_employees", "view_employee_performance"]}>
			<EmployeeReportPage userId={Number(id)} />
		</ProtectedDashboardRoute>
	);
}
