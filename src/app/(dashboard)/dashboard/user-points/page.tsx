import { redirect } from "next/navigation";
import { getDisabledRouteRedirect } from "@/config/simplification";

export default function UserPointsPage() {
	redirect(getDisabledRouteRedirect("/dashboard/user-points"));
}
