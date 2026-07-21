import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
	userId: number;
	name: string;
	email: string;
	avatar: string;
	/** Primary role string — kept for display/redirect purposes only.
	 *  Do NOT use for access-control decisions; use hasPermission() instead. */
	role: string;
}

/**
 * Permission shape returned by the backend login/profile endpoints.
 * { permissionName: "manage_projects", access: true }
 */
export interface Permission {
	permissionName: string;
	access: boolean;
}

export function isPermissionGranted(permissions: Permission[], permissionName: string): boolean {
	return permissions.some((permission) => permission.permissionName === permissionName && permission.access);
}

export interface AuthState {
	user: User | null;
	token: string | null;
	tokenExpiresAt: string | null;
	/** Kept for display/redirect only — never use for access-control. */
	role: string | null;
	permissions: Permission[];
	isAuthenticated: boolean;

	// ── Actions ──────────────────────────────────────────────────────────────
	setAuth: (data: { user: User; expiresIn: number; role: string; permissions: Permission[] }) => void;
	refreshAuth: (data: { user?: User; expiresIn: number; role?: string; permissions?: Permission[] }) => void;
	syncProfile: (data: { user: User; role: string; permissions: Permission[] }) => void;
	logout: () => void;
	updateUser: (user: Partial<User>) => void;

	// ── Permission helpers ────────────────────────────────────────────────────
	/** Returns true if the user has been granted the given permission. */
	hasPermission: (permissionName: string) => boolean;
	/** Returns true if the user has AT LEAST ONE of the given permissions (OR). */
	hasAnyPermission: (permissionNames: string[]) => boolean;
	/** Returns true if the user has ALL of the given permissions (AND). */
	hasAllPermissions: (permissionNames: string[]) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			tokenExpiresAt: null,
			role: null,
			permissions: [],
			isAuthenticated: false,

			setAuth: ({ user, expiresIn, role, permissions }) => {
				const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000).toISOString();
				set({ user, token: null, tokenExpiresAt: expiresAt, role, permissions, isAuthenticated: true });
			},

			refreshAuth: ({ user, expiresIn, role, permissions }) => {
				const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000).toISOString();
				set((state) => ({
					user: user ?? state.user,
					token: null,
					tokenExpiresAt: expiresAt,
					role: role ?? state.role,
					permissions: permissions ?? state.permissions,
					isAuthenticated: true,
				}));
			},

			syncProfile: ({ user, role, permissions }) => {
				set({ user, role, permissions });
			},

			logout: () => {
				set({
					user: null,
					token: null,
					tokenExpiresAt: null,
					role: null,
					permissions: [],
					isAuthenticated: false,
				});
			},

			updateUser: (userData) => {
				const { user } = get();
				if (user) set({ user: { ...user, ...userData } });
			},

			hasPermission: (permissionName: string) => {
				const { permissions } = get();
				return isPermissionGranted(permissions, permissionName);
			},

			hasAnyPermission: (permissionNames: string[]) => {
				const { hasPermission } = get();
				return permissionNames.some((p) => hasPermission(p));
			},

			hasAllPermissions: (permissionNames: string[]) => {
				const { hasPermission } = get();
				return permissionNames.every((p) => hasPermission(p));
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				user: state.user,
				tokenExpiresAt: state.tokenExpiresAt,
				role: state.role,
				permissions: state.permissions,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);

// ─────────────────────────────────────────────────────────────────────────────
// usePermissions — stable, memoised permission-checking hook
//
// Prefer this over calling useAuthStore directly in components.
//
// Usage:
//   const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
//   if (hasPermission("create_projects")) { ... }
//   if (hasAnyPermission(["manage_tasks", "work_on_tasks"])) { ... }
// ─────────────────────────────────────────────────────────────────────────────

export function usePermissions() {
	const permissions = useAuthStore((state) => state.permissions);

	return useMemo(
		() => ({
			hasPermission: (permissionName: string) => isPermissionGranted(permissions, permissionName),
			hasAnyPermission: (permissionNames: string[]) => permissionNames.some((permissionName) => isPermissionGranted(permissions, permissionName)),
			hasAllPermissions: (permissionNames: string[]) => permissionNames.every((permissionName) => isPermissionGranted(permissions, permissionName)),
		}),
		[permissions],
	);
}
