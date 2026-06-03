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
				const perm = permissions.find((p) => p.permissionName === permissionName);
				return perm?.access ?? false;
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
	const hasPermission = useAuthStore((s) => s.hasPermission);
	const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission);
	const hasAllPermissions = useAuthStore((s) => s.hasAllPermissions);

	return useMemo(
		() => ({ hasPermission, hasAnyPermission, hasAllPermissions }),
		// Store actions are stable references — this memo only re-runs when the
		// store instance itself changes (practically never).
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
}
