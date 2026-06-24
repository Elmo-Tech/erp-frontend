import { redirect } from "next/navigation";
import { getDisabledRouteRedirect } from "@/config/simplification";

export default function SalesManagerDashboardPage() {
	redirect(getDisabledRouteRedirect("/dashboard/sales/manager"));
}
