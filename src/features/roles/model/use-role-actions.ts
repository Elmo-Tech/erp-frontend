"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/user.api";
import { userKeys } from "@/entities/user/model/query-keys";
import type { CreateRolePayload, Permission, Role, RoleListResponse, UpdateRolePayload } from "@/entities/user/model/types";

export function useRoles(enabled = true) {
	return useQuery<RoleListResponse, Error>({
		queryKey: userKeys.roles(),
		queryFn: userApi.getRoles,
		enabled,
		staleTime: 5 * 60 * 1000,
	});
}

export function usePermissions(enabled = true) {
	return useQuery<Permission[], Error>({
		queryKey: userKeys.permissions(),
		queryFn: userApi.getPermissions,
		enabled,
		staleTime: 30 * 60 * 1000,
	});
}

export function useCreateRole() {
	const queryClient = useQueryClient();

	return useMutation<Role, Error, CreateRolePayload>({
		mutationFn: userApi.createRole,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.roles() });
		},
	});
}

export function useUpdateRole() {
	const queryClient = useQueryClient();

	return useMutation<Role, Error, { id: number; payload: UpdateRolePayload }>({
		mutationFn: ({ id, payload }) => userApi.updateRole(id, payload),
		onSuccess: (role) => {
			queryClient.setQueryData(userKeys.role(role.id), role);
			queryClient.invalidateQueries({ queryKey: userKeys.roles() });
		},
	});
}

export function useDeleteRole() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: userApi.deleteRole,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.roles() });
		},
	});
}
