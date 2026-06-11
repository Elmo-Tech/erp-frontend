"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/base";
import type { Client, ClientActivityListResponse, ClientFilters, ClientListResponse, CreateClientPayload, UpdateClientPayload } from "../model/types";
import { clientKeys } from "../model/query-keys";

interface ApiEnvelope<T> {
	data: T;
}

export type RawClientResource = Client;
export type RawClientListResponse = ClientListResponse;

export function mapClientResource(resource: RawClientResource): Client {
	const client: Client = {
		clientId: resource.clientId,
		type: resource.type,
		displayName: resource.displayName,
		legalName: resource.legalName,
		companyName: resource.companyName,
		primaryEmail: resource.primaryEmail,
		primaryPhone: resource.primaryPhone,
		secondaryPhone: resource.secondaryPhone,
		name: resource.name,
		email: resource.email,
		phone: resource.phone,
		company: resource.company,
		position: resource.position,
		industry: resource.industry,
		address: resource.address,
		city: resource.city,
		state: resource.state,
		country: resource.country,
		postalCode: resource.postalCode,
		website: resource.website,
		taxNumber: resource.taxNumber,
		source: resource.source,
		lifecycleStage: resource.lifecycleStage,
		leadTemperature: resource.leadTemperature,
		accountManagerId: resource.accountManagerId,
		notes: resource.notes,
		metadata: resource.metadata,
		status: resource.status,
		userId: resource.userId,
		leadId: resource.leadId,
		accountManager: resource.accountManager,
		contacts: resource.contacts,
		totalRevenue: resource.totalRevenue,
		activeProjectsCount: resource.activeProjectsCount,
		hasPortalAccess: resource.hasPortalAccess,
		createdAt: resource.createdAt,
		updatedAt: resource.updatedAt,
	};

	return client;
}

export function mapClientListResponse(resource: RawClientListResponse): ClientListResponse {
	return {
		clients: resource.clients.map((client) => ({
			id: client.id,
			type: client.type,
			display_name: client.display_name,
			email: client.email,
			company_name: client.company_name,
			position: client.position,
			primary_phone: client.primary_phone,
			status: client.status,
			country: client.country,
			projects_count: client.projects_count,
			active_projects_count: client.active_projects_count,
			total_revenue: client.total_revenue,
			created_at: client.created_at,
		})),
		pagination: resource.pagination,
	};
}

function buildClientParams(filters?: ClientFilters) {
	const params = new URLSearchParams();

	if (filters?.search) {
		params.append("filter[search]", filters.search);
	}

	if (filters?.status) {
		params.append("filter[status]", filters.status);
	}

	if (filters?.company) {
		params.append("filter[company]", filters.company);
	}

	if (filters?.email) {
		params.append("filter[email]", filters.email);
	}

	if (typeof filters?.hasPortalAccess === "boolean") {
		params.append("filter[hasPortalAccess]", String(filters.hasPortalAccess));
	}

	if (filters?.page) {
		params.append("page", String(filters.page));
	}

	if (filters?.perPage) {
		params.append("perPage", String(filters.perPage));
	}

	return params;
}

export const clientApi = {
	async getClients(filters?: ClientFilters): Promise<ClientListResponse> {
		const params = buildClientParams(filters);
		const query = params.toString();
		const response = await api.get<ApiEnvelope<RawClientListResponse>>(query ? `/clients?${query}` : "/clients");

		return mapClientListResponse(response.data.data);
	},

	async getClientById(id: number): Promise<Client> {
		const response = await api.get<ApiEnvelope<RawClientResource>>(`/clients/${id}`);

		return mapClientResource(response.data.data);
	},

	async createClient(payload: CreateClientPayload): Promise<Client> {
		const response = await api.post<ApiEnvelope<RawClientResource>>("/clients", payload);

		return mapClientResource(response.data.data);
	},

	async updateClient(id: number, payload: UpdateClientPayload): Promise<Client> {
		const response = await api.put<ApiEnvelope<RawClientResource>>(`/clients/${id}`, payload);

		return mapClientResource(response.data.data);
	},

	async deleteClient(id: number): Promise<void> {
		await api.delete(`/clients/${id}`);
	},

	async getClientActivities(id: number): Promise<ClientActivityListResponse> {
		const response = await api.get<ApiEnvelope<ClientActivityListResponse>>(`/clients/${id}/activities`);

		return response.data.data;
	},
};

export function useClientsQuery(filters?: ClientFilters) {
	return useQuery({
		queryKey: clientKeys.list(filters),
		queryFn: () => clientApi.getClients(filters),
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateClientMutation() {
	const queryClient = useQueryClient();

	return useMutation<Client, Error, CreateClientPayload>({
		mutationFn: clientApi.createClient,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
		},
	});
}

export function useGetClientActivities(clientId: number, enabled = true) {
	return useQuery({
		queryKey: clientKeys.activities(clientId),
		queryFn: async () => {
			const response = await clientApi.getClientActivities(clientId);

			return response.activities;
		},
		enabled: enabled && clientId > 0,
		staleTime: 60 * 1000,
	});
}
