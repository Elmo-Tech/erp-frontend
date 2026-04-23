// ============================================
// Components
// ============================================
export { ProjectDetails } from "./components/ProjectDetails";
export { ProjectDetailsTabs } from "./components/ProjectDetailsTabs";
export { ProjectStatusBadge } from "./components/ProjectStatusBadge";

// Tabs
export { TeamTab, TasksTab, WikiTab, FilesTab, HistoryTab, ChangeRequestsTab, BudgetTab } from "./components/tabs";

// Wiki
export { WikiList } from "./components/WikiList";
export { WikiViewer } from "./components/WikiViewer";

// History
export { HistoryLog } from "./components/HistoryLog";

// Tasks
export { TaskDeliverablesSection } from "./components/tasks";

// ============================================
// Hooks
// ============================================
export { useProjects } from "./hooks/useProjects";

// Deliverables
export {
	useTaskDeliverables,
	useCreateTaskDeliverable,
	useUpdateTaskDeliverable,
	useDeleteTaskDeliverable,
	useSubmitTaskDeliverable,
	useStartReviewTaskDeliverable,
	useApproveTaskDeliverable,
	useRejectTaskDeliverable,
	useReorderTaskDeliverables,
} from "./hooks/useTaskDeliverables";

// ============================================
// Types
// ============================================
export type { Project, ProjectStatus, ProjectFilters } from "./types/project";

export type { TaskDeliverable, DeliverableStatus, CreateDeliverableData, UpdateDeliverableData, SubmitDeliverableData, ReviewDeliverableData, ReorderDeliverablesData, DeliverablesResponse, DeliverablesSummary } from "./types/taskDeliverable";

// ============================================
// Schemas
// ============================================
export { createDeliverableSchema, updateDeliverableSchema, submitDeliverableSchema, reviewDeliverableSchema, reorderDeliverablesSchema } from "./schemas/deliverableSchemas";

// ============================================
// API
// ============================================
export { taskDeliverablesApi } from "./api/taskDeliverables";
