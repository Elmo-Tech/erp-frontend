import api from "@/lib/axios";
import { Client } from "../types";

export interface CreatePortalAccessPayload {
	password?: string;
	sendWelcomeEmail?: boolean;
}

export interface PortalAccessResponse {
	client: Client;
	portalUrl: string;
	credentials: {
		email: string;
		password: string;
		passwordGenerated: boolean;
	};
}

export interface ResetPasswordPayload {
	password?: string;
	sendEmail?: boolean;
}

export const portalAccessApi = {
	create: async (clientId: number, payload?: CreatePortalAccessPayload): Promise<PortalAccessResponse> => {
		const response = await api.post(`/clients/${clientId}/portal-access`, payload || {});
		return response.data.data;
	},

	revoke: async (clientId: number): Promise<Client> => {
		const response = await api.delete(`/clients/${clientId}/portal-access`);
		return response.data.data;
	},

	resetPassword: async (clientId: number, payload?: ResetPasswordPayload): Promise<{ credentials: { email: string; password: string; passwordGenerated: boolean } }> => {
		const response = await api.post(`/clients/${clientId}/portal-access/reset-password`, payload || {});
		return response.data.data;
	},
};
