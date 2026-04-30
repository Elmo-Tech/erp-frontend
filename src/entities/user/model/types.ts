export interface User {
	userId: number;
	name: string;
	email: string;
	emailVerifiedAt?: string | null;
	avatar?: string | null;
	skills: string[];
	roles: string[];
	specialization?: string | null;
	isActive: boolean;
	internalHourlyCost?: number | null;
	graceDaysRemaining?: number;
	graceDaysAllowed?: number;
	graceDaysUsed?: number;
	createdAt: string;
	updatedAt: string;
}

export interface UserPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface UserListResponse {
	users: User[];
	pagination: UserPagination;
}

export interface InternalUser {
	id: number;
	name: string;
	email: string;
	role: string | null;
}

export interface InternalUserListResponse {
	users: InternalUser[];
}

export interface UserFilters {
	search?: string;
	role?: string;
	isActive?: boolean;
	sort?: string;
	page?: number;
	perPage?: number;
}

export interface CreateUserPayload {
	name: string;
	email: string;
	password: string;
	password_confirmation: string;
	skills?: string[];
	roles?: string[];
	specialization?: string;
	isActive?: boolean;
	internalHourlyCost?: number;
}

export interface UpdateUserPayload {
	name?: string;
	email?: string;
	password?: string;
	password_confirmation?: string;
	skills?: string[];
	roles?: string[];
	specialization?: string;
	isActive?: boolean;
	internalHourlyCost?: number;
}

export interface AssignUserRolesPayload {
	roles: string[];
}

export interface Permission {
	name: string;
	description: string;
	group: string;
}

export interface Role {
	id: number;
	name: string;
	guardName?: string;
	permissions: string[];
	isProtected?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface RoleListResponse {
	roles: Role[];
}

export interface CreateRolePayload {
	name: string;
	permissions: string[];
}

export interface UpdateRolePayload {
	name?: string;
	permissions: string[];
}

export interface AuditLog {
	id: number;
	userId?: number | null;
	userName?: string | null;
	action: string;
	eventType?: string;
	severity?: string;
	description: string;
	auditableType?: string | null;
	auditableId?: number | null;
	ipAddress?: string | null;
	userAgent?: string | null;
	createdAt: string;
	isSensitive?: boolean;
	metadata?: Record<string, unknown>;
}

export interface AuditLogPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface AuditLogListResponse {
	auditLogs: AuditLog[];
	pagination: AuditLogPagination;
}

export interface AuditLogFilters {
	action?: string;
	userId?: number;
	dateFrom?: string;
	dateTo?: string;
	resourceId?: number;
	page?: number;
	perPage?: number;
}

export interface UserProfile {
	userId: number;
	name: string;
	email: string;
	avatar: string;
	emailVerifiedAt: string | null;
	skills: string[];
	createdAt: string;
	updatedAt: string;
}

export interface ProfileResponse {
	success: boolean;
	message: string;
	data: {
		profile: UserProfile;
		role: string;
		permissions: Array<{
			permissionName: string;
			access: boolean;
		}>;
	};
}

export interface UpdateProfilePayload {
	name: string;
}

export interface UpdateProfileResponse {
	success: boolean;
	message: string;
	data: {
		profile: UserProfile;
	};
}

export interface UpdateAvatarResponse {
	success: boolean;
	message: string;
	data: {
		avatar: string;
	};
}

export interface ChangePasswordPayload {
	current_password: string;
	new_password: string;
	new_password_confirmation: string;
}

export interface ApiMessageResponse {
	success: boolean;
	message?: string;
}
