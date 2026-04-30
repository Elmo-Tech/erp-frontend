"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/base";
import { meetingKeys } from "../model/query-keys";
import type { Meeting, MeetingListResponse, ScheduleMeetingPayload } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

export const meetingApi = {
	async scheduleMeeting(payload: ScheduleMeetingPayload): Promise<Meeting> {
		const response = await api.post<ApiEnvelope<Meeting>>("/activities", payload);

		return response.data.data;
	},

	async getClientMeetings(clientId: number): Promise<MeetingListResponse> {
		const response = await api.get<ApiEnvelope<MeetingListResponse>>(`/clients/${clientId}/meetings`);

		return response.data.data;
	},
};

export function useGetClientMeetings(clientId: number, enabled = true) {
	return useQuery({
		queryKey: meetingKeys.client(clientId),
		queryFn: async () => {
			const response = await meetingApi.getClientMeetings(clientId);

			return response.meetings;
		},
		enabled: enabled && clientId > 0,
		staleTime: 5 * 60 * 1000,
	});
}
