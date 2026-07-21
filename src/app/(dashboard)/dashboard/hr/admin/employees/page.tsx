import type { Metadata } from "next";
import EmployeesHrPage from "@/views/hr/admin/EmployeesHrPage";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";

export const metadata: Metadata = {
	title: "Employee HR Profiles | HR Admin",
};

export default function Page() {
	return (
		<ProtectedDashboardRoute requiredPermission={["manage_employees", "view_employees", "create_employees", "edit_employees", "delete_employees", "view_employee_salary", "view_employee_performance"]}>
			<EmployeesHrPage />
		</ProtectedDashboardRoute>
	);
}
