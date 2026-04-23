/**
 * Admin Permissions Hooks
 * Hooks for checking user permissions and conditional UI rendering.
 *
 * Requirements: 18.1-18.6
 */

import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/_old/store/authStore";

/**
 * Permission names used in the admin module
 */
export const ADMIN_PERMISSIONS = {
	// User Management
	MANAGE_USERS: "manage_users",
	VIEW_USERS: "view_users",
	CREATE_USERS: "create_users",
	EDIT_USERS: "edit_users",
	DELETE_USERS: "delete_users",

	// Role Management
	MANAGE_ROLES: "manage_roles",
	VIEW_ROLES: "view_roles",
	CREATE_ROLES: "create_roles",
	EDIT_ROLES: "edit_roles",
	DELETE_ROLES: "delete_roles",

	// Client Management
	MANAGE_CLIENTS: "manage_clients",
	VIEW_CLIENTS: "view_clients",
	CREATE_CLIENTS: "create_clients",
	EDIT_CLIENTS: "edit_clients",
	DELETE_CLIENTS: "delete_clients",

	// Project Management
	MANAGE_PROJECTS: "manage_projects",
	VIEW_PROJECTS: "view_projects",
	CREATE_PROJECTS: "create_projects",
	EDIT_PROJECTS: "edit_projects",
	DELETE_PROJECTS: "delete_projects",
	APPROVE_PROJECT_UI: "approve_project_ui",

	// Project Members
	MANAGE_PROJECT_MEMBERS: "manage_project_members",
	VIEW_PROJECT_MEMBERS: "view_project_members",
	ADD_PROJECT_MEMBERS: "add_project_members",
	REMOVE_PROJECT_MEMBERS: "remove_project_members",

	// Project Files
	MANAGE_PROJECT_FILES: "manage_project_files",
	VIEW_PROJECT_FILES: "view_project_files",
	UPLOAD_PROJECT_FILES: "upload_project_files",
	DELETE_PROJECT_FILES: "delete_project_files",

	// Project History
	VIEW_PROJECT_HISTORY: "view_project_history",

	// Task Management
	MANAGE_TASKS: "manage_tasks",
	VIEW_TASKS: "view_tasks",
	CREATE_TASKS: "create_tasks",
	EDIT_TASKS: "edit_tasks",
	DELETE_TASKS: "delete_tasks",
	VIEW_INTERNAL_NOTES: "view_internal_notes",
	ASSIGN_TASKS: "assign_tasks",

	// Test Scenarios
	MANAGE_TEST_SCENARIOS: "manage_test_scenarios",
	VIEW_TEST_SCENARIOS: "view_test_scenarios",
	CREATE_TEST_SCENARIOS: "create_test_scenarios",
	COMPLETE_TEST_SCENARIOS: "complete_test_scenarios",
	VERIFY_TEST_SCENARIOS: "verify_test_scenarios",

	// Sales - Leads
	MANAGE_SALES: "manage_sales",
	VIEW_LEADS: "view_leads",
	CREATE_LEADS: "create_leads",
	EDIT_LEADS: "edit_leads",
	DELETE_LEADS: "delete_leads",

	// Sales - Quotations
	VIEW_QUOTATIONS: "view_quotations",
	CREATE_QUOTATIONS: "create_quotations",
	EDIT_QUOTATIONS: "edit_quotations",
	DELETE_QUOTATIONS: "delete_quotations",
	CALCULATE_QUOTATIONS: "calculate_quotations",

	// Sales - Contracts
	VIEW_CONTRACTS: "view_contracts",
	CREATE_CONTRACTS: "create_contracts",
	EDIT_CONTRACTS: "edit_contracts",
	DELETE_CONTRACTS: "delete_contracts",
	SIGN_CONTRACTS: "sign_contracts",

	// Milestones
	VIEW_MILESTONES: "view_milestones",
	CREATE_MILESTONE_INVOICE: "create_milestone_invoice",
	MARK_MILESTONE_PAID: "mark_milestone_paid",
	LINK_MILESTONE_INVOICE: "link_milestone_invoice",

	// Invoice Management
	MANAGE_INVOICES: "manage_invoices",
	VIEW_INVOICES: "view_invoices",
	CREATE_INVOICES: "create_invoices",
	EDIT_INVOICES: "edit_invoices",
	DELETE_INVOICES: "delete_invoices",
	SEND_INVOICES: "send_invoices",
	CANCEL_INVOICES: "cancel_invoices",

	// Wiki Management
	MANAGE_WIKI: "manage_wiki",
	VIEW_WIKI: "view_wiki",
	CREATE_WIKI: "create_wiki",
	EDIT_WIKI: "edit_wiki",
	DELETE_WIKI: "delete_wiki",
	VIEW_ENCRYPTED_CONTENT: "view_encrypted_content",

	// Time Tracking
	MANAGE_TIME_ENTRIES: "manage_time_entries",
	VIEW_TIME_ENTRIES: "view_time_entries",
	START_TIMER: "start_timer",
	STOP_TIMER: "stop_timer",
	VIEW_ALL_TIME_ENTRIES: "view_all_time_entries",
	EDIT_TIME_ENTRIES: "edit_time_entries",

	// Attendance
	MANAGE_ATTENDANCE: "manage_attendance",
	VIEW_ATTENDANCE: "view_attendance",
	VIEW_ALL_ATTENDANCE: "view_all_attendance",
	CLOCK_OUT: "clock_out",
	EDIT_ATTENDANCE: "edit_attendance",

	// Task Creation Permissions
	CREATE_MAIN_TASKS: "create_main_tasks",
	CREATE_WEEKLY_TASKS: "create_weekly_tasks",
	CREATE_SUBTASKS: "create_subtasks",

	// Task Edit Permissions
	EDIT_MAIN_TASKS: "edit_main_tasks",
	EDIT_WEEKLY_TASKS: "edit_weekly_tasks",
	EDIT_SUBTASKS: "edit_subtasks",

	// Task Team & Test Scenarios Permissions
	MANAGE_TASK_TEAM: "manage_task_team",
	MANAGE_TASK_TEST_SCENARIOS: "manage_task_test_scenarios",

	// Project Budget Permission
	VIEW_PROJECT_BUDGET: "view_project_budget",

	// Dashboard
	VIEW_DASHBOARD: "view_dashboard",
	VIEW_DASHBOARD_OVERVIEW: "view_dashboard_overview",

	// Reports & Analytics
	VIEW_REPORTS: "view_reports",
	VIEW_PROFITABILITY: "view_profitability",
	VIEW_COST: "view_cost",
	VIEW_QUALITY_METRICS: "view_quality_metrics",
	VIEW_USER_PERFORMANCE: "view_user_performance",
	VIEW_ATTENDANCE_ANALYTICS: "view_attendance_analytics",

	// Admin Statistics
	VIEW_ADMIN_STATS: "view_admin_stats",

	// Financial Data
	VIEW_INTERNAL_COSTS: "view_internal_costs",
	MANAGE_INTERNAL_COSTS: "manage_internal_costs",

	// Security & Audit
	VIEW_AUDIT_LOGS: "view_audit_logs",

	// Tags
	MANAGE_TAGS: "manage_tags",
	VIEW_TAGS: "view_tags",

	// Performance Evaluations
	VIEW_EVALUATIONS: "view_performance_evaluations",
	MANAGE_EVALUATIONS: "manage_performance_evaluations",
	APPROVE_EVALUATIONS: "approve_performance_evaluations",
	VIEW_BONUSES: "view_bonuses",

	// Code Reviews
	VIEW_ALL_CODE_REVIEWS: "view_all_code_reviews",
	MANAGE_CODE_REVIEWS: "manage_code_reviews",

	// Innovation Logs
	VIEW_ALL_INNOVATION_LOGS: "view_all_innovation_logs",
	VERIFY_INNOVATION_LOGS: "verify_innovation_logs",
	MANAGE_INNOVATION_LOGS: "manage_innovation_logs",

	// Lead Conversion
	CONVERT_LEADS: "convert_leads",
	VIEW_LEAD_CONVERSION_STATUS: "view_lead_conversion_status",

	// Client Portal Access
	MANAGE_CLIENT_PORTAL_ACCESS: "manage_client_portal_access",
	CREATE_CLIENT_PORTAL_ACCESS: "create_client_portal_access",
	REVOKE_CLIENT_PORTAL_ACCESS: "revoke_client_portal_access",
	RESET_CLIENT_PORTAL_PASSWORD: "reset_client_portal_password",

	// Points System
	MANAGE_USER_POINTS: "manage_user_points",
	VIEW_POINTS: "view_points",
	MANAGE_POINTS: "manage_points",
	AWARD_POINTS: "award_points",
	DEDUCT_POINTS: "deduct_points",
	VIEW_POINT_TRANSACTIONS: "view_point_transactions",

	// Change Requests
	VIEW_CHANGE_REQUESTS: "view_change_requests",
	CREATE_CHANGE_REQUESTS: "create_change_requests",
	APPROVE_CHANGE_REQUESTS: "approve_change_requests",
	REJECT_CHANGE_REQUESTS: "reject_change_requests",
	MANAGE_CHANGE_REQUESTS: "manage_change_requests",

	// Milestones Management
	CREATE_MILESTONES: "create_milestones",
	EDIT_MILESTONES: "edit_milestones",
	DELETE_MILESTONES: "delete_milestones",
	MANAGE_MILESTONES: "manage_milestones",
} as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

