import api from "@/shared/api/base";

interface ApiEnvelope<T> {
	data: T;
}

export interface ClientProject {
	projectId: number;
	title: string;
	status: string;
	statusLabel?: string;
	progressPercentage?: number;
	deadline?: string | null;
	budget?: number;
	currency?: string;
	uiApprovedAt?: string | null;
	canApproveUI?: boolean;
	createdAt: string;
	invoices?: ClientInvoice[];
}

export interface ClientInvoice {
	invoiceId: number;
	invoiceNumber: string;
	projectId: number;
	amount: number;
	currency: string;
	status: string;
	statusLabel?: string;
	dueDate: string;
	paidAt?: string | null;
	isOverdue?: boolean;
	isPayable?: boolean;
	createdAt: string;
}

export interface ClientPagination {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export interface ClientProjectListResponse {
	projects: ClientProject[];
	pagination: ClientPagination;
}

export interface ClientInvoiceListResponse {
	invoices: ClientInvoice[];
	pagination: ClientPagination;
}

export interface ClientListFilters {
	status?: string;
	search?: string;
	projectId?: number;
	page?: number;
	perPage?: number;
}

function withQuery(path: string, filters?: ClientListFilters) {
	const params = new URLSearchParams();
	if (filters?.search) params.append("filter[search]", filters.search);
	if (filters?.status) params.append("filter[status]", filters.status);
	if (filters?.projectId) params.append("filter[projectId]", String(filters.projectId));
	if (filters?.page) params.append("page", String(filters.page));
	if (filters?.perPage) params.append("perPage", String(filters.perPage));
	const query = params.toString();
	return query ? `${path}?${query}` : path;
}

export const clientPortalApi = {
	async getProjects(filters?: ClientListFilters): Promise<ClientProjectListResponse> {
		const response = await api.get<ApiEnvelope<ClientProjectListResponse>>(withQuery("/client/projects", filters));
		return response.data.data;
	},

	async getProject(projectId: number): Promise<ClientProject> {
		const response = await api.get<ApiEnvelope<ClientProject>>(`/client/projects/${projectId}`);
		return response.data.data;
	},

	async approveProjectUi(projectId: number): Promise<ClientProject> {
		const response = await api.post<ApiEnvelope<ClientProject>>(`/client/projects/${projectId}/approve-ui`);
		return response.data.data;
	},

	async getInvoices(filters?: ClientListFilters): Promise<ClientInvoiceListResponse> {
		const response = await api.get<ApiEnvelope<ClientInvoiceListResponse>>(withQuery("/client/invoices", filters));
		return response.data.data;
	},

	async payInvoice(invoiceId: number): Promise<ClientInvoice> {
		const response = await api.post<ApiEnvelope<ClientInvoice>>(`/client/invoices/${invoiceId}/pay`);
		return response.data.data;
	},
};
