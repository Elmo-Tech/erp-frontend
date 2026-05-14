import type { Metadata } from "next";
import EmployeesHrPage from "@/views/hr/admin/EmployeesHrPage";

export const metadata: Metadata = {
	title: "Employee HR Profiles | HR Admin",
};

export default function Page() {
	return <EmployeesHrPage />;
}
