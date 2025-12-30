import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
	userId: number;
	name: string;
	email: string;
	avatar: string;
	role: string;
}

export interface Permission {
	permissionName: string;
	access: boolean;
}

interface AuthState {
	user: User | null;
	token: string | null;
	tokenExpiresAt: string | null;
	role: string | null;
	permissions: Permission[];
	isAuthenticated: boolean;

	// Actions
	setAuth: (data: { user: User; token: string; expiresIn: number; role: string; permissions: Permission[] }) => void;
	logout: () => void;
	hasPermission: (permissionName: string) => boolean;
	updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			tokenExpiresAt: null,
			role: null,
			permissions: [],
			isAuthenticated: false,

			setAuth: ({ user, token, expiresIn, role, permissions }) => {
				const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000).toISOString();

				// Also store token in localStorage for axios interceptor
				if (typeof window !== "undefined") {
					localStorage.setItem("auth_token", token);
				}

				set({
					user,
					token,
					tokenExpiresAt: expiresAt,
					role,
					permissions,
					isAuthenticated: true,
				});
			},

			logout: () => {
				if (typeof window !== "undefined") {
					localStorage.removeItem("auth_token");
				}

				set({
					user: null,
					token: null,
					tokenExpiresAt: null,
					role: null,
					permissions: [],
					isAuthenticated: false,
				});
			},

			hasPermission: (permissionName: string) => {
				const { permissions, role } = get();

				// Super admin has all permissions
				if (role === "super-admin") return true;

				const permission = permissions.find((p) => p.permissionName === permissionName);
				return permission?.access ?? false;
			},

			updateUser: (userData) => {
				const { user } = get();
				if (user) {
					set({ user: { ...user, ...userData } });
				}
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				tokenExpiresAt: state.tokenExpiresAt,
				role: state.role,
				permissions: state.permissions,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
