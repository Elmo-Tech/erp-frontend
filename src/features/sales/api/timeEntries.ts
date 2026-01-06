import api from "@/lib/axios";
import { TimeEntry, StartTimerPayload, ActiveTimerResponse, TimeEntryListResponse, TimeEntryFilters, UpdateTimeEntryPayload } from "../types/timeEntry";

/**
 * API functions for time entry management
 * Implements requirements 8.1-8.4: Time Entry API endpoints
 */
export const timeEntriesApi = {
	/**
	 * Start a timer for a trackable entity
	 * Requirement 8.1: POST /api/v1/time-entries/start endpoint to start a timer for a trackable entity
	 */
	start: async (payload: StartTimerPayload): Promise<TimeEntry> => {
		const response = await api.post<{ data: TimeEntry }>("/time-entries/start", payload);
		return response.data.data;
	},

	/**
	 * Stop the active timer
	 * Requirement 8.2: POST /api/v1/time-entries/stop endpoint to stop the active timer
	 */
	stop: async (): Promise<TimeEntry> => {
		const response = await api.post<{ data: TimeEntry }>("/time-entries/stop");
		return response.data.data;
	},

	/**
	 * Get all time entries with optional filtering and pagination
	 * Requirement 8.3: GET /api/v1/time-entries endpoint to list time entries with filtering
	 * Requirement 8.5: Support filtering time entries by trackable_type and trackable_id
	 * Requirement 8.6: Support filtering time entries by date range
	 */
	getAll: async (filters?: TimeEntryFilters): Promise<TimeEntryListResponse> => {
		const params = new URLSearchParams();

		if (filters?.trackableType) {
			params.append("filter[trackableType]", filters.trackableType);
		}
		if (filters?.trackableId) {
			params.append("filter[trackableId]", filters.trackableId.toString());
		}
		if (filters?.userId) {
			params.append("filter[userId]", filters.userId.toString());
		}
		if (filters?.startDate) {
			params.append("filter[startDate]", filters.startDate);
		}
		if (filters?.endDate) {
			params.append("filter[endDate]", filters.endDate);
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const response = await api.get<{ data: TimeEntryListResponse }>(`/time-entries?${params.toString()}`);
		return response.data.data;
	},

	/**
	 * Get all time entries (Admin only)
	 */
	getAllAdmin: async (filters?: TimeEntryFilters): Promise<TimeEntryListResponse> => {
		const params = new URLSearchParams();

		if (filters?.trackableType) {
			params.append("filter[trackableType]", filters.trackableType);
		}
		if (filters?.trackableId) {
			params.append("filter[trackableId]", filters.trackableId.toString());
		}
		if (filters?.userId) {
			params.append("filter[userId]", filters.userId.toString());
		}
		if (filters?.startDate) {
			params.append("filter[startDate]", filters.startDate);
		}
		if (filters?.endDate) {
			params.append("filter[endDate]", filters.endDate);
		}
		if (filters?.page) {
			params.append("page", filters.page.toString());
		}
		if (filters?.perPage) {
			params.append("perPage", filters.perPage.toString());
		}

		const response = await api.get<{ data: TimeEntryListResponse }>(`/time-entries/all?${params.toString()}`);
		return response.data.data;
	},

	/**
	 * Get the current user's active timer
	 * Requirement 8.4: GET /api/v1/time-entries/active endpoint to get the current user's active timer
	 */
	getActive: async (): Promise<ActiveTimerResponse> => {
		const response = await api.get<{ data: ActiveTimerResponse }>("/time-entries/active");
		return response.data.data;
	},

	/**
	 * Update a time entry (Admin only)
	 */
	update: async (id: number, payload: UpdateTimeEntryPayload): Promise<TimeEntry> => {
		const response = await api.put<{ data: TimeEntry }>(`/time-entries/${id}`, payload);
		return response.data.data;
	},
};
