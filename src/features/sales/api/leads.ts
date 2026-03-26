import api from "@/lib/axios";
import { Lead, LeadActivity, LeadMeeting, LeadListResponse, LeadKanbanResponse, CreateLeadPayload, UpdateLeadPayload, CreateActivityPayload, CreateMeetingPayload, LeadFilters, LeadStatus } from "../types";
import { MeetingFeedbackFormData } from "../schemas/meetingFeedbackSchema";

export const leadsApi = {
	getAll: async (filters?: LeadFilters): Promise<LeadListResponse> => {
		const params = new URLSearchParams();

		if (filters?.search) params.append("filter[search]", filters.search);
		if (filters?.status) params.append("filter[status]", filters.status);
		if (filters?.source) params.append("filter[source]", filters.source);
		if (filters?.priority) params.append("filter[priority]", filters.priority);
		if (filters?.assignedTo) params.append("filter[assignedTo]", filters.assignedTo.toString());
		if (filters?.page) params.append("page", filters.page.toString());
		if (filters?.perPage) params.append("perPage", filters.perPage.toString());

		const response = await api.get<{ data: LeadListResponse }>(`/leads?${params.toString()}`);
		return response.data.data;
	},

	getById: async (id: number): Promise<Lead> => {
		const response = await api.get<{ data: Lead }>(`/leads/${id}`);
		return response.data.data;
	},

	getKanban: async (): Promise<LeadKanbanResponse> => {
		const response = await api.get<{ data: LeadKanbanResponse }>("/leads-kanban");
		return response.data.data;
	},

	getFollowUps: async (): Promise<Lead[]> => {
		const response = await api.get<{ data: { leads: Lead[] } }>("/leads-follow-ups");
		return response.data.data.leads;
	},

	create: async (payload: CreateLeadPayload): Promise<Lead> => {
		const response = await api.post<{ data: Lead }>("/leads", payload);
		return response.data.data;
	},

	update: async (id: number, payload: UpdateLeadPayload): Promise<Lead> => {
		const response = await api.put<{ data: Lead }>(`/leads/${id}`, payload);
		return response.data.data;
	},

	updateStatus: async (id: number, status: LeadStatus): Promise<Lead> => {
		const response = await api.patch<{ data: Lead }>(`/leads/${id}/status`, { status });
		return response.data.data;
	},

	delete: async (id: number): Promise<void> => {
		await api.delete(`/leads/${id}`);
	},

	// Activities
	getActivities: async (leadId: number): Promise<LeadActivity[]> => {
		const response = await api.get<{ data: { activities: LeadActivity[] } }>(`/leads/${leadId}/activities`);
		return response.data.data.activities;
	},

	addActivity: async (leadId: number, payload: CreateActivityPayload): Promise<LeadActivity> => {
		const response = await api.post<{ data: LeadActivity }>(`/leads/${leadId}/activities`, payload);
		return response.data.data;
	},

	// Meetings
	getMeetings: async (leadId: number): Promise<LeadMeeting[]> => {
		const response = await api.get<{ data: { meetings: LeadMeeting[] } }>(`/leads/${leadId}/meetings`);
		return response.data.data.meetings;
	},

	scheduleMeeting: async (leadId: number, payload: CreateMeetingPayload): Promise<LeadMeeting> => {
		const response = await api.post<{ data: LeadMeeting }>(`/leads/${leadId}/meetings`, payload);
		return response.data.data;
	},

	updateMeeting: async (leadId: number, meetingId: number, payload: Partial<CreateMeetingPayload>): Promise<LeadMeeting> => {
		const response = await api.put<{ data: LeadMeeting }>(`/leads/${leadId}/meetings/${meetingId}`, payload);
		return response.data.data;
	},

	completeMeetingWithFeedback: async (leadId: number, meetingId: number, payload: MeetingFeedbackFormData, teamLeadId?: number): Promise<LeadMeeting> => {
		const response = await api.patch<{ data: LeadMeeting }>(`/leads/${leadId}/status`, {
			status: "meeting_completed",
			meetingId,
			outcome: payload.outcome,
			feedback: payload.feedback,
			nextAction: payload.nextAction,
			followUpDate: payload.followUpDate,
			teamLeadId,
		});
		return response.data.data;
	},
};
