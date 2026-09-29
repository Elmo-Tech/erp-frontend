import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeDocumentsApi } from "../api/employee-documents";
import type { UploadEmployeeDocumentPayload } from "../types/employee-document";

export const employeeDocumentKeys = {
	all: ["employee-documents"] as const,
	lists: () => [...employeeDocumentKeys.all, "list"] as const,
	list: (employeeId: number) => [...employeeDocumentKeys.lists(), employeeId] as const,
};

export function useEmployeeDocuments(employeeId: number, enabled = true) {
	return useQuery({
		queryKey: employeeDocumentKeys.list(employeeId),
		queryFn: () => employeeDocumentsApi.getAll(employeeId),
		enabled: enabled && employeeId > 0,
	});
}

export function useUploadEmployeeDocument() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, payload }: { employeeId: number; payload: UploadEmployeeDocumentPayload }) => employeeDocumentsApi.upload(employeeId, payload),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeDocumentKeys.list(employeeId) }),
	});
}

export function useDeleteEmployeeDocument() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: number; employeeId: number }) => employeeDocumentsApi.delete(id),
		onSuccess: (_, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeDocumentKeys.list(employeeId) }),
	});
}
