"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/entities/user/model/auth.store";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CanProps {
	/**
	 * A single permission string, or an array of permission strings.
	 *
	 * - Single string          → user must have that one permission.
	 * - Array (default OR)     → user must have AT LEAST ONE permission.
	 * - Array + allOf={true}   → user must have ALL permissions (AND).
	 */
	permission: string | string[];
	/** When true and permission is an array, requires ALL permissions (AND logic).
	 *  Default is false (OR logic). */
	allOf?: boolean;
	/** Rendered when the permission check passes. */
	children: ReactNode;
	/** Rendered when the permission check fails. Defaults to null. */
	fallback?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Can — declarative permission gate
//
// Usage:
//   // Single permission
//   <Can permission="create_projects">
//     <CreateProjectButton />
//   </Can>
//
//   // OR — user needs at least one of these
//   <Can permission={["manage_tasks", "work_on_tasks"]}>
//     <TaskActions />
//   </Can>
//
//   // AND — user needs all of these
//   <Can permission={["manage_tasks", "assign_tasks"]} allOf>
//     <AssignAndManagePanel />
//   </Can>
//
//   // With fallback
//   <Can permission="delete_users" fallback={<span>No access</span>}>
//     <DeleteUserButton />
//   </Can>
// ─────────────────────────────────────────────────────────────────────────────

export function Can({ permission, allOf = false, children, fallback = null }: CanProps) {
	const hasPermission = useAuthStore((s) => s.hasPermission);
	const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission);
	const hasAllPermissions = useAuthStore((s) => s.hasAllPermissions);

	const granted = (() => {
		if (typeof permission === "string") return hasPermission(permission);
		return allOf ? hasAllPermissions(permission) : hasAnyPermission(permission);
	})();

	return granted ? <>{children}</> : <>{fallback}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// usePermissionGate — imperative variant
//
// Use when you need the boolean directly rather than wrapping JSX.
//
// Usage:
//   const { can, canAny, canAll } = usePermissionGate();
//   if (can("edit_projects")) { ... }
//   if (canAny(["manage_tasks", "work_on_tasks"])) { ... }
// ─────────────────────────────────────────────────────────────────────────────

export function usePermissionGate() {
	const hasPermission = useAuthStore((s) => s.hasPermission);
	const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission);
	const hasAllPermissions = useAuthStore((s) => s.hasAllPermissions);

	return {
		can: (permission: string) => hasPermission(permission),
		canAny: (permissions: string[]) => hasAnyPermission(permissions),
		canAll: (permissions: string[]) => hasAllPermissions(permissions),
	};
}
