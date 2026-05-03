import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

export interface AuthState {
	user: User | null;
	token: string | null;
	tokenExpiresAt: string | null;
	role: string | null;
	permissions: Permission[];
	isAuthenticated: boolean;
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

				if (role === "super-admin") {
					return true;
				}

				const permission = permissions.find((item) => item.permissionName === permissionName);
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
			name: "auth-storage", // نفس الـ key اللي كان بيستخدمه base.ts
			storage: createJSONStorage(() => localStorage),
			// نحفظ بس الـ fields المهمة، مش الـ actions
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				tokenExpiresAt: state.tokenExpiresAt,
				role: state.role,
				permissions: state.permissions,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
