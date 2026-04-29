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

export interface SavedAccount {
	email: string;
	name: string;
	avatar: string;
	role: string;
}

export interface AuthState {
	user: User | null;
	token: string | null;
	tokenExpiresAt: string | null;
	role: string | null;
	permissions: Permission[];
	isAuthenticated: boolean;
	savedAccounts: SavedAccount[];
	setAuth: (data: { user: User; token: string; expiresIn: number; role: string; permissions: Permission[] }) => void;
	logout: () => void;
	hasPermission: (permissionName: string) => boolean;
	updateUser: (user: Partial<User>) => void;
	removeSavedAccount: (email: string) => void;
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
			savedAccounts: [],

			setAuth: ({ user, token, expiresIn, role, permissions }) => {
				const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000).toISOString();

				if (typeof window !== "undefined") {
					localStorage.setItem("auth_token", token);
				}

				set((state) => {
					const filtered = state.savedAccounts.filter((a) => a.email !== user.email);
					const updated: SavedAccount[] = [
						{ email: user.email, name: user.name, avatar: user.avatar, role },
						...filtered,
					].slice(0, 5);

					return {
						user,
						token,
						tokenExpiresAt: expiresAt,
						role,
						permissions,
						isAuthenticated: true,
						savedAccounts: updated,
					};
				});
			},

			removeSavedAccount: (email) => {
				set((state) => ({
					savedAccounts: state.savedAccounts.filter((a) => a.email !== email),
				}));
			},

			logout: () => {
				if (typeof window !== "undefined") {
					localStorage.removeItem("auth_token");
				}

				const { savedAccounts } = get();

				set({
					user: null,
					token: null,
					tokenExpiresAt: null,
					role: null,
					permissions: [],
					isAuthenticated: false,
					savedAccounts,
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
			name: "auth-storage",
			partialize: (state) => ({
				savedAccounts: state.savedAccounts,
			}),
		}
	)
);