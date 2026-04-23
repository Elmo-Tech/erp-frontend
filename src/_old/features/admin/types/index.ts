/**
 * Admin Module Types
 * Type definitions for admin features including profitability, quality metrics,
 * user performance, roles, permissions, and audit logs.
 *
 * Requirements: 11-18 (Frontend)
 */

// ============================================================================
// Profitability Types (Requirements 1, 7, 12, 14)
// ============================================================================

/**
 * Profitability data for a single project
 * Requirement 7.1: Project profitability report data
 */
export interface ProfitabilityData {
	projectId: number;
	title: string;
	budget: number;
	totalCost: number;
	profit: number;
	profitMargin: number;
	status: string;
	createdAt: string;
}

/**
 * Pagination metadata for profitability reports
 */
export interface ProfitabilityPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

/**
 * Response structure for profitability report endpoint
 * GET /api/v1/admin/stats/profitability
 */
export interface ProfitabilityReportResponse {
	projects: ProfitabilityData[];
	pagination: ProfitabilityPagination;
}

/**
 * Filters for profitability report queries
 * Requirement 7.2, 7.3, 7.4: Filtering and sorting options
 */
export interface ProfitabilityFilters {
	status?: string;
	dateFrom?: string;
	dateTo?: string;
	sortBy?: "profit" | "margin" | "budget";
	sortDirection?: "asc" | "desc";
	page?: number;
	perPage?: number;
}

/**
 * Overview statistics for admin dashboard
 * Requirement 14.1-14.5: Dashboard summary statistics
 */
export interface AdminOverviewStats {
	totalRevenue: number;
	totalProfit: number;
	overallMargin: number;
	activeProjects: number;
	completedProjects: number;
	teamUtilization: number;
	qualityScore: number;
}

// ============================================================================
// Quality Metrics Types (Requirements 3, 15)
// ============================================================================

/**
 * Task with bounce rate information
 * Requirement 3.4: Top bouncing tasks
 */
export interface BouncingTask {
	taskId: number;
	title: string;
	projectId: number;
	projectTitle: string;
	reopenCount: number;
	assignedTo: string;
	status: string;
}

/**
 * Developer bounce rate statistics
 * Requirement 3.3: Bounce rate per developer
 */
export interface DeveloperBounceRate {
	userId: number;
	name: string;
	totalBounces: number;
	totalTasks: number;
	averageBounceRate: number;
}

/**
 * Project bounce rate statistics
 * Requirement 3.1, 3.2: Project bounce rate
 */
export interface ProjectBounceRate {
	projectId: number;
	title: string;
	totalBounces: number;
	totalTasks: number;
	averageBounceRate: number;
}

/**
 * Quality metrics overview
 * Requirement 15.1-15.6: Quality dashboard data
 */
export interface QualityMetrics {
	overallBounceRate: number;
	qualityScore: number;
	totalBounces: number;
	tasksWithBounces: number;
	topBouncingTasks: BouncingTask[];
	bounceRateByDeveloper: DeveloperBounceRate[];
	bounceRateByProject: ProjectBounceRate[];
}

/**
 * Filters for quality metrics queries
 * Requirement 3.5, 15.5: Date range and project filtering
 */
export interface QualityFilters {
	dateFrom?: string;
	dateTo?: string;
	projectId?: number;
}

// ============================================================================
// User Performance Types (Requirements 5, 13)
// ============================================================================

/**
 * User performance metrics
 * Requirement 5.1-5.5, 13.1-13.5: User performance data
 */
export interface UserPerformance {
	userId: number;
	name: string;
	email: string;
	avatar?: string;
	totalTrackedMinutes: number;
	totalIdleMinutes: number;
	taskCompletionRate: number;
	averageBounceRate: number;
	attendanceDays: number;
	completedTasks: number;
	totalTasks: number;
}

/**
 * Response structure for user performance endpoint
 * GET /api/v1/admin/stats/user-performance
 */
export interface UserPerformanceResponse {
	users: UserPerformance[];
}

/**
 * Filters for user performance queries
 * Requirement 5.5: Date range and aggregation filtering
 */
export interface UserPerformanceFilters {
	dateFrom?: string;
	dateTo?: string;
	userId?: number;
	aggregateBy?: "day" | "week" | "month";
}

// ============================================================================
// Attendance Analytics Types (Requirements 10)
// ============================================================================

/**
 * User with excessive idle time
 * Requirement 10.4: Users with excessive idle time
 */
export interface UserWithExcessiveIdle {
	userId: number;
	name: string;
	totalIdleMinutes: number;
	averageIdleMinutes: number;
}

/**
 * Attendance analytics data
 * Requirement 10.1-10.6: Attendance analytics
 */
export interface AttendanceAnalytics {
	totalLateMinutes: number;
	averageIdleTime: number;
	usersWithExcessiveIdle: UserWithExcessiveIdle[];
}

