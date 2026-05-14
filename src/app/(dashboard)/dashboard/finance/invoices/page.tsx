import type { Metadata } from "next";
import InvoicesPage from "@/views/finance/InvoicesPage";

export const metadata: Metadata = { title: "Invoices | Finance" };

export default function Page() {
	return <InvoicesPage />;
}
