"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/entities/client/api/client.api";
import { clientKeys } from "@/entities/client/model/query-keys";
import type { Client, CreateClientPayload, UpdateClientPayload } from "@/entities/client/model/types";

export function useCreateClient() {
	const queryClient = useQueryClient();

	return useMutation<Client, Error, CreateClientPayload>({
		mutationFn: clientApi.createClient,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
		},
	});
}

export function useUpdateClient() {
	const queryClient = useQueryClient();

	return useMutation<Client, Error, { id: number; payload: UpdateClientPayload }>({
		mutationFn: ({ id, payload }) => clientApi.updateClient(id, payload),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
		},
	});
}

export function useDeleteClient() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: clientApi.deleteClient,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
		},
	});
}
