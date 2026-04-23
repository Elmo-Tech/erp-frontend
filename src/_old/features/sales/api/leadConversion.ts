import api from "@/shared/api/base";
import { Client } from "@/_old/features/clients/types";

export interface ConvertLeadPayload {
	name?: string;
	email?: string;
	phone?: string;
	company?: string;
	position?: string;
	address?: string;
	city?: string;
	country?: string;
	website?: string;
	notes?: string;
}

export interface CanConvertResponse {
	canConvert: boolean;
	reason: string | null;
	existingClientId: number | null;
	existingClientName: string | null;
}

export interface ConvertLeadResponse {
	success: boolean;
	message: string;
	data: Client;
}

export const leadConversionApi = {
	canConvert: async (leadId: number): Promise<CanConvertResponse> => {
		const response = await api.get(`/leads/${leadId}/can-convert`);
		return response.data.data;
	},

	convert: async (leadId: number, payload?: ConvertLeadPayload): Promise<ConvertLeadResponse> => {
		const response = await api.post(`/leads/${leadId}/convert`, payload || {});
		return response.data;
	},
};
