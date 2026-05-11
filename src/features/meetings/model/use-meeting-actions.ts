"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/entities/client/model/query-keys";
import { meetingsApi } from "@/entities/meetings/api/meetings.api";
import { polyMeetingKeys } from "@/entities/meetings/model/query-keys";
import type { CreateMeetingPayload } from "@/entities/meetings/model/types";

/**
 * BUG FIX: was importing from the legacy singular `entities/meeting` module
 * which used a non-polymorphic endpoint and did not pass model_type / model_id.
 * Now uses the canonical polymorphic `entities/meetings` API.
 */
export function useScheduleMeeting(clientId: number) {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, CreateMeetingPayload>({
		mutationFn: (payload) => meetingsApi.createMeeting(payload),
		onSuccess: () => {
			// Invalidate the polymorphic meetings list for this client
			queryClient.invalidateQueries({
				queryKey: polyMeetingKeys.byModel("client", clientId),
			});
			// Invalidate client detail and activity feed
			queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
			queryClient.invalidateQueries({ queryKey: clientKeys.activities(clientId) });
		},
	});
}
