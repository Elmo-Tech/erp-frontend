"use client";

/**
 * features/users/model/use-user-actions.ts
 *
 * React Query hooks for the Users management domain.
 * Imports raw fetchers from entities/user/api/user.api.ts.
 * All mutations invalidate the relevant query keys on success (No-Refresh Rule).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/user.api";
import { userKeys } from "@/entities/user/model/query-keys";
import type { CreateUserPayload, UpdateUserPayload, UserFilters } from "@/entities/user/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

export function useUsers(filters?: UserFilters) {
	return useQuery({
		queryKey: userKeys.list(filters),
		queryFn: () => userApi.getUsers(filters),
		staleTime: 2 * 60 * 1000,
	});
}

export function useUser(id: number, enabled = true) {
	return useQuery({
		queryKey: userKeys.detail(id),
		queryFn: () => userApi.getUser(id),
		enabled: enabled && id > 0,
		staleTime: 5 * 60 * 1000,
	});
}

export function useRoles() {
	return useQuery({
		queryKey: userKeys.roles(),
		queryFn: () => userApi.getRoles(),
		staleTime: 10 * 60 * 1000,
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateUserPayload) => userApi.createUser(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
	});
}

export function useUpdateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) => userApi.updateUser(id, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
			queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => userApi.deleteUser(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
	});
}

export function useToggleUserStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => userApi.toggleUserStatus(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
			queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
		},
	});
}
