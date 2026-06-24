import { redirect } from "next/navigation";
import { getDisabledRouteRedirect } from "@/config/simplification";

export default function EmployeeReviewPageRoute() {
	redirect(getDisabledRouteRedirect("/dashboard/employee-review"));
}
