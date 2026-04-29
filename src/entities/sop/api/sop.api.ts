import api from "@/shared/api/base";
import type { DailyCheckin, Directive, SubmitDailyCheckinPayload } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

export const sopApi = {
	async getTodayDirective(): Promise<Directive | null> {
		const response = await api.get<ApiEnvelope<Directive | null>>("/sop/directives/today");

		return response.data.data;
	},

	async submitDailyCheckin(payload: SubmitDailyCheckinPayload): Promise<DailyCheckin> {
		const response = await api.post<ApiEnvelope<DailyCheckin>>("/sop/daily-checkins", payload);

		return response.data.data;
	},

	async getDirectives(): Promise<Directive[]> {
		const response = await api.get<ApiEnvelope<{ data?: Directive[] } | Directive[]>>("/admin/sop/directives");
		const payload = response.data.data;

		return Array.isArray(payload) ? payload : (payload.data ?? []);
	},

	async createDirective(payload: Omit<Directive, "id" | "created_at" | "updated_at">): Promise<Directive> {
		const response = await api.post<ApiEnvelope<Directive>>("/admin/sop/directives", payload);

		return response.data.data;
	},
};
