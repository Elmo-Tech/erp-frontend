import { useCallback, useMemo } from "react";
import { isPermissionGranted, useAuthStore } from "./auth.store";

function usePermissionChecker() {
	const permissions = useAuthStore((state) => state.permissions);
	return useCallback((permissionName: string) => isPermissionGranted(permissions, permissionName), [permissions]);
}

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
	VIEW_TASK_CONTROL: "view_task_control",
	CREATE_TASKS: "create_tasks",
	EDIT_TASKS: "edit_tasks",
	DELETE_TASKS: "delete_tasks",
	VIEW_INTERNAL_NOTES: "view_internal_notes",
	CREATE_INTERNAL_NOTES: "create_internal_notes",
	ASSIGN_TASKS: "assign_tasks",
	WORK_ON_TASKS: "work_on_tasks",
	CHANGE_TASK_STATUS: "change_task_status",
	COMPLETE_TASKS: "complete_tasks",
	REOPEN_TASKS: "reopen_tasks",
	MANAGE_DELIVERABLES: "manage_deliverables",
	CREATE_PROJECT_TASK_DELIVERABLES: "create_project_task_deliverables",
	EDIT_PROJECT_TASK_DELIVERABLES: "edit_project_task_deliverables",
	DELETE_PROJECT_TASK_DELIVERABLES: "delete_project_task_deliverables",
	TOGGLE_PROJECT_TASK_DELIVERABLES: "toggle_project_task_deliverables",
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
	VIEW_QUOTATIONS: "view_quotations",
	CREATE_QUOTATIONS: "create_quotations",
	EDIT_QUOTATIONS: "edit_quotations",
	DELETE_QUOTATIONS: "delete_quotations",
	CALCULATE_QUOTATIONS: "calculate_quotations",
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
	TOGGLE_USER_STATUS: "toggle_user_status",
	ASSIGN_USER_ROLES: "assign_user_roles",
	RESET_USER_CREDENTIALS: "reset_user_credentials",
	MANAGE_EMPLOYEES: "manage_employees",
	VIEW_EMPLOYEES: "view_employees",
	CREATE_EMPLOYEES: "create_employees",
	EDIT_EMPLOYEES: "edit_employees",
	DELETE_EMPLOYEES: "delete_employees",
	VIEW_EMPLOYEE_SALARY: "view_employee_salary",
	VIEW_EMPLOYEE_PERFORMANCE: "view_employee_performance",
	MANAGE_ROLES: "manage_roles",
	VIEW_ROLES: "view_roles",
	CREATE_ROLES: "create_roles",
	EDIT_ROLES: "edit_roles",
	DELETE_ROLES: "delete_roles",
	MANAGE_PROTECTED_USERS: "manage_protected_users",
	MANAGE_PROJECT_MEMBERS: "manage_project_members",
	VIEW_PROJECT_MEMBERS: "view_project_members",
	ADD_PROJECT_MEMBERS: "add_project_members",
	REMOVE_PROJECT_MEMBERS: "remove_project_members",
} as const;

export const POINT_PERMISSIONS = {
	MANAGE_POINTS: "manage_points",
	AWARD_POINTS: "award_points",
	DEDUCT_POINTS: "deduct_points",
} as const;

export function useClientPermissions() {
	const hasPermission = usePermissionChecker();

	return useMemo(() => {
		const canManageClients = hasPermission(CLIENT_PERMISSIONS.MANAGE_CLIENTS);

		return {
			canManageClients,
			canViewClients: canManageClients || hasPermission(CLIENT_PERMISSIONS.VIEW_CLIENTS),
			canCreateClients: canManageClients || hasPermission(CLIENT_PERMISSIONS.CREATE_CLIENTS),
			canEditClients: canManageClients || hasPermission(CLIENT_PERMISSIONS.EDIT_CLIENTS),
			canDeleteClients: canManageClients || hasPermission(CLIENT_PERMISSIONS.DELETE_CLIENTS),
		};
	}, [hasPermission]);
}

export function useProjectPermissions() {
	const hasPermission = usePermissionChecker();

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
		[hasPermission],
	);
}

export function useMeetingPermissions() {
	const hasPermission = usePermissionChecker();

	return useMemo(
		() => ({
			canScheduleMeetings: hasPermission(MEETING_PERMISSIONS.SCHEDULE_MEETINGS),
		}),
		[hasPermission],
	);
}

