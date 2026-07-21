import type { Metadata } from "next";
import UsersPage from "@/views/settings/UsersPage";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";

export const metadata: Metadata = {
	title: "Users | Settings",
};

export default function Page() {
	return (
		<ProtectedDashboardRoute requiredPermission={["manage_users", "view_users", "create_users", "edit_users", "delete_users", "toggle_user_status", "assign_user_roles", "reset_user_credentials"]}>
			<UsersPage />
		</ProtectedDashboardRoute>
	);
}
