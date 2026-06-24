import { redirect } from "next/navigation";
import { getDisabledRouteRedirect } from "@/config/simplification";

export default function ClientInvoicesPage() {
	redirect(getDisabledRouteRedirect("/client/invoices"));
}
