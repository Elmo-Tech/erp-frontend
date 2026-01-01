/**
 * Client Portal UI Approval Hook
 * TanStack Query mutation hook for approving UI/UX deliverables.
 *
 * Requirements: 14.4
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientProjectsApi } from "../api/clientProjects";
import { ClientProject } from "../types/clientProject";
import { clientProjectKeys } from "./useClientProjects";

/**
 * Hook to approve UI/UX deliverables for a project
 * Requirement 14.4: WHEN project is in 'ui_ux' status, THE Component SHALL display an "Approve UI" button
 *
 * This mutation:
 * - Calls the approve-ui endpoint
 * - Updates the project cache on success
 * - Invalidates project lists to ensure consistency
 */
export const useApproveUI = () => {
	const queryClient = useQueryClient();

	return useMutation<ClientProject, Error, number>({
		mutationFn: clientProjectsApi.approveUI,
		onSuccess: (updatedProject) => {
			// Update the specific project in cache
			queryClient.setQueryData(clientProjectKeys.detail(updatedProject.projectId), updatedProject);

			// Invalidate lists to ensure consistency
			queryClient.invalidateQueries({ queryKey: clientProjectKeys.lists() });
		},
		onError: (error) => {
			console.error("Failed to approve UI:", error);
		},
	});
};
