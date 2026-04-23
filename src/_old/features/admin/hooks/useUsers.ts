/**
 * Users Management Hooks
 * TanStack Query hooks for user CRUD operations.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users";
import { UsersFilters, CreateUserPayload, UpdateUserPayload, AssignRolesPayload } from "../types";

const USERS_QUERY_KEY = "admin-users";

/**
 * Hook to fetch paginated users list
 */
export function useUsers(filters?: UsersFilters) {
	return useQuery({
		queryKey: [USERS_QUERY_KEY, filters],
		queryFn: () => usersApi.getAll(filters),
	});
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(id: number) {
	return useQuery({
		queryKey: [USERS_QUERY_KEY, id],
		queryFn: () => usersApi.getById(id),
		enabled: !!id,
	});
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
		},
	});
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) => usersApi.update(id, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, variables.id] });
		},
	});
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => usersApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
		},
	});
}

/**
 * Hook to toggle user active status
 */
export function useToggleUserStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => usersApi.toggleStatus(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, id] });
		},
	});
}

/**
 * Hook to assign roles to a user
 */
export function useAssignRoles() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: AssignRolesPayload }) => usersApi.assignRoles(id, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, variables.id] });
		},
	});
}
