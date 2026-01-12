/**
 * Project hooks exports
 * Centralized exports for all project-related TanStack Query hooks
 */

// Project hooks
export { useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject, useApproveUI, usePrefetchProject, projectKeys } from "./useProjects";

// Quotation conversion hooks
export { useConvertQuotation } from "./useConvertQuotation";

// Project wiki hooks
export { useProjectWikis, useProjectWiki, useCreateProjectWiki, useUpdateProjectWiki, useDeleteProjectWiki, usePrefetchProjectWiki, usePrefetchProjectWikis, projectWikiKeys } from "./useProjectWikis";

// Project history hooks
export { useProjectHistory, usePrefetchProjectHistory, useInvalidateProjectHistory, projectHistoryKeys } from "./useProjectHistory";

// Project members hooks
export { useProjectMembers, useAddProjectMember, useUpdateProjectMember, useRemoveProjectMember, projectMemberKeys } from "./useProjectMembers";

// Change requests hooks
export { useChangeRequests, useChangeRequest, useCreateChangeRequest, useUpdateChangeRequest, useApproveChangeRequest, useRejectChangeRequest, useDeleteChangeRequest, changeRequestKeys } from "./useChangeRequests";

// Milestones hooks
export { useMilestones, useMilestone, useCreateMilestone, useUpdateMilestone, useDeleteMilestone, useMarkMilestonePaid, useLinkMilestoneInvoice, milestoneKeys } from "./useMilestones";