/**
 * Filters for attendance analytics queries
 * Requirement 10.6: Date range and user filtering
 */
export interface AttendanceFilters {
	dateFrom?: string;
	dateTo?: string;
	userId?: number;
}

// ============================================================================
// Role & Permission Types (Requirements 8, 11)
// ============================================================================

/**
 * Permission definition
 * Requirement 8.6: List all available permissions
 */
export interface Permission {
	name: string;
	description: string;
	group: string;
}

/**
 * Role with permissions
 * Requirement 8.1, 8.2: Role with permissions
 */
export interface Role {
	id: number;
	name: string;
	guardName: string;
	permissions: string[];
	isProtected: boolean;
	createdAt: string;
	updatedAt: string;
}

/**
 * Response structure for roles list endpoint
 * GET /api/v1/admin/roles
 */
export interface RolesListResponse {
	roles: Role[];
}

/**
 * Payload for creating a new role
 * Requirement 8.3: Create new role
 */
export interface CreateRolePayload {
	name: string;
	permissions: string[];
}

/**
 * Payload for updating a role
 * Requirement 8.4: Update role permissions
 */
export interface UpdateRolePayload {
	name?: string;
	permissions: string[];
}

// ============================================================================
// User Cost Management Types (Requirements 9, 16)
// ============================================================================

/**
 * Payload for updating a user's internal cost
 * Requirement 9.1, 9.2: Update internal hourly cost
 */
export interface UpdateInternalCostPayload {
	internalHourlyCost: number;
}

/**
 * Payload for bulk updating internal costs
 * Requirement 9.6: Bulk update internal costs
 */
export interface BulkUpdateInternalCostPayload {
	users: Array<{
		userId: number;
		internalHourlyCost: number;
	}>;
}

/**
 * User with internal cost (for admin view)
 * Requirement 16.2, 16.3: User list with cost fields
 */
export interface UserWithCost {
	userId: number;
	name: string;
	email: string;
	internalHourlyCost?: number;
}

// ============================================================================
// Audit Log Types (Requirements 17)
// ============================================================================

/**
 * Audit log entry
 * Requirement 17.1: Audit log display fields
 */
export interface AuditLogEntry {
	id: number;
	userId: number;
	userName: string;
	action: string;
	eventType: string;
	severity: string;
	description: string;
	auditableType: string;
	auditableId: number;
	ipAddress: string;
	userAgent: string;
	createdAt: string;
	isSensitive: boolean;
	metadata?: Record<string, unknown>;
}

/**
 * Pagination metadata for audit logs
 */
export interface AuditLogPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

/**
 * Response structure for audit logs endpoint
 * GET /api/v1/admin/audit-logs
 */
export interface AuditLogListResponse {
	auditLogs: AuditLogEntry[];
	pagination: AuditLogPagination;
}

/**
 * Filters for audit log queries
 * Requirement 17.2, 17.3: Filtering and searching
 */
export interface AuditLogFilters {
	action?: string;
	userId?: number;
	dateFrom?: string;
	dateTo?: string;
	resourceId?: number;
	page?: number;
	perPage?: number;
}

// ============================================================================
// Permission Hook Types (Requirement 18)
// ============================================================================

/**
 * User permission entry
 * Requirement 18.1: Permission check data
 */
export interface UserPermission {
	permissionName: string;
	access: boolean;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
	hasPermission: boolean;
	permissions: UserPermission[];
}

// ============================================================================
// User Management Types (CRUD)
// ============================================================================

/**
 * User data for management
 */
export interface User {
	internalHourlyCost: number;
	userId: number;
	name: string;
	email: string;
	emailVerifiedAt?: string | null;
	skills: string[];
	roles: string[];
	specialization?: string;
	isActive: boolean;
	graceDaysRemaining?: number;
	graceDaysAllowed?: number;
	graceDaysUsed?: number;
	createdAt: string;
	updatedAt: string;
}

/**
 * Pagination metadata for users
 */
export interface UserPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

/**
 * Response structure for users list endpoint
 * GET /api/v1/admin/users/manage
 */
export interface UsersListResponse {
	users: User[];
	pagination: UserPagination;
}

/**
 * Filters for users list queries
 */
export interface UsersFilters {
	search?: string;
	role?: string;
	isActive?: boolean;
	sort?: string;
	page?: number;
	perPage?: number;
}

/**
 * Payload for creating a new user
 */
export interface CreateUserPayload {
	name: string;
	email: string;
	password: string;
	password_confirmation: string;
	skills?: string[];
	roles?: string[];
	specialization?: string;
	isActive?: boolean;
}

/**
 * Payload for updating a user
 */
export interface UpdateUserPayload {
	name?: string;
	email?: string;
	password?: string;
	password_confirmation?: string;
	skills?: string[];
	roles?: string[];
	specialization?: string;
	isActive?: boolean;
}

/**
 * Payload for assigning roles to a user
 */
export interface AssignRolesPayload {
	roles: string[];
}
