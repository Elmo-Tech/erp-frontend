/**
 * Polymorphic Meetings API
 *
 * All endpoints are model-agnostic. Pass `modelType` and `modelId` to scope
 * the request to the correct parent (lead, client, or project).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/base";
import { polyMeetingKeys } from "../model/query-keys";
import type { PolyMeeting, MeetingModelType, CreateMeetingPayload, UpdateMeetingStatusPayload } from "../model/types";
import { MODEL_TYPE_TO_MORPH } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
	success: boolean;
	message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw API functions
// ─────────────────────────────────────────────────────────────────────────────

export const meetingsApi = {
	/**
	 * GET /meetings?model_type=...&model_id=...
	 * Returns all meetings for a given polymorphic parent.
	 */
	async getMeetings(modelType: MeetingModelType, modelId: number): Promise<PolyMeeting[]> {
		const params = new URLSearchParams({
			model_type: MODEL_TYPE_TO_MORPH[modelType],
			model_id: String(modelId),
		});
		const res = await api.get<ApiEnvelope<PolyMeeting[]>>(`/meetings?${params.toString()}`);
		return res.data.data;
	},

	/**
	 * POST /meetings
	 * Creates a new meeting for a polymorphic parent.
	 */
	async createMeeting(payload: CreateMeetingPayload): Promise<PolyMeeting> {
		const res = await api.post<ApiEnvelope<PolyMeeting>>("/meetings", payload);
		return res.data.data;
	},

	/**
	 * PATCH /meetings/{id}/status
	 * Updates the status of a meeting.
	 * completion_note is REQUIRED for any status other than "scheduled".
	 */
	async updateMeetingStatus(meetingId: number, payload: UpdateMeetingStatusPayload): Promise<PolyMeeting> {
		const res = await api.patch<ApiEnvelope<PolyMeeting>>(`/meetings/${meetingId}/status`, payload);
		return res.data.data;
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// React Query hooks
// ─────────────────────────────────────────────────────────────────────────────

export function useGetMeetings(modelType: MeetingModelType, modelId: number, enabled = true) {
	return useQuery({
		queryKey: polyMeetingKeys.byModel(modelType, modelId),
		queryFn: () => meetingsApi.getMeetings(modelType, modelId),
		enabled: enabled && modelId > 0,
		staleTime: 2 * 60 * 1000,
	});
}

export function useCreateMeeting(modelType: MeetingModelType, modelId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateMeetingPayload) => meetingsApi.createMeeting(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: polyMeetingKeys.byModel(modelType, modelId),
			});
		},
	});
}

export function useUpdateMeetingStatus(modelType: MeetingModelType, modelId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ meetingId, payload }: { meetingId: number; payload: UpdateMeetingStatusPayload }) => meetingsApi.updateMeetingStatus(meetingId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: polyMeetingKeys.byModel(modelType, modelId),
			});
		},
	});
}
