import type { Metadata } from "next";
import PayrollTransactionsPage from "@/views/hr/admin/PayrollTransactionsPage";

export const metadata: Metadata = {
	title: "Manual Transactions | HR Admin",
};

export default function Page() {
	return <PayrollTransactionsPage />;
}
