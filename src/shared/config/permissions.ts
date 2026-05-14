/**
 * SYSTEM_PERMISSIONS — Single source of truth for all permissions.
 *
 * This constant EXACTLY mirrors the backend permission catalogue in:
 *   erp-backend/database/seeders/RolesAndPermissionsSeeder.php
 *
 * CRITICAL: When adding/removing permissions, update BOTH files simultaneously.
 * The PermissionMatrix (Roles edit screen) dynamically maps over this array
 * so the Founder can toggle any of these checkboxes for any role.
 *
 * DO NOT hardcode permission strings elsewhere in the frontend. Import from
 * this file to ensure consistency.
 */

export const SYSTEM_PERMISSIONS = [
	// ── System & Users ───────────────────────────────────────────────────────
	"manage_settings",
	"manage_users",
	"manage_roles",
	"manage_dictionaries",

	// ── HR & Finance ─────────────────────────────────────────────────────────
	"manage_hr",
	"manage_payroll",
	"view_reports",
	"manage_invoices",
	"manage_subscriptions",

	// ── Sales & Clients ──────────────────────────────────────────────────────
	"manage_clients",
	"manage_leads",
	"manage_contracts",
	"schedule_meetings",

	// ── Projects (Global vs Local) ───────────────────────────────────────────
	"manage_all_projects", // Global Admin/PMO bypass
	"create_projects",

	// ── Tasks & Deliverables ─────────────────────────────────────────────────
	"manage_deliverables", // STRICTLY for users allowed to define deliverables

	// ── Dashboard ────────────────────────────────────────────────────────────
	"view_my_workspace",
	"view_global_stats",
	"view_dashboard",
	"view_dashboard_overview",
	"view_financial_stats",
	"view_project_timeline",
	"view_team_performance",
	"view_personal_tasks",
	"view_all_blockers",
	"view_escalated_blockers",
	"view_team_pulse",

	// ── User Management (granular) ───────────────────────────────────────────
	"view_users",
	"create_users",
	"edit_users",
	"delete_users",

	// ── Role & Permission Management (granular) ──────────────────────────────
	"view_roles",
	"create_roles",
	"edit_roles",
	"delete_roles",

	// ── Client Management (granular) ─────────────────────────────────────────
	"view_clients",
	"create_clients",
	"edit_clients",
	"delete_clients",

	// ── Project Management (granular) ────────────────────────────────────────
	"manage_projects",
	"view_projects",
	"view_all_projects",
	"view_assigned_projects",
	"edit_projects",
	"delete_projects",
	"approve_project_ui",
	"view_project_budget",
	"manage_project_settings",
	"manage_change_requests",
	"delete_change_requests",
	"delete_milestones",

	// ── Project Members ──────────────────────────────────────────────────────
	"manage_project_members",
	"view_project_members",
	"add_project_members",
	"remove_project_members",

	// ── Project Files ────────────────────────────────────────────────────────
	"manage_project_files",
	"view_project_files",
	"upload_project_files",
	"delete_project_files",
	"view_project_history",

	// ── Task Management (granular) ───────────────────────────────────────────
	"manage_tasks",
	"view_tasks",
	"create_tasks",
	"edit_tasks",
	"delete_tasks",
	"assign_tasks",
	"view_internal_notes",
	"work_on_tasks",

	// ── Sales — Leads (granular) ─────────────────────────────────────────────
	"view_leads",
	"create_leads",
	"edit_leads",
	"delete_leads",
	"convert_leads",

	// ── Sales — Quotations ───────────────────────────────────────────────────
	"view_quotations",
	"create_quotations",
	"edit_quotations",
	"delete_quotations",
	"calculate_quotations",

	// ── Sales — Contracts (granular) ─────────────────────────────────────────
	"view_contracts",
	"create_contracts",
	"edit_contracts",
	"delete_contracts",
	"sign_contracts",

	// ── Invoice Management (granular) ────────────────────────────────────────
	"view_invoices",
	"create_invoices",
	"edit_invoices",
	"delete_invoices",
	"send_invoices",
	"cancel_invoices",

	// ── Wiki Management ──────────────────────────────────────────────────────
	"manage_wiki",
	"view_wiki",
	"create_wiki",
	"edit_wiki",
	"delete_wiki",
	"view_encrypted_content",

	// ── Time Tracking ────────────────────────────────────────────────────────
	"manage_time_entries",
	"view_time_entries",
	"start_timer",
	"stop_timer",
	"view_all_time_entries",
	"edit_time_entries",
	"delete_time_entries",
	"log_time",

	// ── Attendance ───────────────────────────────────────────────────────────
	"manage_attendance",
	"view_attendance",
	"view_all_attendance",
	"clock_out",

	// ── Shifts ──────────────────────────────────────────────────────────────
	"manage_shifts",

	// ── Employee Management ──────────────────────────────────────────────────
	"manage_employees",
	"view_employees",
	"create_employees",
	"edit_employees",
	"view_employee_salary",
	"view_employee_performance",

	// ── SOP Management ───────────────────────────────────────────────────────
	"manage_sops",
	"view_morning_sop",
	"submit_morning_sop",

	// ── Meetings (granular) ──────────────────────────────────────────────────
	"view_meetings",
	"delete_meetings",

	// ── Client Portal ────────────────────────────────────────────────────────
	"access_client_portal",
	"create_client_portal_access",
	"revoke_client_portal_access",
	"reset_client_portal_password",

	// ── Reports & Analytics ──────────────────────────────────────────────────
	"view_profitability",
	"view_cost",
	"view_quality_metrics",
	"view_user_performance",
	"view_attendance_analytics",
	"view_admin_stats",

	// ── Financial Data ───────────────────────────────────────────────────────
	"view_internal_costs",
	"manage_internal_costs",

	// ── Payroll (granular) ───────────────────────────────────────────────────
	"view_payroll",

	// ── Settings (granular) ──────────────────────────────────────────────────
	"view_settings",
	"delete_settings",

	// ── Security & Audit ─────────────────────────────────────────────────────
	"view_audit_logs",

	// ── Tags ─────────────────────────────────────────────────────────────────
	"manage_tags",
	"view_tags",

	// ── Calendar ─────────────────────────────────────────────────────────────
	"view_calendar",
] as const;

export type SystemPermission = (typeof SYSTEM_PERMISSIONS)[number];
