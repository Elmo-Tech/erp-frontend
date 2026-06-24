import { redirect } from "next/navigation";
import { getDisabledRouteRedirect } from "@/config/simplification";

export default function SalesPage() {
	redirect(getDisabledRouteRedirect("/dashboard/sales"));
}
