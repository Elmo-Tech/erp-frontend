/**
 * Admin Permissions Hooks
 * Hooks for checking user permissions and conditional UI rendering.
 *
 * Requirements: 18.1-18.6
 */

import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Permission names used in the admin module
 */
export const ADMIN_PERMISSIONS = {
	VIEW_ADMIN_STATS: "view_admin_stats",
	VIEW_INTERNAL_COSTS: "view_internal_costs",
	MANAGE_ROLES: "manage_roles",
	MANAGE_INTERNAL_COSTS: "manage_internal_costs",
	VIEW_AUDIT_LOGS: "view_audit_logs",
	VIEW_INTERNAL_NOTES: "view_internal_notes",
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
			canViewAdminStats: hasPermission(ADMIN_PERMISSIONS.VIEW_ADMIN_STATS),
			canViewInternalCosts: hasPermission(ADMIN_PERMISSIONS.VIEW_INTERNAL_COSTS),
			canManageRoles: hasPermission(ADMIN_PERMISSIONS.MANAGE_ROLES),
			canManageInternalCosts: hasPermission(ADMIN_PERMISSIONS.MANAGE_INTERNAL_COSTS),
			canViewAuditLogs: hasPermission(ADMIN_PERMISSIONS.VIEW_AUDIT_LOGS),
			canViewInternalNotes: hasPermission(ADMIN_PERMISSIONS.VIEW_INTERNAL_NOTES),
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
