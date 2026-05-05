"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/entities/client/model/query-keys";
import { meetingApi } from "@/entities/meeting/api/meeting.api";
import { meetingKeys } from "@/entities/meeting/model/query-keys";
import { polyMeetingKeys } from "@/entities/meetings/model/query-keys";
import type { Meeting, ScheduleMeetingPayload } from "@/entities/meeting/model/types";

export function useScheduleMeeting(clientId: number) {
	const queryClient = useQueryClient();

	return useMutation<Meeting, Error, ScheduleMeetingPayload>({
		mutationFn: meetingApi.scheduleMeeting,
		onSuccess: () => {
			// Invalidate the legacy client meetings query (used by ClientMeetingsPage)
			queryClient.invalidateQueries({ queryKey: meetingKeys.client(clientId) });
			// Invalidate the polymorphic meetings query (used by PolyMeetingForm / MeetingsList)
			queryClient.invalidateQueries({ queryKey: polyMeetingKeys.byModel("client", clientId) });
			// Invalidate client detail and activity feed
			queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
			queryClient.invalidateQueries({ queryKey: clientKeys.activities(clientId) });
		},
	});
}
