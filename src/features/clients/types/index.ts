export interface Client {
	clientId: number;
	name: string;
	email: string;
	phone: string;
	company: string;
	position: string;
	address: string;
	city: string;
	country: string;
	website: string;
	notes: string;
	status: "active" | "inactive";
	userId?: number;
	projectsCount?: number;
	projects?: ClientProject[];
	createdAt: string;
	updatedAt: string;
}

export interface ClientProject {
	projectId: number;
	title: string;
	status: string;
	budget: number;
	deadline?: string;
}

export interface ClientListResponse {
	clients: Client[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface CreateClientPayload {
	name: string;
	email: string;
	phone?: string;
	company?: string;
	position?: string;
	address?: string;
	city?: string;
	country?: string;
	website?: string;
	notes?: string;
	status?: "active" | "inactive";
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {}

export interface ClientFilters {
	search?: string;
	status?: string;
	company?: string;
	page?: number;
	perPage?: number;
}