export function useTaskPermissions() {
	const hasPermission = usePermissionChecker();

	return useMemo(() => {
		const canManageTasks = hasPermission(TASK_PERMISSIONS.MANAGE_TASKS);

		return {
			canManageTasks,
			canViewTasks: canManageTasks || hasPermission(TASK_PERMISSIONS.VIEW_TASKS),
			canViewTaskControl: hasPermission(TASK_PERMISSIONS.VIEW_TASK_CONTROL),
			canCreateTasks: canManageTasks || hasPermission(TASK_PERMISSIONS.CREATE_TASKS),
			canEditTasks: canManageTasks || hasPermission(TASK_PERMISSIONS.EDIT_TASKS),
			canDeleteTasks: canManageTasks || hasPermission(TASK_PERMISSIONS.DELETE_TASKS),
			canViewInternalNotes: hasPermission(TASK_PERMISSIONS.VIEW_INTERNAL_NOTES),
			canCreateInternalNotes: hasPermission(TASK_PERMISSIONS.CREATE_INTERNAL_NOTES),
			canAssignTasks: hasPermission(TASK_PERMISSIONS.ASSIGN_TASKS),
			canWorkOnTasks: hasPermission(TASK_PERMISSIONS.WORK_ON_TASKS),
			canChangeTaskStatus: canManageTasks || hasPermission(TASK_PERMISSIONS.CHANGE_TASK_STATUS),
			canCompleteTasks: canManageTasks || hasPermission(TASK_PERMISSIONS.COMPLETE_TASKS),
			canReopenTasks: canManageTasks || hasPermission(TASK_PERMISSIONS.REOPEN_TASKS),
			canManageDeliverables: hasPermission(TASK_PERMISSIONS.MANAGE_DELIVERABLES),
			canCreateProjectTaskDeliverables: hasPermission(TASK_PERMISSIONS.CREATE_PROJECT_TASK_DELIVERABLES),
			canEditProjectTaskDeliverables: hasPermission(TASK_PERMISSIONS.EDIT_PROJECT_TASK_DELIVERABLES),
			canDeleteProjectTaskDeliverables: hasPermission(TASK_PERMISSIONS.DELETE_PROJECT_TASK_DELIVERABLES),
			canToggleProjectTaskDeliverables: canManageTasks || hasPermission(TASK_PERMISSIONS.TOGGLE_PROJECT_TASK_DELIVERABLES),
		};
	}, [hasPermission]);
}

export function useInvoicePermissions() {
	const hasPermission = usePermissionChecker();

	return useMemo(() => {
		const canManageInvoices = hasPermission(INVOICE_PERMISSIONS.MANAGE_INVOICES);

		return {
			canManageInvoices,
			canViewInvoices: canManageInvoices || hasPermission(INVOICE_PERMISSIONS.VIEW_INVOICES),
			canCreateInvoices: canManageInvoices || hasPermission(INVOICE_PERMISSIONS.CREATE_INVOICES),
			canEditInvoices: canManageInvoices || hasPermission(INVOICE_PERMISSIONS.EDIT_INVOICES),
			canDeleteInvoices: canManageInvoices || hasPermission(INVOICE_PERMISSIONS.DELETE_INVOICES),
			canSendInvoices: canManageInvoices || hasPermission(INVOICE_PERMISSIONS.SEND_INVOICES),
			canCancelInvoices: canManageInvoices || hasPermission(INVOICE_PERMISSIONS.CANCEL_INVOICES),
		};
	}, [hasPermission]);
}

export function useSalesPermissions() {
	const hasPermission = usePermissionChecker();

	return useMemo(() => {
		const canManageLeads = hasPermission(SALES_PERMISSIONS.MANAGE_LEADS);
		const canManageContracts = hasPermission(SALES_PERMISSIONS.MANAGE_CONTRACTS);

		return {
			canManageLeads,
			canViewLeads: canManageLeads || hasPermission(SALES_PERMISSIONS.VIEW_LEADS),
			canCreateLeads: canManageLeads || hasPermission(SALES_PERMISSIONS.CREATE_LEADS),
			canEditLeads: canManageLeads || hasPermission(SALES_PERMISSIONS.EDIT_LEADS),
			canDeleteLeads: canManageLeads || hasPermission(SALES_PERMISSIONS.DELETE_LEADS),
			canConvertLeads: canManageLeads || hasPermission(SALES_PERMISSIONS.CONVERT_LEADS),
			canViewQuotations: canManageLeads || hasPermission(SALES_PERMISSIONS.VIEW_QUOTATIONS),
			canCreateQuotations: canManageLeads || hasPermission(SALES_PERMISSIONS.CREATE_QUOTATIONS),
			canEditQuotations: canManageLeads || hasPermission(SALES_PERMISSIONS.EDIT_QUOTATIONS),
			canDeleteQuotations: canManageLeads || hasPermission(SALES_PERMISSIONS.DELETE_QUOTATIONS),
			canCalculateQuotations: canManageLeads || hasPermission(SALES_PERMISSIONS.CALCULATE_QUOTATIONS),
			canManageContracts,
			canViewContracts: canManageContracts || hasPermission(SALES_PERMISSIONS.VIEW_CONTRACTS),
			canCreateContracts: canManageContracts || hasPermission(SALES_PERMISSIONS.CREATE_CONTRACTS),
			canEditContracts: canManageContracts || hasPermission(SALES_PERMISSIONS.EDIT_CONTRACTS),
			canDeleteContracts: canManageContracts || hasPermission(SALES_PERMISSIONS.DELETE_CONTRACTS),
			canSignContracts: canManageContracts || hasPermission(SALES_PERMISSIONS.SIGN_CONTRACTS),
		};
	}, [hasPermission]);
}

