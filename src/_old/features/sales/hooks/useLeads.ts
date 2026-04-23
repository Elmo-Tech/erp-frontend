import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "../api";
import { LeadFilters, CreateLeadPayload, UpdateLeadPayload, CreateActivityPayload, CreateMeetingPayload, LeadStatus } from "../types";
import { MeetingFeedbackFormData } from "../schemas/meetingFeedbackSchema";

const LEADS_KEY = "leads";
const LEAD_KEY = "lead";
const KANBAN_KEY = "leads-kanban";
const FOLLOW_UPS_KEY = "leads-follow-ups";
const ACTIVITIES_KEY = "lead-activities";
const MEETINGS_KEY = "lead-meetings";

export function useLeads(filters?: LeadFilters) {
	return useQuery({
		queryKey: [LEADS_KEY, filters],
		queryFn: () => leadsApi.getAll(filters),
	});
}

export function useLead(id: number) {
	return useQuery({
		queryKey: [LEAD_KEY, id],
		queryFn: () => leadsApi.getById(id),
		enabled: !!id,
	});
}

export function useLeadsKanban() {
	return useQuery({
		queryKey: [KANBAN_KEY],
		queryFn: () => leadsApi.getKanban(),
	});
}

export function useLeadsFollowUps() {
	return useQuery({
		queryKey: [FOLLOW_UPS_KEY],
		queryFn: () => leadsApi.getFollowUps(),
	});
}

export function useCreateLead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateLeadPayload) => leadsApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
			queryClient.invalidateQueries({ queryKey: [KANBAN_KEY] });
		},
	});
}

export function useUpdateLead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateLeadPayload }) => leadsApi.update(id, payload),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
			queryClient.invalidateQueries({ queryKey: [KANBAN_KEY] });
			queryClient.setQueryData([LEAD_KEY, data.leadId], data);
		},
	});
}

export function useUpdateLeadStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }: { id: number; status: LeadStatus }) => leadsApi.updateStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
			queryClient.invalidateQueries({ queryKey: [KANBAN_KEY] });
		},
	});
}

export function useDeleteLead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => leadsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
			queryClient.invalidateQueries({ queryKey: [KANBAN_KEY] });
		},
	});
}

// Activities
export function useLeadActivities(leadId: number) {
	return useQuery({
		queryKey: [ACTIVITIES_KEY, leadId],
		queryFn: () => leadsApi.getActivities(leadId),
		enabled: !!leadId,
	});
}

export function useAddLeadActivity() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ leadId, payload }: { leadId: number; payload: CreateActivityPayload }) => leadsApi.addActivity(leadId, payload),
		onSuccess: (_, { leadId }) => {
			queryClient.invalidateQueries({ queryKey: [ACTIVITIES_KEY, leadId] });
			queryClient.invalidateQueries({ queryKey: [LEAD_KEY, leadId] });
		},
	});
}

// Meetings
export function useLeadMeetings(leadId: number) {
	return useQuery({
		queryKey: [MEETINGS_KEY, leadId],
		queryFn: () => leadsApi.getMeetings(leadId),
		enabled: !!leadId,
	});
}

export function useScheduleMeeting() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ leadId, payload }: { leadId: number; payload: CreateMeetingPayload }) => leadsApi.scheduleMeeting(leadId, payload),
		onSuccess: (_, { leadId }) => {
			queryClient.invalidateQueries({ queryKey: [MEETINGS_KEY, leadId] });
			queryClient.invalidateQueries({ queryKey: [LEAD_KEY, leadId] });
		},
	});
}

export function useUpdateMeeting() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ leadId, meetingId, payload }: { leadId: number; meetingId: number; payload: Partial<CreateMeetingPayload> }) => leadsApi.updateMeeting(leadId, meetingId, payload),
		onSuccess: (_, { leadId }) => {
			queryClient.invalidateQueries({ queryKey: [MEETINGS_KEY, leadId] });
		},
	});
}

export function useCompleteMeetingWithFeedback() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ leadId, meetingId, payload, teamLeadId }: { leadId: number; meetingId: number; payload: MeetingFeedbackFormData; teamLeadId?: number }) => leadsApi.completeMeetingWithFeedback(leadId, meetingId, payload, teamLeadId),
		onSuccess: (_, { leadId }) => {
			queryClient.invalidateQueries({ queryKey: [MEETINGS_KEY, leadId] });
			queryClient.invalidateQueries({ queryKey: [LEAD_KEY, leadId] });
		},
	});
}
