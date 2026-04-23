/**
 * Admin Roles Hooks
 * TanStack Query hooks for role and permission management.
 *
 * Requirements: 8.1-8.8, 11.1-11.6
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi, userCostApi } from "../api/roles";
import { Role, RolesListResponse, CreateRolePayload, UpdateRolePayload, Permission, UpdateInternalCostPayload, BulkUpdateInternalCostPayload } from "../types";

/**
 * Query keys for consistent cache management
 */
export const roleKeys = {
	all: ["roles"] as const,
	lists: () => [...roleKeys.all, "list"] as const,
	list: () => [...roleKeys.lists()] as const,
	details: () => [...roleKeys.all, "detail"] as const,
	detail: (id: number) => [...roleKeys.details(), id] as const,
	permissions: () => [...roleKeys.all, "permissions"] as const,
};

export const userCostKeys = {
	all: ["userCosts"] as const,
	users: () => [...userCostKeys.all, "users"] as const,
};

/**
 * Hook to fetch all roles with their permissions
 * Requirement 8.1: GET /api/v1/admin/roles endpoint
 */
export const useRoles = (enabled = true) => {
	return useQuery<RolesListResponse, Error>({
		queryKey: roleKeys.list(),
		queryFn: () => rolesApi.getAll(),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch a single role by ID
 * Requirement 8.2: GET /api/v1/admin/roles/{id} endpoint
 */
export const useRole = (id: number, enabled = true) => {
	return useQuery<Role, Error>({
		queryKey: roleKeys.detail(id),
		queryFn: () => rolesApi.getById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to fetch all available permissions
 * Requirement 8.6: GET /api/v1/admin/permissions endpoint
 */
export const usePermissions = (enabled = true) => {
	return useQuery<Permission[], Error>({
		queryKey: roleKeys.permissions(),
		queryFn: () => rolesApi.getPermissions(),
		enabled,
		staleTime: 30 * 60 * 1000, // 30 minutes - permissions rarely change
		gcTime: 60 * 60 * 1000, // 1 hour
	});
};

/**
 * Hook to create a new role
 * Requirement 8.3: POST /api/v1/admin/roles endpoint
 */
export const useCreateRole = () => {
	const queryClient = useQueryClient();

	return useMutation<Role, Error, CreateRolePayload>({
		mutationFn: rolesApi.create,
		onSuccess: (newRole) => {
			// Invalidate and refetch roles list
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });

			// Add the new role to the cache
			queryClient.setQueryData(roleKeys.detail(newRole.id), newRole);
		},
		onError: (error) => {
			console.error("Failed to create role:", error);
		},
	});
};

/**
 * Hook to update a role's permissions
 * Requirement 8.4: PUT /api/v1/admin/roles/{id} endpoint
 * Requirement 11.3: Update role permissions on checkbox toggle
 */
export const useUpdateRole = () => {
	const queryClient = useQueryClient();

	return useMutation<Role, Error, { id: number; payload: UpdateRolePayload }>({
		mutationFn: ({ id, payload }) => rolesApi.update(id, payload),
		onSuccess: (updatedRole) => {
			// Update the specific role in cache
			queryClient.setQueryData(roleKeys.detail(updatedRole.id), updatedRole);

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		},
		onError: (error) => {
			console.error("Failed to update role:", error);
		},
	});
};

/**
 * Hook to delete a role
 * Requirement 8.5: DELETE /api/v1/admin/roles/{id} endpoint
 * Requirement 8.8: System prevents deletion of protected roles
 */
export const useDeleteRole = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: rolesApi.delete,
		onSuccess: (_, deletedId) => {
			// Remove the role from cache
			queryClient.removeQueries({ queryKey: roleKeys.detail(deletedId) });

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
		},
		onError: (error) => {
			console.error("Failed to delete role:", error);
		},
	});
};

/**
 * Hook to get all users with internal cost information
 * Requirement 16.2: Display user list with cost fields
 */
export const useUsersWithCosts = (enabled = true) => {
	return useQuery<{ users: Array<{ userId: number; name: string; email: string; internalHourlyCost?: number }> }, Error>({
		queryKey: userCostKeys.users(),
		queryFn: () => userCostApi.getAllUsers(),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to update a user's internal hourly cost
 * Requirement 9.1: PUT /api/v1/admin/users/{id}/internal-cost endpoint
 * Requirement 16.5: Validate cost input as positive decimal
 */
export const useUpdateInternalCost = () => {
	const queryClient = useQueryClient();

	return useMutation<{ success: boolean; message: string }, Error, { userId: number; payload: UpdateInternalCostPayload }>({
		mutationFn: ({ userId, payload }) => userCostApi.updateInternalCost(userId, payload),
		onSuccess: () => {
			// Invalidate user cost related queries
			queryClient.invalidateQueries({ queryKey: userCostKeys.all });
		},
		onError: (error) => {
			console.error("Failed to update internal cost:", error);
		},
	});
};

/**
 * Hook to bulk update internal costs for multiple users
 * Requirement 9.6: PUT /api/v1/admin/users/internal-costs endpoint
 */
export const useBulkUpdateInternalCosts = () => {
	const queryClient = useQueryClient();

	return useMutation<{ success: boolean; message: string }, Error, BulkUpdateInternalCostPayload>({
		mutationFn: userCostApi.bulkUpdateInternalCosts,
		onSuccess: () => {
			// Invalidate user cost related queries
			queryClient.invalidateQueries({ queryKey: userCostKeys.all });
		},
		onError: (error) => {
			console.error("Failed to bulk update internal costs:", error);
		},
	});
};

/**
 * Hook to prefetch a role (useful for hover states or navigation)
 */
export const usePrefetchRole = () => {
	const queryClient = useQueryClient();

	return (id: number) => {
		queryClient.prefetchQuery({
			queryKey: roleKeys.detail(id),
			queryFn: () => rolesApi.getById(id),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};
};
