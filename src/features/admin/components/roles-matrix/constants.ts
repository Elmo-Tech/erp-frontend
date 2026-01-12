/**
 * Roles Matrix Constants
 */

import { Permission } from "../../types";

/**
 * Protected role names that cannot be edited
 * Requirement 11.6: Disable editing for system-protected roles
 */
export const PROTECTED_ROLES = ["admin", "client"];

/**
 * Group permissions by their group property for better organization
 */
export const groupPermissions = (permissions: Permission[]): Record<string, Permission[]> => {
	return permissions.reduce((acc, permission) => {
		const group = permission.group || "Other";
		if (!acc[group]) {
			acc[group] = [];
		}
		acc[group].push(permission);
		return acc;
	}, {} as Record<string, Permission[]>);
};

/**
 * Format permission name for display
 * Converts snake_case to Title Case
 */
export const formatPermissionName = (name: string): string => {
	return name
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};
