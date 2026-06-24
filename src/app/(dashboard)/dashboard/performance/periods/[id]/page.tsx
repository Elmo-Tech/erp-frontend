import { redirect } from "next/navigation";
import { getDisabledRouteRedirect } from "@/config/simplification";

export default function EvaluationPeriodDetailPage() {
	redirect(getDisabledRouteRedirect("/dashboard/performance/periods"));
}
