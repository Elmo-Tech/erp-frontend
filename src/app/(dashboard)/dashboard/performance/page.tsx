import { redirect } from "next/navigation";
import { getDisabledRouteRedirect } from "@/config/simplification";

export default function PerformancePage() {
	redirect(getDisabledRouteRedirect("/dashboard/performance"));
}
