import api from "@/shared/api/base";
import type { LeadActivity, LeadMeeting, CompleteActivityPayload, CancelActivityPayload, CompleteMeetingPayload, CancelMeetingPayload, ScheduleResponse } from "../types/lead";

// Activity endpoints
export const activitiesApi = {
	// Get all activities with filters
	getActivities: async (params?: { status?: string; type?: string; leadId?: number; page?: number; perPage?: number }) => {
		const response = await api.get<{ data: LeadActivity[] }>("/activities", {
			params: {
				"filter[status]": params?.status,
				"filter[type]": params?.type,
				"filter[lead_id]": params?.leadId,
				page: params?.page,
				perPage: params?.perPage,
			},
		});
		return response.data;
	},

	// Complete an activity
	completeActivity: async (activityId: number, payload: CompleteActivityPayload) => {
		const response = await api.post<{ data: LeadActivity }>(`/activities/${activityId}/complete`, payload);
		return response.data;
	},

	// Cancel an activity
	cancelActivity: async (activityId: number, payload: CancelActivityPayload) => {
		const response = await api.post<{ data: LeadActivity }>(`/activities/${activityId}/cancel`, payload);
		return response.data;
	},
};

// Meeting endpoints
export const meetingsApi = {
	// Get all meetings with filters
	getMeetings: async (params?: { status?: string; leadId?: number; page?: number; perPage?: number }) => {
		const response = await api.get<{ data: LeadMeeting[] }>("/meetings", {
			params: {
				"filter[status]": params?.status,
				"filter[lead_id]": params?.leadId,
				page: params?.page,
				perPage: params?.perPage,
			},
		});
		return response.data;
	},

	// Complete a meeting
	completeMeeting: async (meetingId: number, payload: CompleteMeetingPayload) => {
		const formData = new FormData();
		formData.append("minutes", payload.minutes);
		if (payload.outcome) {
			formData.append("outcome", payload.outcome);
		}
		if (payload.attachments) {
			payload.attachments.forEach((file, index) => {
				formData.append(`attachments[${index}]`, file);
			});
		}

		const response = await api.post<{ data: LeadMeeting }>(`/meetings/${meetingId}/complete`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	// Cancel a meeting
	cancelMeeting: async (meetingId: number, payload: CancelMeetingPayload) => {
		const response = await api.post<{ data: LeadMeeting }>(`/meetings/${meetingId}/cancel`, payload);
		return response.data;
	},
};

// Schedule endpoints
export const scheduleApi = {
	// Get today's schedule
	getTodaySchedule: async () => {
		const response = await api.get<{ data: ScheduleResponse }>("/schedule/today");
		return response.data;
	},

	// Get upcoming events
	getUpcomingSchedule: async (days: number = 7) => {
		const response = await api.get<{ data: ScheduleResponse }>("/schedule/upcoming", {
			params: { days },
		});
		return response.data;
	},
};
