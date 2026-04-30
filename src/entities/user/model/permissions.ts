import { useMemo } from "react";
import { useAuthStore } from "./auth.store";

export const CLIENT_PERMISSIONS = {
	MANAGE_CLIENTS: "manage_clients",
	VIEW_CLIENTS: "view_clients",
	CREATE_CLIENTS: "create_clients",
	EDIT_CLIENTS: "edit_clients",
	DELETE_CLIENTS: "delete_clients",
} as const;

export const PROJECT_PERMISSIONS = {
	MANAGE_PROJECTS: "manage_projects",
	VIEW_PROJECTS: "view_projects",
	CREATE_PROJECTS: "create_projects",
	EDIT_PROJECTS: "edit_projects",
	DELETE_PROJECTS: "delete_projects",
	APPROVE_PROJECT_UI: "approve_project_ui",
	VIEW_PROJECT_BUDGET: "view_project_budget",
} as const;

export const MEETING_PERMISSIONS = {
	SCHEDULE_MEETINGS: "schedule_meetings",
} as const;

export const TASK_PERMISSIONS = {
	MANAGE_TASKS: "manage_tasks",
	VIEW_TASKS: "view_tasks",
	CREATE_TASKS: "create_tasks",
	EDIT_TASKS: "edit_tasks",
	DELETE_TASKS: "delete_tasks",
	VIEW_INTERNAL_NOTES: "view_internal_notes",
	ASSIGN_TASKS: "assign_tasks",
	CREATE_MAIN_TASKS: "create_main_tasks",
	CREATE_WEEKLY_TASKS: "create_weekly_tasks",
	CREATE_SUBTASKS: "create_subtasks",
	EDIT_MAIN_TASKS: "edit_main_tasks",
	EDIT_WEEKLY_TASKS: "edit_weekly_tasks",
	EDIT_SUBTASKS: "edit_subtasks",
	MANAGE_TASK_TEAM: "manage_task_team",
	MANAGE_TASK_TEST_SCENARIOS: "manage_task_test_scenarios",
} as const;

export const INVOICE_PERMISSIONS = {
	MANAGE_INVOICES: "manage_invoices",
	VIEW_INVOICES: "view_invoices",
	CREATE_INVOICES: "create_invoices",
	EDIT_INVOICES: "edit_invoices",
	DELETE_INVOICES: "delete_invoices",
	SEND_INVOICES: "send_invoices",
	CANCEL_INVOICES: "cancel_invoices",
} as const;

export const SALES_PERMISSIONS = {
	MANAGE_LEADS: "manage_leads",
	VIEW_LEADS: "view_leads",
	CREATE_LEADS: "create_leads",
	EDIT_LEADS: "edit_leads",
	DELETE_LEADS: "delete_leads",
	CONVERT_LEADS: "convert_leads",
	MANAGE_CONTRACTS: "manage_contracts",
	VIEW_CONTRACTS: "view_contracts",
	CREATE_CONTRACTS: "create_contracts",
	EDIT_CONTRACTS: "edit_contracts",
	DELETE_CONTRACTS: "delete_contracts",
	SIGN_CONTRACTS: "sign_contracts",
} as const;

export const EMPLOYEE_PERMISSIONS = {
	MANAGE_USERS: "manage_users",
	VIEW_USERS: "view_users",
	CREATE_USERS: "create_users",
	EDIT_USERS: "edit_users",
	DELETE_USERS: "delete_users",
	MANAGE_ROLES: "manage_roles",
	VIEW_ROLES: "view_roles",
	MANAGE_PROJECT_MEMBERS: "manage_project_members",
	VIEW_PROJECT_MEMBERS: "view_project_members",
	ADD_PROJECT_MEMBERS: "add_project_members",
	REMOVE_PROJECT_MEMBERS: "remove_project_members",
} as const;

