/**
 * Admin Users API
 * API functions for user management (CRUD).
 */

import api from "@/lib/axios";
import { User, UsersListResponse, UsersFilters, CreateUserPayload, UpdateUserPayload, AssignRolesPayload } from "../types";

/**
 * API functions for user management operations
 * All endpoints require manage_users permission
 */
export const usersApi = {
	/**
	 * Get paginated list of users with filters
	 * GET /api/v1/admin/users/manage
	 */
	getAll: async (filters?: UsersFilters): Promise<UsersListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) params.append("filter[search]", filters.search);
		if (filters?.role) params.append("filter[role]", filters.role);
		if (filters?.isActive !== undefined) params.append("filter[isActive]", String(filters.isActive));
		if (filters?.sort) params.append("sort", filters.sort);
		if (filters?.page) params.append("page", String(filters.page));
		if (filters?.perPage) params.append("perPage", String(filters.perPage));

		const response = await api.get<{ data: UsersListResponse }>(`/admin/users/manage?${params.toString()}`);
		return response.data.data;
	},

	/**
	 * Get a single user by ID
	 * GET /api/v1/admin/users/manage/{id}
	 */
	getById: async (id: number): Promise<User> => {
		const response = await api.get<{ data: { user: User } }>(`/admin/users/manage/${id}`);
		return response.data.data.user;
	},

	/**
	 * Create a new user
	 * POST /api/v1/admin/users/manage
	 */
	create: async (payload: CreateUserPayload): Promise<User> => {
		const response = await api.post<{ data: { user: User } }>("/admin/users/manage", payload);
		return response.data.data.user;
	},

	/**
	 * Update a user
	 * PUT /api/v1/admin/users/manage/{id}
	 */
	update: async (id: number, payload: UpdateUserPayload): Promise<User> => {
		const response = await api.put<{ data: { user: User } }>(`/admin/users/manage/${id}`, payload);
		return response.data.data.user;
	},

	/**
	 * Delete a user
	 * DELETE /api/v1/admin/users/manage/{id}
	 */
	delete: async (id: number): Promise<void> => {
		await api.delete(`/admin/users/manage/${id}`);
	},

	/**
	 * Toggle user active status
	 * POST /api/v1/admin/users/manage/{id}/toggle-status
	 */
	toggleStatus: async (id: number): Promise<User> => {
		const response = await api.post<{ data: { user: User } }>(`/admin/users/manage/${id}/toggle-status`);
		return response.data.data.user;
	},

	/**
	 * Assign roles to a user
	 * PUT /api/v1/admin/users/manage/{id}/roles
	 */
	assignRoles: async (id: number, payload: AssignRolesPayload): Promise<User> => {
		const response = await api.put<{ data: { user: User } }>(`/admin/users/manage/${id}/roles`, payload);
		return response.data.data.user;
	},
};
