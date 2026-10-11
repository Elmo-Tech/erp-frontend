import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../api";
import { Client, ClientListResponse, CreateClientPayload, UpdateClientPayload, ClientFilters } from "../types";

export const clientKeys = {
	all: ["clients"] as const,
	lists: () => [...clientKeys.all, "list"] as const,
	list: (filters?: ClientFilters) => [...clientKeys.lists(), filters] as const,
	details: () => [...clientKeys.all, "detail"] as const,
	detail: (id: number) => [...clientKeys.details(), id] as const,
};

export const useClients = (filters?: ClientFilters) => {
	return useQuery<ClientListResponse, Error>({
		queryKey: clientKeys.list(filters),
		queryFn: () => clientsApi.getAll(filters),
		staleTime: 5 * 60 * 1000,
	});
};

export const useClient = (id: number, enabled = true) => {
	return useQuery<Client, Error>({
		queryKey: clientKeys.detail(id),
		queryFn: () => clientsApi.getById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000,
	});
};

export const useCreateClient = () => {
	const queryClient = useQueryClient();

	return useMutation<Client, Error, CreateClientPayload>({
		mutationFn: clientsApi.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
		},
	});
};

export const useUpdateClient = () => {
	const queryClient = useQueryClient();

	return useMutation<Client, Error, { id: number; payload: UpdateClientPayload }>({
		mutationFn: ({ id, payload }) => clientsApi.update(id, payload),
		onSuccess: (client, { id }) => {
			queryClient.setQueryData<Client>(clientKeys.detail(id), (previous) => ({ ...previous, ...client }));
			queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
		},
	});
};

export const useDeleteClient = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: clientsApi.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
		},
	});
};