export function useClientPermissions() {
	const hasPermission = useAuthStore((state) => state.hasPermission);

	return useMemo(
		() => {
			const canManageClients = hasPermission(CLIENT_PERMISSIONS.MANAGE_CLIENTS);

			// After backend permission seed changes, users must re-login so auth local storage receives the refreshed permissions array.
			return {
				canManageClients,
				canViewClients: canManageClients || hasPermission(CLIENT_PERMISSIONS.VIEW_CLIENTS),
				canCreateClients: canManageClients || hasPermission(CLIENT_PERMISSIONS.CREATE_CLIENTS),
				canEditClients: canManageClients || hasPermission(CLIENT_PERMISSIONS.EDIT_CLIENTS),
				canDeleteClients: canManageClients || hasPermission(CLIENT_PERMISSIONS.DELETE_CLIENTS),
			};
		},
		[hasPermission]
	);
}

export function useProjectPermissions() {
	const hasPermission = useAuthStore((state) => state.hasPermission);

	return useMemo(
		() => ({
			canManageProjects: hasPermission(PROJECT_PERMISSIONS.MANAGE_PROJECTS),
			canViewProjects: hasPermission(PROJECT_PERMISSIONS.VIEW_PROJECTS),
			canCreateProjects: hasPermission(PROJECT_PERMISSIONS.CREATE_PROJECTS),
			canEditProjects: hasPermission(PROJECT_PERMISSIONS.EDIT_PROJECTS),
			canDeleteProjects: hasPermission(PROJECT_PERMISSIONS.DELETE_PROJECTS),
			canApproveProjectUI: hasPermission(PROJECT_PERMISSIONS.APPROVE_PROJECT_UI),
			canViewProjectBudget: hasPermission(PROJECT_PERMISSIONS.VIEW_PROJECT_BUDGET),
		}),
		[hasPermission]
	);
}

export function useMeetingPermissions() {
	const hasPermission = useAuthStore((state) => state.hasPermission);

	return useMemo(
		() => ({
			canScheduleMeetings: hasPermission(MEETING_PERMISSIONS.SCHEDULE_MEETINGS),
		}),
		[hasPermission]
	);
}

export function useTaskPermissions() {
	const hasPermission = useAuthStore((state) => state.hasPermission);

	return useMemo(
		() => ({
			canManageTasks: hasPermission(TASK_PERMISSIONS.MANAGE_TASKS),
			canViewTasks: hasPermission(TASK_PERMISSIONS.VIEW_TASKS),
			canCreateTasks: hasPermission(TASK_PERMISSIONS.CREATE_TASKS),
			canEditTasks: hasPermission(TASK_PERMISSIONS.EDIT_TASKS),
			canDeleteTasks: hasPermission(TASK_PERMISSIONS.DELETE_TASKS),
			canViewInternalNotes: hasPermission(TASK_PERMISSIONS.VIEW_INTERNAL_NOTES),
			canAssignTasks: hasPermission(TASK_PERMISSIONS.ASSIGN_TASKS),
			canCreateMainTasks: hasPermission(TASK_PERMISSIONS.CREATE_MAIN_TASKS),
			canCreateWeeklyTasks: hasPermission(TASK_PERMISSIONS.CREATE_WEEKLY_TASKS),
			canCreateSubtasks: hasPermission(TASK_PERMISSIONS.CREATE_SUBTASKS),
			canEditMainTasks: hasPermission(TASK_PERMISSIONS.EDIT_MAIN_TASKS),
			canEditWeeklyTasks: hasPermission(TASK_PERMISSIONS.EDIT_WEEKLY_TASKS),
			canEditSubtasks: hasPermission(TASK_PERMISSIONS.EDIT_SUBTASKS),
			canManageTaskTeam: hasPermission(TASK_PERMISSIONS.MANAGE_TASK_TEAM),
			canManageTaskTestScenarios: hasPermission(TASK_PERMISSIONS.MANAGE_TASK_TEST_SCENARIOS),
		}),
		[hasPermission]
	);
}

