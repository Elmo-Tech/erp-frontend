export const hrActions: Record<string, string[]> = {
	employee_contracts: ["view", "create", "edit", "delete", "upload", "download"],
	leaves: ["view", "create", "edit", "approve", "reject", "cancel", "allocate"],
	permissions: ["view", "create", "edit", "approve", "reject", "cancel"],
	deductions: ["view", "create", "approve", "reject", "cancel", "evaluate", "reset", "override"],
	overtime: ["view", "create", "approve", "reject", "cancel"],
	employee_documents: ["view", "upload", "download", "delete"],
	employee_advances: ["view", "create", "approve", "reject", "disburse", "settle", "cancel"],
};
export const resourcePermissions = (resource: string) => [`manage_${resource}`, ...(hrActions[resource] ?? []).map((action) => `${action}_${resource}`)];
export const employeePermissions = ["manage_employees", "view_employees", "create_employees", "edit_employees", "delete_employees", "toggle_employee_status", "manage_employee_salary", "view_employee_salary", "manage_supervision", "view_employee_reports", "view_hr_overview", ...Object.keys(hrActions).flatMap(resourcePermissions)];

export const settingsPermissions = ["manage_lookup_options", "manage_tags", "manage_google_drive", "manage_hr_settings", "manage_leave_types", "manage_devices", ...["specializations", "task_categories", "project_types", "project_statuses", "task_statuses", "contract_durations"].flatMap((resource) => ["manage", "create", "edit", "delete", "reorder"].map((action) => `${action}_${resource}`))];

export function pagePermissions(pathname: string): string[] {
	if (pathname === "/dashboard") return ["view_dashboard"];
	if (pathname.startsWith("/dashboard/projects/trash")) return ["view_deleted_projects"];
	if (pathname.startsWith("/dashboard/projects")) return ["view_projects", "view_all_projects", "manage_projects"];
	if (pathname.startsWith("/dashboard/employees")) return employeePermissions;
	if (pathname.startsWith("/dashboard/settings")) return settingsPermissions;
	if (pathname.startsWith("/dashboard/clients")) return ["view_clients", "manage_clients"];
	if (pathname.startsWith("/dashboard/roles")) return ["manage_roles", "view_roles"];
	if (pathname.startsWith("/dashboard/admin/audit-logs")) return ["view_audit_logs"];
	if (pathname.startsWith("/dashboard/admin/users") || pathname === "/dashboard/users") return ["manage_users", "view_users"];
	if (pathname.startsWith("/dashboard/integrations/google-drive")) return ["manage_google_drive", "manage_project_files"];
	if (pathname.startsWith("/dashboard/admin")) return ["view_admin_stats"];
	if (pathname.startsWith("/dashboard/attendance")) return ["view_all_attendance", "manage_attendance"];
	if (pathname.startsWith("/dashboard/my-attendance")) return ["view_attendance"];
	if (pathname.startsWith("/dashboard/my-requests")) return ["view_my_requests", "view_attendance"];
	if (pathname.startsWith("/dashboard/my-tasks")) return ["view_tasks", "manage_tasks"];
	if (pathname.startsWith("/dashboard/wiki")) return ["view_wiki", "manage_wiki"];
	return [];
}
