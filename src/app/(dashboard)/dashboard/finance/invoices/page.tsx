import type { Metadata } from "next";
import InvoicesPage from "@/views/finance/InvoicesPage";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";

export const metadata: Metadata = { title: "Invoices | Finance" };

export default function Page() {
	return (
		<ProtectedDashboardRoute requiredPermission={["manage_invoices", "view_invoices", "create_invoices", "edit_invoices", "delete_invoices", "send_invoices", "cancel_invoices"]}>
			<InvoicesPage />
		</ProtectedDashboardRoute>
	);
}
