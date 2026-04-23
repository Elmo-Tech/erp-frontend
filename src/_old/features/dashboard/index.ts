/**
 * Dashboard Feature
 * Exports all dashboard-related functionality
 */

// API
export { dashboardStatsApi } from "./api/stats";

// Hooks
export { useDashboardStats } from "./hooks/useDashboardStats";

// Types
export type { DashboardStats, RecentProject, RecentActivity, DashboardOverview, DashboardOverviewResponse } from "./types/stats";
