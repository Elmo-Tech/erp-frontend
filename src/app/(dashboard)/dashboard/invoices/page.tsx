import { redirect } from "next/navigation";
import { getDisabledRouteRedirect } from "@/config/simplification";

export default function InvoicesPage() {
	redirect(getDisabledRouteRedirect("/dashboard/invoices"));
}
