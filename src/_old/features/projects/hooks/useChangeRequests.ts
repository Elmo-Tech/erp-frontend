/**
 * Change Requests Hooks
 * TanStack Query hooks for change request management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { changeRequestsApi } from "../api/changeRequests";
import { ChangeRequest, ChangeRequestListResponse, ChangeRequestSummary, CreateChangeRequestPayload, UpdateChangeRequestPayload } from "../types/changeRequest";

// Query keys
export const changeRequestKeys = {
	all: ["changeRequests"] as const,
	lists: () => [...changeRequestKeys.all, "list"] as const,
	list: (projectId: number, page?: number) => [...changeRequestKeys.lists(), projectId, page] as const,
	details: () => [...changeRequestKeys.all, "detail"] as const,
	detail: (id: number) => [...changeRequestKeys.details(), id] as const,
	summary: (projectId: number) => [...changeRequestKeys.all, "summary", projectId] as const,
};

/**
 * Hook to fetch change requests for a project
 */
export const useChangeRequests = (projectId: number, page = 1, perPage = 15) => {
	return useQuery<ChangeRequestListResponse, Error>({
		queryKey: changeRequestKeys.list(projectId, page),
		queryFn: () => changeRequestsApi.getAll(projectId, page, perPage),
		enabled: !!projectId,
		staleTime: 5 * 60 * 1000,
	});
};

/**
 * Hook to fetch a single change request
 */
export const useChangeRequest = (id: number, enabled = true) => {
	return useQuery<ChangeRequest, Error>({
		queryKey: changeRequestKeys.detail(id),
		queryFn: () => changeRequestsApi.getById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000,
	});
};

/**
 * Hook to fetch CR summary for a project
 */
export const useChangeRequestSummary = (projectId: number) => {
	return useQuery<ChangeRequestSummary, Error>({
		queryKey: changeRequestKeys.summary(projectId),
		queryFn: () => changeRequestsApi.getSummary(projectId),
		enabled: !!projectId,
		staleTime: 5 * 60 * 1000,
	});
};

/**
 * Hook to create a change request
 */
export const useCreateChangeRequest = () => {
	const queryClient = useQueryClient();

	return useMutation<ChangeRequest, Error, { projectId: number; payload: CreateChangeRequestPayload }>({
		mutationFn: ({ projectId, payload }) => changeRequestsApi.create(projectId, payload),
		onSuccess: (_, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: changeRequestKeys.lists() });
			queryClient.invalidateQueries({ queryKey: changeRequestKeys.summary(projectId) });
		},
	});
};

/**
 * Hook to update a change request
 */
export const useUpdateChangeRequest = () => {
	const queryClient = useQueryClient();

	return useMutation<ChangeRequest, Error, { id: number; payload: UpdateChangeRequestPayload }>({
		mutationFn: ({ id, payload }) => changeRequestsApi.update(id, payload),
		onSuccess: (data) => {
			queryClient.setQueryData(changeRequestKeys.detail(data.changeRequestId), data);
			queryClient.invalidateQueries({ queryKey: changeRequestKeys.lists() });
		},
	});
};

/**
 * Hook to submit a change request for review
 */
export const useSubmitChangeRequest = () => {
	const queryClient = useQueryClient();

	return useMutation<ChangeRequest, Error, number>({
		mutationFn: changeRequestsApi.submit,
		onSuccess: (data) => {
			queryClient.setQueryData(changeRequestKeys.detail(data.changeRequestId), data);
			queryClient.invalidateQueries({ queryKey: changeRequestKeys.lists() });
		},
	});
};

/**
 * Hook to approve a change request
 */
export const useApproveChangeRequest = () => {
	const queryClient = useQueryClient();

	return useMutation<ChangeRequest, Error, { id: number; approvedCost?: number }>({
		mutationFn: ({ id, approvedCost }) => changeRequestsApi.approve(id, approvedCost),
		onSuccess: (data) => {
			queryClient.setQueryData(changeRequestKeys.detail(data.changeRequestId), data);
			queryClient.invalidateQueries({ queryKey: changeRequestKeys.lists() });
			queryClient.invalidateQueries({ queryKey: changeRequestKeys.all });
		},
	});
};

/**
 * Hook to reject a change request
 */
export const useRejectChangeRequest = () => {
	const queryClient = useQueryClient();

	return useMutation<ChangeRequest, Error, { id: number; reason: string }>({
		mutationFn: ({ id, reason }) => changeRequestsApi.reject(id, reason),
		onSuccess: (data) => {
			queryClient.setQueryData(changeRequestKeys.detail(data.changeRequestId), data);
			queryClient.invalidateQueries({ queryKey: changeRequestKeys.lists() });
		},
	});
};

/**
 * Hook to mark a change request as implemented
 */
export const useImplementChangeRequest = () => {
	const queryClient = useQueryClient();

	return useMutation<ChangeRequest, Error, number>({
		mutationFn: changeRequestsApi.implement,
		onSuccess: (data) => {
			queryClient.setQueryData(changeRequestKeys.detail(data.changeRequestId), data);
			queryClient.invalidateQueries({ queryKey: changeRequestKeys.lists() });
			queryClient.invalidateQueries({ queryKey: changeRequestKeys.all });
		},
	});
};
