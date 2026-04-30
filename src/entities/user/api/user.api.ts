import api from "@/shared/api/base";
import { useQuery } from "@tanstack/react-query";
import { userKeys } from "../model/query-keys";
import type { EmployeeFilters, EmployeeListResponse } from "../model/employee";
import type {
	ApiMessageResponse,
	AuditLogFilters,
	AuditLogListResponse,
	AssignUserRolesPayload,
	ChangePasswordPayload,
	CreateRolePayload,
	CreateUserPayload,
	InternalUserListResponse,
	Permission,
	ProfileResponse,
	Role,
	RoleListResponse,
	UpdateAvatarResponse,
	UpdateProfilePayload,
	UpdateProfileResponse,
	UpdateRolePayload,
	UpdateUserPayload,
	User,
	UserFilters,
	UserListResponse,
} from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

function buildEmployeeParams(filters?: EmployeeFilters) {
	const params = new URLSearchParams();

	if (filters?.search) {
		params.append("filter[search]", filters.search);
	}

	if (typeof filters?.isActive === "boolean") {
		params.append("filter[isActive]", String(filters.isActive));
	}

	if (filters?.page) {
		params.append("page", String(filters.page));
	}

	if (filters?.perPage) {
		params.append("perPage", String(filters.perPage));
	}

	return params;
}

function buildUserParams(filters?: UserFilters) {
	const params = new URLSearchParams();

	if (filters?.search) params.append("filter[search]", filters.search);
	if (filters?.role) params.append("filter[role]", filters.role);
	if (typeof filters?.isActive === "boolean") params.append("filter[isActive]", String(filters.isActive));
	if (filters?.sort) params.append("sort", filters.sort);
	if (filters?.page) params.append("page", String(filters.page));
	if (filters?.perPage) params.append("perPage", String(filters.perPage));

	return params;
}

function buildAuditLogParams(filters?: AuditLogFilters) {
	const params = new URLSearchParams();

	if (filters?.action) params.append("filter[action]", filters.action);
	if (filters?.userId) params.append("filter[user_id]", String(filters.userId));
	if (filters?.dateFrom) params.append("filter[date_from]", filters.dateFrom);
	if (filters?.dateTo) params.append("filter[date_to]", filters.dateTo);
	if (filters?.resourceId) params.append("filter[auditable_id]", String(filters.resourceId));
	if (filters?.page) params.append("page", String(filters.page));
	if (filters?.perPage) params.append("perPage", String(filters.perPage));

	return params;
}

function withQuery(path: string, params: URLSearchParams) {
	const query = params.toString();
	return query ? `${path}?${query}` : path;
}

export const userApi = {
	async getEmployees(filters?: EmployeeFilters): Promise<EmployeeListResponse> {
		const response = await api.get<ApiEnvelope<EmployeeListResponse>>(withQuery("/employees", buildEmployeeParams(filters)));

		return response.data.data;
	},

	async getUsers(filters?: UserFilters): Promise<UserListResponse> {
		const response = await api.get<ApiEnvelope<UserListResponse>>(withQuery("/admin/users/manage", buildUserParams(filters)));

		return response.data.data;
	},

	async getInternalUsers(): Promise<InternalUserListResponse> {
		const response = await api.get<ApiEnvelope<InternalUserListResponse>>("/internal-users");

		return response.data.data;
	},

	async getUser(id: number): Promise<User> {
		const response = await api.get<ApiEnvelope<{ user: User }>>(`/admin/users/manage/${id}`);

		return response.data.data.user;
	},

	async createUser(payload: CreateUserPayload): Promise<User> {
		const response = await api.post<ApiEnvelope<{ user: User }>>("/admin/users/manage", payload);

		return response.data.data.user;
	},

	async updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
		const response = await api.put<ApiEnvelope<{ user: User }>>(`/admin/users/manage/${id}`, payload);

		return response.data.data.user;
	},

	async deleteUser(id: number): Promise<void> {
		await api.delete(`/admin/users/manage/${id}`);
	},

	async toggleUserStatus(id: number): Promise<User> {
		const response = await api.post<ApiEnvelope<{ user: User }>>(`/admin/users/manage/${id}/toggle-status`);

		return response.data.data.user;
	},

	async assignUserRoles(id: number, payload: AssignUserRolesPayload): Promise<User> {
		const response = await api.put<ApiEnvelope<{ user: User }>>(`/admin/users/manage/${id}/roles`, payload);

		return response.data.data.user;
	},

	async getRoles(): Promise<RoleListResponse> {
		const response = await api.get<ApiEnvelope<Role[]>>("/admin/roles");

		return { roles: response.data.data };
	},

	async getRole(id: number): Promise<Role> {
		const response = await api.get<ApiEnvelope<Role>>(`/admin/roles/${id}`);

		return response.data.data;
	},

	async getPermissions(): Promise<Permission[]> {
		const response = await api.get<ApiEnvelope<Permission[]>>("/admin/permissions");

		return response.data.data;
	},

	async createRole(payload: CreateRolePayload): Promise<Role> {
		const response = await api.post<ApiEnvelope<Role>>("/admin/roles", payload);

		return response.data.data;
	},

	async updateRole(id: number, payload: UpdateRolePayload): Promise<Role> {
		const response = await api.put<ApiEnvelope<Role>>(`/admin/roles/${id}`, payload);

		return response.data.data;
	},

	async deleteRole(id: number): Promise<void> {
		await api.delete(`/admin/roles/${id}`);
	},

	async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogListResponse> {
		const response = await api.get<ApiEnvelope<AuditLogListResponse>>(withQuery("/admin/audit-logs", buildAuditLogParams(filters)));

		return response.data.data;
	},

	async getAuditLogActionTypes(): Promise<string[]> {
		const response = await api.get<ApiEnvelope<string[]>>("/admin/audit-logs/action-types");

		return response.data.data;
	},

	async getProfile(): Promise<ProfileResponse> {
		const response = await api.get<ProfileResponse>("/auth/profile");

		return response.data;
	},

	async updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
		const response = await api.put<UpdateProfileResponse>("/auth/profile", payload);

		return response.data;
	},

	async updateAvatar(file: File): Promise<UpdateAvatarResponse> {
		const formData = new FormData();
		formData.append("avatar", file);

		const response = await api.post<UpdateAvatarResponse>("/auth/profile/avatar", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});

		return response.data;
	},

	async changePassword(payload: ChangePasswordPayload): Promise<ApiMessageResponse> {
		const response = await api.post<ApiMessageResponse>("/auth/change-password", payload);

		return response.data;
	},
};

export function useGetInternalUsers(enabled = true) {
	return useQuery({
		queryKey: userKeys.internalUsers(),
		queryFn: userApi.getInternalUsers,
		enabled,
		staleTime: 5 * 60 * 1000,
	});
}
