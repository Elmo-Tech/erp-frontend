import type { Metadata } from "next";
import MyPayslipsPage from "@/views/hr/employee/MyPayslipsPage";

export const metadata: Metadata = {
	title: "My Payslips",
};

export default function Page() {
	return <MyPayslipsPage />;
}
