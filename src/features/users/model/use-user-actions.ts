"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/user.api";
import { userKeys } from "@/entities/user/model/query-keys";
import type { AssignUserRolesPayload, CreateUserPayload, UpdateUserPayload, User, UserFilters, UserListResponse } from "@/entities/user/model/types";

export function useUsers(filters?: UserFilters) {
	return useQuery<UserListResponse, Error>({
		queryKey: userKeys.list(filters),
		queryFn: () => userApi.getUsers(filters),
	});
}

export function useUser(id: number, enabled = true) {
	return useQuery<User, Error>({
		queryKey: userKeys.detail(id),
		queryFn: () => userApi.getUser(id),
		enabled: enabled && Boolean(id),
	});
}

export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation<User, Error, CreateUserPayload>({
		mutationFn: userApi.createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
	});
}

export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation<User, Error, { id: number; payload: UpdateUserPayload }>({
		mutationFn: ({ id, payload }) => userApi.updateUser(id, payload),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: userApi.deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
	});
}

export function useToggleUserStatus() {
	const queryClient = useQueryClient();

	return useMutation<User, Error, number>({
		mutationFn: userApi.toggleUserStatus,
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
	});
}

export function useAssignUserRoles() {
	const queryClient = useQueryClient();

	return useMutation<User, Error, { id: number; payload: AssignUserRolesPayload }>({
		mutationFn: ({ id, payload }) => userApi.assignUserRoles(id, payload),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
	});
}
