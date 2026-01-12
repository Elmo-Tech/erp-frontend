import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activitiesApi, meetingsApi, scheduleApi } from "../api/activities";
import type { CompleteActivityPayload, CancelActivityPayload, CompleteMeetingPayload, CancelMeetingPayload } from "../types/lead";
import { toast } from "sonner";

// Query keys
export const activityKeys = {
	all: ["activities"] as const,
	lists: () => [...activityKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...activityKeys.lists(), filters] as const,
};

export const meetingKeys = {
	all: ["meetings"] as const,
	lists: () => [...meetingKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...meetingKeys.lists(), filters] as const,
};

export const scheduleKeys = {
	all: ["schedule"] as const,
	today: () => [...scheduleKeys.all, "today"] as const,
	upcoming: (days: number) => [...scheduleKeys.all, "upcoming", days] as const,
};

// Activity hooks
export function useActivities(params?: { status?: string; type?: string; leadId?: number; page?: number; perPage?: number }) {
	return useQuery({
		queryKey: activityKeys.list(params || {}),
		queryFn: () => activitiesApi.getActivities(params),
	});
}

export function useCompleteActivity() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ activityId, payload }: { activityId: number; payload: CompleteActivityPayload }) => activitiesApi.completeActivity(activityId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: activityKeys.all });
			queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
			toast.success("Activity completed successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to complete activity");
		},
	});
}

export function useCancelActivity() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ activityId, payload }: { activityId: number; payload: CancelActivityPayload }) => activitiesApi.cancelActivity(activityId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: activityKeys.all });
			queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
			toast.success("Activity cancelled successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to cancel activity");
		},
	});
}

// Meeting hooks
export function useMeetings(params?: { status?: string; leadId?: number; page?: number; perPage?: number }) {
	return useQuery({
		queryKey: meetingKeys.list(params || {}),
		queryFn: () => meetingsApi.getMeetings(params),
	});
}

export function useCompleteMeeting() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ meetingId, payload }: { meetingId: number; payload: CompleteMeetingPayload }) => meetingsApi.completeMeeting(meetingId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: meetingKeys.all });
			queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
			toast.success("Meeting completed successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to complete meeting");
		},
	});
}

export function useCancelMeeting() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ meetingId, payload }: { meetingId: number; payload: CancelMeetingPayload }) => meetingsApi.cancelMeeting(meetingId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: meetingKeys.all });
			queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
			toast.success("Meeting cancelled successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to cancel meeting");
		},
	});
}

// Schedule hooks
export function useTodaySchedule() {
	return useQuery({
		queryKey: scheduleKeys.today(),
		queryFn: () => scheduleApi.getTodaySchedule(),
	});
}

export function useUpcomingSchedule(days: number = 7) {
	return useQuery({
		queryKey: scheduleKeys.upcoming(days),
		queryFn: () => scheduleApi.getUpcomingSchedule(days),
	});
}
