import type { Metadata } from "next";
import PayrollAdminPage from "@/views/hr/admin/PayrollAdminPage";

export const metadata: Metadata = {
	title: "Payroll Management | HR Admin",
};

export default function Page() {
	return <PayrollAdminPage />;
}
