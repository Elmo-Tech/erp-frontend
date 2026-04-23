import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projects";
import { Project, ConvertQuotationPayload } from "../types/project";
import { projectKeys } from "./useProjects";

/**
 * TanStack Query hook for quotation conversion
 * Implements requirement 2.7: POST /api/v1/projects/convert endpoint to convert a quotation to a project
 */

// Import quotation keys from sales module for cache invalidation
const quotationKeys = {
	all: ["quotations"] as const,
	lists: () => [...quotationKeys.all, "list"] as const,
	details: () => [...quotationKeys.all, "detail"] as const,
	detail: (id: number) => [...quotationKeys.details(), id] as const,
	byLead: (leadId: number) => [...quotationKeys.all, "byLead", leadId] as const,
};

/**
 * Hook to convert quotation to project using ProjectConversionService
 * Requirement 2.7: POST /api/v1/projects/convert endpoint to convert a quotation to a project
 */
export const useConvertQuotation = () => {
	const queryClient = useQueryClient();

	return useMutation<Project, Error, ConvertQuotationPayload>({
		mutationFn: projectsApi.convert,
		onSuccess: (newProject, variables) => {
			// Add the new project to the cache
			queryClient.setQueryData(projectKeys.detail(newProject.projectId), newProject);

			// Invalidate and refetch projects list
			queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

			// Invalidate quotations cache since the quotation status has changed
			queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });

			// Invalidate the specific quotation that was converted
			queryClient.invalidateQueries({ queryKey: quotationKeys.detail(variables.quotationId) });

			// If we have client information, also invalidate quotations by lead
			if (newProject.clientId) {
				queryClient.invalidateQueries({ queryKey: quotationKeys.byLead(newProject.clientId) });
			}
		},
		onError: (error) => {
			console.error("Failed to convert quotation to project:", error);
		},
	});
};