export function useEmployeePermissions() {
	const hasPermission = usePermissionChecker();

	return useMemo(() => {
		const canManageUsers = hasPermission(EMPLOYEE_PERMISSIONS.MANAGE_USERS);
		const canManageEmployees = hasPermission(EMPLOYEE_PERMISSIONS.MANAGE_EMPLOYEES);
		const canManageRoles = hasPermission(EMPLOYEE_PERMISSIONS.MANAGE_ROLES);

		return {
			canManageUsers,
			canViewUsers: canManageUsers || hasPermission(EMPLOYEE_PERMISSIONS.VIEW_USERS),
			canCreateUsers: canManageUsers || hasPermission(EMPLOYEE_PERMISSIONS.CREATE_USERS),
			canEditUsers: canManageUsers || hasPermission(EMPLOYEE_PERMISSIONS.EDIT_USERS),
			canDeleteUsers: hasPermission(EMPLOYEE_PERMISSIONS.DELETE_USERS),
			canToggleUserStatus: hasPermission(EMPLOYEE_PERMISSIONS.TOGGLE_USER_STATUS),
			canAssignUserRoles: hasPermission(EMPLOYEE_PERMISSIONS.ASSIGN_USER_ROLES),
			canResetUserCredentials: hasPermission(EMPLOYEE_PERMISSIONS.RESET_USER_CREDENTIALS),
			canManageEmployees,
			canViewEmployees: canManageEmployees || hasPermission(EMPLOYEE_PERMISSIONS.VIEW_EMPLOYEES),
			canCreateEmployees: canManageEmployees || hasPermission(EMPLOYEE_PERMISSIONS.CREATE_EMPLOYEES),
			canEditEmployees: canManageEmployees || hasPermission(EMPLOYEE_PERMISSIONS.EDIT_EMPLOYEES),
			canDeleteEmployees: canManageEmployees || hasPermission(EMPLOYEE_PERMISSIONS.DELETE_EMPLOYEES),
			canViewEmployeeSalary: canManageEmployees || hasPermission(EMPLOYEE_PERMISSIONS.VIEW_EMPLOYEE_SALARY),
			canViewEmployeePerformance: canManageEmployees || hasPermission(EMPLOYEE_PERMISSIONS.VIEW_EMPLOYEE_PERFORMANCE),
			canManageRoles,
			canViewRoles: canManageRoles || hasPermission(EMPLOYEE_PERMISSIONS.VIEW_ROLES),
			canCreateRoles: canManageRoles || hasPermission(EMPLOYEE_PERMISSIONS.CREATE_ROLES),
			canEditRoles: canManageRoles || hasPermission(EMPLOYEE_PERMISSIONS.EDIT_ROLES),
			canDeleteRoles: canManageRoles || hasPermission(EMPLOYEE_PERMISSIONS.DELETE_ROLES),
			canManageProtectedUsers: hasPermission(EMPLOYEE_PERMISSIONS.MANAGE_PROTECTED_USERS),
			canManageProjectMembers: hasPermission(EMPLOYEE_PERMISSIONS.MANAGE_PROJECT_MEMBERS),
			canViewProjectMembers: hasPermission(EMPLOYEE_PERMISSIONS.VIEW_PROJECT_MEMBERS),
			canAddProjectMembers: hasPermission(EMPLOYEE_PERMISSIONS.ADD_PROJECT_MEMBERS),
			canRemoveProjectMembers: hasPermission(EMPLOYEE_PERMISSIONS.REMOVE_PROJECT_MEMBERS),
		};
	}, [hasPermission]);
}

export function usePointPermissions() {
	const hasPermission = usePermissionChecker();

	return useMemo(() => {
		const canManagePoints = hasPermission(POINT_PERMISSIONS.MANAGE_POINTS);

		return {
			canManagePoints,
			canAwardPoints: canManagePoints || hasPermission(POINT_PERMISSIONS.AWARD_POINTS),
			canDeductPoints: canManagePoints || hasPermission(POINT_PERMISSIONS.DEDUCT_POINTS),
		};
	}, [hasPermission]);
}
