import api from "@/shared/api/base";
import type { Client, ClientFilters, ClientListResponse, CreateClientPayload, UpdateClientPayload } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
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
		const response = await api.get<ApiEnvelope<ClientListResponse>>(query ? `/clients?${query}` : "/clients");

		return response.data.data;
	},

	async getClientById(id: number): Promise<Client> {
		const response = await api.get<ApiEnvelope<Client>>(`/clients/${id}`);

		return response.data.data;
	},

	async createClient(payload: CreateClientPayload): Promise<Client> {
		const response = await api.post<ApiEnvelope<Client>>("/clients", payload);

		return response.data.data;
	},

	async updateClient(id: number, payload: UpdateClientPayload): Promise<Client> {
		const response = await api.put<ApiEnvelope<Client>>(`/clients/${id}`, payload);

		return response.data.data;
	},

	async deleteClient(id: number): Promise<void> {
		await api.delete(`/clients/${id}`);
	},
};
