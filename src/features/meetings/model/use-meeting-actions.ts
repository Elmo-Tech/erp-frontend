"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/entities/client/model/query-keys";
import { meetingApi } from "@/entities/meeting/api/meeting.api";
import { meetingKeys } from "@/entities/meeting/model/query-keys";
import type { Meeting, ScheduleMeetingPayload } from "@/entities/meeting/model/types";

export function useScheduleMeeting(clientId: number) {
	const queryClient = useQueryClient();

	return useMutation<Meeting, Error, ScheduleMeetingPayload>({
		mutationFn: meetingApi.scheduleMeeting,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: meetingKeys.client(clientId) });
			queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
			queryClient.invalidateQueries({ queryKey: clientKeys.activities(clientId) });
		},
	});
}