export function useInvoicePermissions() {
	const hasPermission = useAuthStore((state) => state.hasPermission);

	return useMemo(
		() => ({
			canManageInvoices: hasPermission(INVOICE_PERMISSIONS.MANAGE_INVOICES),
			canViewInvoices: hasPermission(INVOICE_PERMISSIONS.VIEW_INVOICES),
			canCreateInvoices: hasPermission(INVOICE_PERMISSIONS.CREATE_INVOICES),
			canEditInvoices: hasPermission(INVOICE_PERMISSIONS.EDIT_INVOICES),
			canDeleteInvoices: hasPermission(INVOICE_PERMISSIONS.DELETE_INVOICES),
			canSendInvoices: hasPermission(INVOICE_PERMISSIONS.SEND_INVOICES),
			canCancelInvoices: hasPermission(INVOICE_PERMISSIONS.CANCEL_INVOICES),
		}),
		[hasPermission]
	);
}

export function useSalesPermissions() {
	const hasPermission = useAuthStore((state) => state.hasPermission);

	return useMemo(
		() => ({
			canManageLeads: hasPermission(SALES_PERMISSIONS.MANAGE_LEADS),
			canViewLeads: hasPermission(SALES_PERMISSIONS.VIEW_LEADS),
			canCreateLeads: hasPermission(SALES_PERMISSIONS.CREATE_LEADS),
			canEditLeads: hasPermission(SALES_PERMISSIONS.EDIT_LEADS),
			canDeleteLeads: hasPermission(SALES_PERMISSIONS.DELETE_LEADS),
			canConvertLeads: hasPermission(SALES_PERMISSIONS.CONVERT_LEADS),
			canManageContracts: hasPermission(SALES_PERMISSIONS.MANAGE_CONTRACTS),
			canViewContracts: hasPermission(SALES_PERMISSIONS.VIEW_CONTRACTS),
			canCreateContracts: hasPermission(SALES_PERMISSIONS.CREATE_CONTRACTS),
			canEditContracts: hasPermission(SALES_PERMISSIONS.EDIT_CONTRACTS),
			canDeleteContracts: hasPermission(SALES_PERMISSIONS.DELETE_CONTRACTS),
			canSignContracts: hasPermission(SALES_PERMISSIONS.SIGN_CONTRACTS),
		}),
		[hasPermission]
	);
}

export function useEmployeePermissions() {
	const hasPermission = useAuthStore((state) => state.hasPermission);

	return useMemo(
		() => ({
			canManageUsers: hasPermission(EMPLOYEE_PERMISSIONS.MANAGE_USERS),
			canViewUsers: hasPermission(EMPLOYEE_PERMISSIONS.VIEW_USERS),
			canCreateUsers: hasPermission(EMPLOYEE_PERMISSIONS.CREATE_USERS),
			canEditUsers: hasPermission(EMPLOYEE_PERMISSIONS.EDIT_USERS),
			canDeleteUsers: hasPermission(EMPLOYEE_PERMISSIONS.DELETE_USERS),
			canManageRoles: hasPermission(EMPLOYEE_PERMISSIONS.MANAGE_ROLES),
			canViewRoles: hasPermission(EMPLOYEE_PERMISSIONS.VIEW_ROLES),
			canManageProjectMembers: hasPermission(EMPLOYEE_PERMISSIONS.MANAGE_PROJECT_MEMBERS),
			canViewProjectMembers: hasPermission(EMPLOYEE_PERMISSIONS.VIEW_PROJECT_MEMBERS),
			canAddProjectMembers: hasPermission(EMPLOYEE_PERMISSIONS.ADD_PROJECT_MEMBERS),
			canRemoveProjectMembers: hasPermission(EMPLOYEE_PERMISSIONS.REMOVE_PROJECT_MEMBERS),
		}),
		[hasPermission]
	);
}
