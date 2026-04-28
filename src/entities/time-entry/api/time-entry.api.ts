import api from "@/shared/api/base";
import type { ActiveTimer, StartTimerPayload, TimeEntry, TimeEntryFilters, TimeEntryListResponse, UpdateTimeEntryPayload } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

function buildTimeEntryParams(filters?: TimeEntryFilters) {
	const params = new URLSearchParams();

	if (filters?.trackableType) {
		params.append("filter[trackable_type]", filters.trackableType);
	}

	if (filters?.trackableId) {
		params.append("filter[trackable_id]", String(filters.trackableId));
	}

	if (filters?.userId) {
		params.append("filter[user_id]", String(filters.userId));
	}

	if (filters?.startDate) {
		params.append("filter[start_date]", filters.startDate);
	}

	if (filters?.endDate) {
		params.append("filter[end_date]", filters.endDate);
	}

	if (filters?.page) {
		params.append("page", String(filters.page));
	}

	if (filters?.perPage) {
		params.append("perPage", String(filters.perPage));
	}

	return params;
}

export const timeEntryApi = {
	async start(payload: StartTimerPayload): Promise<TimeEntry> {
		const response = await api.post<ApiEnvelope<TimeEntry>>("/time-entries/start", payload);

		return response.data.data;
	},

	async stop(): Promise<TimeEntry> {
		const response = await api.post<ApiEnvelope<TimeEntry>>("/time-entries/stop");

		return response.data.data;
	},

	async getActive(): Promise<TimeEntry | null> {
		const response = await api.get<ApiEnvelope<TimeEntry | null>>("/time-entries/active");

		return response.data.data;
	},

	async getTimeEntries(filters?: TimeEntryFilters): Promise<TimeEntryListResponse> {
		const params = buildTimeEntryParams(filters);
		const query = params.toString();
		const response = await api.get<ApiEnvelope<TimeEntryListResponse>>(query ? `/time-entries?${query}` : "/time-entries");

		return response.data.data;
	},

	async getAllTimeEntries(filters?: TimeEntryFilters): Promise<TimeEntryListResponse> {
		const params = buildTimeEntryParams(filters);
		const query = params.toString();
		const response = await api.get<ApiEnvelope<TimeEntryListResponse>>(query ? `/time-entries/all?${query}` : "/time-entries/all");

		return response.data.data;
	},

	async update(id: number, payload: UpdateTimeEntryPayload): Promise<TimeEntry> {
		const response = await api.put<ApiEnvelope<TimeEntry>>(`/time-entries/${id}`, payload);

		return response.data.data;
	},

	async getActiveTimers(): Promise<ActiveTimer[]> {
		const response = await api.get<ApiEnvelope<ActiveTimer[]>>("/time-entries/active-timers");

		return response.data.data;
	},

	async stopTimerAdmin(timeEntryId: number): Promise<void> {
		await api.post(`/time-entries/${timeEntryId}/stop-admin`);
	},
};

