import api from "@/lib/axios";
import { Client, ClientListResponse, CreateClientPayload, UpdateClientPayload, ClientFilters } from "../types";

export const clientsApi = {
	getAll: async (filters?: ClientFilters): Promise<ClientListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) params.append("filter[search]", filters.search);
		if (filters?.status) params.append("filter[status]", filters.status);
		if (filters?.company) params.append("filter[company]", filters.company);
		if (filters?.page) params.append("page", filters.page.toString());
		if (filters?.perPage) params.append("perPage", filters.perPage.toString());

		const response = await api.get<{ data: ClientListResponse }>(`/clients?${params.toString()}`);
		return response.data.data;
	},

	getById: async (id: number): Promise<Client> => {
		const response = await api.get<{ data: Client }>(`/clients/${id}`);
		return response.data.data;
	},

	create: async (payload: CreateClientPayload): Promise<Client> => {
		const response = await api.post<{ data: Client }>("/clients", payload);
		return response.data.data;
	},

	update: async (id: number, payload: UpdateClientPayload): Promise<Client> => {
		const response = await api.put<{ data: Client }>(`/clients/${id}`, payload);
		return response.data.data;
	},

	delete: async (id: number): Promise<void> => {
		await api.delete(`/clients/${id}`);
	},
};
