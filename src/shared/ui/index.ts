/**
 * Shared Components Index
 * Re-exports all shared/reusable components
 */

// Permission Guard
export { Can, usePermissionGate } from "./Can";

// Form Components
export * from "./forms/FormInput";
export * from "./forms/FormSelect";
export * from "./forms/FormTextarea";
export * from "./forms/FormSwitch";
export * from "./forms/FormDatePicker";
export * from "./forms/FormCheckboxGroup";
export * from "./forms/TagInput";

// Data Display Components
export * from "./data-display/DataTable";
export * from "./data-display/EmptyState";
export * from "./data-display/LoadingState";
export * from "./data-display/Pagination";
export { StatusBadge, getStatusVariant, getBonusTierVariant, getImpactVariant, getCategoryVariant } from "./data-display/StatusBadge";
export type { StatusVariant } from "./data-display/StatusBadge";

// Dialog Components
export * from "./dialogs/ConfirmDialog";
export * from "./dialogs/FormDialog";

// Filter Components
export * from "./filters/SearchInput";
export * from "./filters/FilterSelect";
export * from "./filters/FilterBar";