/**
 * Hook to check user permissions
 * Requirement 18.1: Provide a usePermissions hook to check user permissions
 *
 * @returns Object with permission checking utilities
 */
export const usePermissions = () => {
	const { permissions } = useAuthStore();

	/**
	 * Check if user has a specific permission
	 * @param permissionName - The permission to check
	 * @returns boolean indicating if user has the permission
	 */
	const hasPermission = useCallback(
		(permissionName: string): boolean => {
			if (!permissions || permissions.length === 0) {
				return false;
			}

			const permission = permissions.find((p) => p.permissionName === permissionName);
			return permission?.access ?? false;
		},
		[permissions]
	);

	/**
	 * Check if user has all of the specified permissions
	 * @param permissionNames - Array of permissions to check
	 * @returns boolean indicating if user has all permissions
	 */
	const hasAllPermissions = useCallback(
		(permissionNames: string[]): boolean => {
			return permissionNames.every((name) => hasPermission(name));
		},
		[hasPermission]
	);

	/**
	 * Check if user has any of the specified permissions
	 * @param permissionNames - Array of permissions to check
	 * @returns boolean indicating if user has at least one permission
	 */
	const hasAnyPermission = useCallback(
		(permissionNames: string[]): boolean => {
			return permissionNames.some((name) => hasPermission(name));
		},
		[hasPermission]
	);

	/**
	 * Pre-computed permission checks for common admin permissions
	 * Requirement 18.2-18.5: Conditional rendering based on permissions
	 */
	const adminPermissions = useMemo(
		() => ({
			// User Management
			canManageUsers: hasPermission(ADMIN_PERMISSIONS.MANAGE_USERS),
			canViewUsers: hasPermission(ADMIN_PERMISSIONS.VIEW_USERS),
			canCreateUsers: hasPermission(ADMIN_PERMISSIONS.CREATE_USERS),
			canEditUsers: hasPermission(ADMIN_PERMISSIONS.EDIT_USERS),
			canDeleteUsers: hasPermission(ADMIN_PERMISSIONS.DELETE_USERS),

			// Role Management
			canManageRoles: hasPermission(ADMIN_PERMISSIONS.MANAGE_ROLES),
			canViewRoles: hasPermission(ADMIN_PERMISSIONS.VIEW_ROLES),

			// Client Management
			canManageClients: hasPermission(ADMIN_PERMISSIONS.MANAGE_CLIENTS),
			canViewClients: hasPermission(ADMIN_PERMISSIONS.VIEW_CLIENTS),
			canCreateClients: hasPermission(ADMIN_PERMISSIONS.CREATE_CLIENTS),
			canEditClients: hasPermission(ADMIN_PERMISSIONS.EDIT_CLIENTS),
			canDeleteClients: hasPermission(ADMIN_PERMISSIONS.DELETE_CLIENTS),

			// Project Management
			canManageProjects: hasPermission(ADMIN_PERMISSIONS.MANAGE_PROJECTS),
			canViewProjects: hasPermission(ADMIN_PERMISSIONS.VIEW_PROJECTS),
			canCreateProjects: hasPermission(ADMIN_PERMISSIONS.CREATE_PROJECTS),
			canEditProjects: hasPermission(ADMIN_PERMISSIONS.EDIT_PROJECTS),
			canDeleteProjects: hasPermission(ADMIN_PERMISSIONS.DELETE_PROJECTS),
			canApproveProjectUI: hasPermission(ADMIN_PERMISSIONS.APPROVE_PROJECT_UI),

			// Project Members
			canManageProjectMembers: hasPermission(ADMIN_PERMISSIONS.MANAGE_PROJECT_MEMBERS),
			canViewProjectMembers: hasPermission(ADMIN_PERMISSIONS.VIEW_PROJECT_MEMBERS),
			canAddProjectMembers: hasPermission(ADMIN_PERMISSIONS.ADD_PROJECT_MEMBERS),
			canRemoveProjectMembers: hasPermission(ADMIN_PERMISSIONS.REMOVE_PROJECT_MEMBERS),

			// Project Files
			canManageProjectFiles: hasPermission(ADMIN_PERMISSIONS.MANAGE_PROJECT_FILES),
			canViewProjectFiles: hasPermission(ADMIN_PERMISSIONS.VIEW_PROJECT_FILES),
			canUploadProjectFiles: hasPermission(ADMIN_PERMISSIONS.UPLOAD_PROJECT_FILES),
			canDeleteProjectFiles: hasPermission(ADMIN_PERMISSIONS.DELETE_PROJECT_FILES),

			// Project History
			canViewProjectHistory: hasPermission(ADMIN_PERMISSIONS.VIEW_PROJECT_HISTORY),

			// Task Management
			canManageTasks: hasPermission(ADMIN_PERMISSIONS.MANAGE_TASKS),
			canViewTasks: hasPermission(ADMIN_PERMISSIONS.VIEW_TASKS),
			canCreateTasks: hasPermission(ADMIN_PERMISSIONS.CREATE_TASKS),
			canEditTasks: hasPermission(ADMIN_PERMISSIONS.EDIT_TASKS),
			canDeleteTasks: hasPermission(ADMIN_PERMISSIONS.DELETE_TASKS),
			canViewInternalNotes: hasPermission(ADMIN_PERMISSIONS.VIEW_INTERNAL_NOTES),
			canAssignTasks: hasPermission(ADMIN_PERMISSIONS.ASSIGN_TASKS),

			// Test Scenarios
			canManageTestScenarios: hasPermission(ADMIN_PERMISSIONS.MANAGE_TEST_SCENARIOS),
			canViewTestScenarios: hasPermission(ADMIN_PERMISSIONS.VIEW_TEST_SCENARIOS),
			canCreateTestScenarios: hasPermission(ADMIN_PERMISSIONS.CREATE_TEST_SCENARIOS),
			canCompleteTestScenarios: hasPermission(ADMIN_PERMISSIONS.COMPLETE_TEST_SCENARIOS),
			canVerifyTestScenarios: hasPermission(ADMIN_PERMISSIONS.VERIFY_TEST_SCENARIOS),

			// Sales - Leads
			canManageSales: hasPermission(ADMIN_PERMISSIONS.MANAGE_SALES),
			canViewLeads: hasPermission(ADMIN_PERMISSIONS.VIEW_LEADS),
			canCreateLeads: hasPermission(ADMIN_PERMISSIONS.CREATE_LEADS),
			canEditLeads: hasPermission(ADMIN_PERMISSIONS.EDIT_LEADS),
			canDeleteLeads: hasPermission(ADMIN_PERMISSIONS.DELETE_LEADS),

			// Sales - Quotations
			canViewQuotations: hasPermission(ADMIN_PERMISSIONS.VIEW_QUOTATIONS),
			canCreateQuotations: hasPermission(ADMIN_PERMISSIONS.CREATE_QUOTATIONS),
			canEditQuotations: hasPermission(ADMIN_PERMISSIONS.EDIT_QUOTATIONS),
			canDeleteQuotations: hasPermission(ADMIN_PERMISSIONS.DELETE_QUOTATIONS),
			canCalculateQuotations: hasPermission(ADMIN_PERMISSIONS.CALCULATE_QUOTATIONS),

			// Sales - Contracts
			canViewContracts: hasPermission(ADMIN_PERMISSIONS.VIEW_CONTRACTS),
			canCreateContracts: hasPermission(ADMIN_PERMISSIONS.CREATE_CONTRACTS),
			canEditContracts: hasPermission(ADMIN_PERMISSIONS.EDIT_CONTRACTS),
			canDeleteContracts: hasPermission(ADMIN_PERMISSIONS.DELETE_CONTRACTS),
			canSignContracts: hasPermission(ADMIN_PERMISSIONS.SIGN_CONTRACTS),

			// Milestones
			canViewMilestones: hasPermission(ADMIN_PERMISSIONS.VIEW_MILESTONES),
			canCreateMilestoneInvoice: hasPermission(ADMIN_PERMISSIONS.CREATE_MILESTONE_INVOICE),
			canMarkMilestonePaid: hasPermission(ADMIN_PERMISSIONS.MARK_MILESTONE_PAID),
			canLinkMilestoneInvoice: hasPermission(ADMIN_PERMISSIONS.LINK_MILESTONE_INVOICE),

			// Invoice Management
			canManageInvoices: hasPermission(ADMIN_PERMISSIONS.MANAGE_INVOICES),
			canViewInvoices: hasPermission(ADMIN_PERMISSIONS.VIEW_INVOICES),
			canCreateInvoices: hasPermission(ADMIN_PERMISSIONS.CREATE_INVOICES),
			canEditInvoices: hasPermission(ADMIN_PERMISSIONS.EDIT_INVOICES),
			canDeleteInvoices: hasPermission(ADMIN_PERMISSIONS.DELETE_INVOICES),
			canSendInvoices: hasPermission(ADMIN_PERMISSIONS.SEND_INVOICES),
			canCancelInvoices: hasPermission(ADMIN_PERMISSIONS.CANCEL_INVOICES),

			// Wiki Management
			canManageWiki: hasPermission(ADMIN_PERMISSIONS.MANAGE_WIKI),
			canViewWiki: hasPermission(ADMIN_PERMISSIONS.VIEW_WIKI),
			canCreateWiki: hasPermission(ADMIN_PERMISSIONS.CREATE_WIKI),
			canEditWiki: hasPermission(ADMIN_PERMISSIONS.EDIT_WIKI),
			canDeleteWiki: hasPermission(ADMIN_PERMISSIONS.DELETE_WIKI),
			canViewEncryptedContent: hasPermission(ADMIN_PERMISSIONS.VIEW_ENCRYPTED_CONTENT),

			// Time Tracking
			canManageTimeEntries: hasPermission(ADMIN_PERMISSIONS.MANAGE_TIME_ENTRIES),
			canViewTimeEntries: hasPermission(ADMIN_PERMISSIONS.VIEW_TIME_ENTRIES),
			canStartTimer: hasPermission(ADMIN_PERMISSIONS.START_TIMER),
			canStopTimer: hasPermission(ADMIN_PERMISSIONS.STOP_TIMER),
			canViewAllTimeEntries: hasPermission(ADMIN_PERMISSIONS.VIEW_ALL_TIME_ENTRIES),
			canEditTimeEntries: hasPermission(ADMIN_PERMISSIONS.EDIT_TIME_ENTRIES),

			// Attendance
			canManageAttendance: hasPermission(ADMIN_PERMISSIONS.MANAGE_ATTENDANCE),
			canViewAttendance: hasPermission(ADMIN_PERMISSIONS.VIEW_ATTENDANCE),
			canViewAllAttendance: hasPermission(ADMIN_PERMISSIONS.VIEW_ALL_ATTENDANCE),
			canClockOut: hasPermission(ADMIN_PERMISSIONS.CLOCK_OUT),
			canEditAttendance: hasPermission(ADMIN_PERMISSIONS.EDIT_ATTENDANCE),

			// Task Creation
			canCreateMainTasks: hasPermission(ADMIN_PERMISSIONS.CREATE_MAIN_TASKS),
			canCreateWeeklyTasks: hasPermission(ADMIN_PERMISSIONS.CREATE_WEEKLY_TASKS),
			canCreateSubtasks: hasPermission(ADMIN_PERMISSIONS.CREATE_SUBTASKS),

			// Task Edit
			canEditMainTasks: hasPermission(ADMIN_PERMISSIONS.EDIT_MAIN_TASKS),
			canEditWeeklyTasks: hasPermission(ADMIN_PERMISSIONS.EDIT_WEEKLY_TASKS),
			canEditSubtasks: hasPermission(ADMIN_PERMISSIONS.EDIT_SUBTASKS),

			// Task Team & Test Scenarios
			canManageTaskTeam: hasPermission(ADMIN_PERMISSIONS.MANAGE_TASK_TEAM),
			canManageTaskTestScenarios: hasPermission(ADMIN_PERMISSIONS.MANAGE_TASK_TEST_SCENARIOS),

			// Project Budget
			canViewProjectBudget: hasPermission(ADMIN_PERMISSIONS.VIEW_PROJECT_BUDGET),

			// Dashboard
			canViewDashboard: hasPermission(ADMIN_PERMISSIONS.VIEW_DASHBOARD),
			canViewDashboardOverview: hasPermission(ADMIN_PERMISSIONS.VIEW_DASHBOARD_OVERVIEW),

			// Reports & Analytics
			canViewReports: hasPermission(ADMIN_PERMISSIONS.VIEW_REPORTS),
			canViewProfitability: hasPermission(ADMIN_PERMISSIONS.VIEW_PROFITABILITY),
			canViewCost: hasPermission(ADMIN_PERMISSIONS.VIEW_COST),
			canViewQualityMetrics: hasPermission(ADMIN_PERMISSIONS.VIEW_QUALITY_METRICS),
			canViewUserPerformance: hasPermission(ADMIN_PERMISSIONS.VIEW_USER_PERFORMANCE),
			canViewAttendanceAnalytics: hasPermission(ADMIN_PERMISSIONS.VIEW_ATTENDANCE_ANALYTICS),

			// Admin Statistics
			canViewAdminStats: hasPermission(ADMIN_PERMISSIONS.VIEW_ADMIN_STATS),

			// Financial Data
			canViewInternalCosts: hasPermission(ADMIN_PERMISSIONS.VIEW_INTERNAL_COSTS),
			canManageInternalCosts: hasPermission(ADMIN_PERMISSIONS.MANAGE_INTERNAL_COSTS),

			// Security & Audit
			canViewAuditLogs: hasPermission(ADMIN_PERMISSIONS.VIEW_AUDIT_LOGS),

			// Tags
			canManageTags: hasPermission(ADMIN_PERMISSIONS.MANAGE_TAGS),
			canViewTags: hasPermission(ADMIN_PERMISSIONS.VIEW_TAGS),

			// Performance Evaluations
			canViewEvaluations: hasPermission(ADMIN_PERMISSIONS.VIEW_EVALUATIONS),
			canManageEvaluations: hasPermission(ADMIN_PERMISSIONS.MANAGE_EVALUATIONS),
			canCreateEvaluations: hasPermission(ADMIN_PERMISSIONS.MANAGE_EVALUATIONS),
			canEditEvaluations: hasPermission(ADMIN_PERMISSIONS.MANAGE_EVALUATIONS),
			canApproveEvaluations: hasPermission(ADMIN_PERMISSIONS.APPROVE_EVALUATIONS),
			canViewBonuses: hasPermission(ADMIN_PERMISSIONS.VIEW_BONUSES),

			// Code Reviews
			canViewAllCodeReviews: hasPermission(ADMIN_PERMISSIONS.VIEW_ALL_CODE_REVIEWS),
			canManageCodeReviews: hasPermission(ADMIN_PERMISSIONS.MANAGE_CODE_REVIEWS),
			canApproveCodeReviews: hasPermission(ADMIN_PERMISSIONS.MANAGE_CODE_REVIEWS),

			// Innovation Logs
			canViewAllInnovationLogs: hasPermission(ADMIN_PERMISSIONS.VIEW_ALL_INNOVATION_LOGS),
			canVerifyInnovationLogs: hasPermission(ADMIN_PERMISSIONS.VERIFY_INNOVATION_LOGS),
			canManageInnovationLogs: hasPermission(ADMIN_PERMISSIONS.MANAGE_INNOVATION_LOGS),

			// Lead Conversion
			canConvertLeads: hasPermission(ADMIN_PERMISSIONS.CONVERT_LEADS),
			canViewLeadConversionStatus: hasPermission(ADMIN_PERMISSIONS.VIEW_LEAD_CONVERSION_STATUS),

			// Client Portal Access
			canManageClientPortalAccess: hasPermission(ADMIN_PERMISSIONS.MANAGE_CLIENT_PORTAL_ACCESS),
			canCreateClientPortalAccess: hasPermission(ADMIN_PERMISSIONS.CREATE_CLIENT_PORTAL_ACCESS),
			canRevokeClientPortalAccess: hasPermission(ADMIN_PERMISSIONS.REVOKE_CLIENT_PORTAL_ACCESS),
			canResetClientPortalPassword: hasPermission(ADMIN_PERMISSIONS.RESET_CLIENT_PORTAL_PASSWORD),

			// Points System
			canManageUserPoints: hasPermission(ADMIN_PERMISSIONS.MANAGE_USER_POINTS),
			canViewPoints: hasPermission(ADMIN_PERMISSIONS.VIEW_POINTS),
			canManagePoints: hasPermission(ADMIN_PERMISSIONS.MANAGE_POINTS),
			canAwardPoints: hasPermission(ADMIN_PERMISSIONS.AWARD_POINTS),
			canDeductPoints: hasPermission(ADMIN_PERMISSIONS.DEDUCT_POINTS),
			canViewPointTransactions: hasPermission(ADMIN_PERMISSIONS.VIEW_POINT_TRANSACTIONS),

			// Change Requests
			canViewChangeRequests: hasPermission(ADMIN_PERMISSIONS.VIEW_CHANGE_REQUESTS),
			canCreateChangeRequests: hasPermission(ADMIN_PERMISSIONS.CREATE_CHANGE_REQUESTS),
			canApproveChangeRequests: hasPermission(ADMIN_PERMISSIONS.APPROVE_CHANGE_REQUESTS),
			canRejectChangeRequests: hasPermission(ADMIN_PERMISSIONS.REJECT_CHANGE_REQUESTS),
			canManageChangeRequests: hasPermission(ADMIN_PERMISSIONS.MANAGE_CHANGE_REQUESTS),

			// Milestones Management
			canCreateMilestones: hasPermission(ADMIN_PERMISSIONS.CREATE_MILESTONES),
			canEditMilestones: hasPermission(ADMIN_PERMISSIONS.EDIT_MILESTONES),
			canDeleteMilestones: hasPermission(ADMIN_PERMISSIONS.DELETE_MILESTONES),
			canManageMilestones: hasPermission(ADMIN_PERMISSIONS.MANAGE_MILESTONES),
		}),
		[hasPermission]
	);

	/**
	 * Check if user can access profitability data
	 * Requirement 18.2: AdminDashboard renders profitability section only with view_internal_costs
	 */
	const canViewProfitability = useMemo(() => hasAllPermissions([ADMIN_PERMISSIONS.VIEW_ADMIN_STATS, ADMIN_PERMISSIONS.VIEW_INTERNAL_COSTS]), [hasAllPermissions]);

	return {
		hasPermission,
		hasAllPermissions,
		hasAnyPermission,
		permissions,
		...adminPermissions,
		canViewProfitability,
	};
};

/**
 * Hook to check if user can access a specific admin feature
 * Returns access status
 */
export const useCanAccess = (requiredPermissions: string | string[]) => {
	const { hasPermission, hasAllPermissions } = usePermissions();
	const { isAuthenticated } = useAuthStore();

	const canAccess = useMemo(() => {
		if (!isAuthenticated) return false;

		if (Array.isArray(requiredPermissions)) {
			return hasAllPermissions(requiredPermissions);
		}
		return hasPermission(requiredPermissions);
	}, [isAuthenticated, requiredPermissions, hasPermission, hasAllPermissions]);

	return {
		canAccess,
		isAuthenticated,
	};
};
