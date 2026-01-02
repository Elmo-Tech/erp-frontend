/**
 * Admin Hooks Index
 * Re-exports all admin hooks
 */

export * from "./useAdminStats";
export * from "./useAuditLogs";
export * from "./useUsers";

// Export roles hooks
export { useRoles, useRole, useCreateRole, useUpdateRole, useDeleteRole, useUsersWithCosts, useUpdateInternalCost, useBulkUpdateInternalCosts, usePrefetchRole, roleKeys, userCostKeys } from "./useRoles";

// Export permissions hooks with explicit naming to avoid conflicts
export { usePermissions as useAdminPermissions, useCanAccess, ADMIN_PERMISSIONS, type AdminPermission } from "./usePermissions";

// Also export the permissions query hook from useRoles with a different name
export { usePermissions as usePermissionsQuery } from "./useRoles";
