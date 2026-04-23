/**
 * Admin Roles API
 * API functions for role and permission management.
 *
 * Requirements: 8.1-8.8, 11.1-11.6
 */

import api from "@/shared/api/base";
import { Role, RolesListResponse, CreateRolePayload, UpdateRolePayload, Permission, UpdateInternalCostPayload, BulkUpdateInternalCostPayload } from "../types";

/**
 * API functions for role management operations
 * All endpoints require manage_roles permission
 */
export const rolesApi = {
	/**
	 * Get all roles with their permissions
	 * Requirement 8.1: GET /api/v1/admin/roles endpoint to list all roles
	 */
	getAll: async (): Promise<RolesListResponse> => {
		const response = await api.get<{ data: Role[] }>("/admin/roles");
		// API returns array directly, wrap it in expected format
		return { roles: response.data.data };
	},

	/**
	 * Get a single role by ID with permissions
	 * Requirement 8.2: GET /api/v1/admin/roles/{id} endpoint
	 */
	getById: async (id: number): Promise<Role> => {
		const response = await api.get<{ data: Role }>(`/admin/roles/${id}`);
		return response.data.data;
	},

	/**
	 * Create a new role
	 * Requirement 8.3: POST /api/v1/admin/roles endpoint
	 */
	create: async (payload: CreateRolePayload): Promise<Role> => {
		const response = await api.post<{ data: Role }>("/admin/roles", payload);
		return response.data.data;
	},

	/**
	 * Update a role's permissions
	 * Requirement 8.4: PUT /api/v1/admin/roles/{id} endpoint
	 */
	update: async (id: number, payload: UpdateRolePayload): Promise<Role> => {
		const response = await api.put<{ data: Role }>(`/admin/roles/${id}`, payload);
		return response.data.data;
	},

	/**
	 * Delete a role
	 * Requirement 8.5: DELETE /api/v1/admin/roles/{id} endpoint
	 * Requirement 8.8: System prevents deletion of protected roles
	 */
	delete: async (id: number): Promise<void> => {
		await api.delete(`/admin/roles/${id}`);
	},

	/**
	 * Get all available permissions
	 * Requirement 8.6: GET /api/v1/admin/permissions endpoint
	 */
	getPermissions: async (): Promise<Permission[]> => {
		const response = await api.get<{ data: Permission[] }>("/admin/permissions");
		// API returns array directly
		return response.data.data;
	},
};

/**
 * API functions for user internal cost management
 * All endpoints require manage_internal_costs permission
 * Requirements: 9.1-9.6, 16.1-16.6
 */
export const userCostApi = {
	/**
	 * Get all users with internal cost information
	 * Requirement 16.2: Display user list with cost fields
	 */
	getAllUsers: async (): Promise<{ users: Array<{ userId: number; name: string; email: string; internalHourlyCost?: number }> }> => {
		const response = await api.get<{ data: { users: Array<{ userId: number; name: string; email: string; internalHourlyCost?: number }> } }>("/admin/users");
		return response.data.data;
	},

	/**
	 * Update a user's internal hourly cost
	 * Requirement 9.1: PUT /api/v1/admin/users/{id}/internal-cost endpoint
	 * Requirement 9.2: Validate positive decimal value
	 * Requirement 9.4: Log change to audit_logs
	 * Requirement 9.5: Response does not include actual cost value
	 */
	updateInternalCost: async (userId: number, payload: UpdateInternalCostPayload): Promise<{ success: boolean; message: string }> => {
		const response = await api.put<{ success: boolean; message: string }>(`/admin/users/${userId}/internal-cost`, payload);
		return response.data;
	},

	/**
	 * Bulk update internal costs for multiple users
	 * Requirement 9.6: PUT /api/v1/admin/users/internal-costs endpoint
	 */
	bulkUpdateInternalCosts: async (payload: BulkUpdateInternalCostPayload): Promise<{ success: boolean; message: string }> => {
		const response = await api.put<{ success: boolean; message: string }>("/admin/users/internal-costs", payload);
		return response.data;
	},
};
