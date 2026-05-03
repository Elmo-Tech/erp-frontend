"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/base";
import { meetingKeys } from "../model/query-keys";
import type { Meeting, ScheduleMeetingPayload } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

interface RawMeetingResource {
	meetingId: number;
	subjectId: number;
	subjectType: string;
	subjectName?: string;
	status: string;
	statusLabel?: string;
	typeLabel?: string;
	title: string;
	description?: string | null;
	location?: string | null;
	locationDetails?: string | null;
	outcomeSummary?: string | null;
	assignedTo?: {
		userId: number;
		name: string;
		email: string;
		avatar?: string;
	} | null;
	scheduledAt?: string | null;
	createdAt: string;
	updatedAt: string;
}

/** Shape of data.meetings when MeetingResource::collection() is nested in a plain array */
interface MeetingsEnvelope {
	meetings: {
		data: RawMeetingResource[];
	};
}

function toMeeting(raw: RawMeetingResource): Meeting {
	return {
		activityId: raw.meetingId,
		subjectId: raw.subjectId,
		subjectType: raw.subjectType,
		type: "meeting",
		typeLabel: raw.typeLabel,
		status: raw.status,
		statusLabel: raw.statusLabel,
		title: raw.title,
		description: raw.description ?? null,
		assignedTo: raw.assignedTo ?? undefined,
		scheduledAt: raw.scheduledAt ?? null,
		createdAt: raw.createdAt,
		updatedAt: raw.updatedAt,
	};
}

export const meetingApi = {
	async scheduleMeeting(payload: ScheduleMeetingPayload): Promise<Meeting> {
		const response = await api.post<ApiEnvelope<RawMeetingResource>>("/activities", payload);
		return toMeeting(response.data.data);
	},

	async getClientMeetings(clientId: number): Promise<Meeting[]> {
		const response = await api.get<ApiEnvelope<MeetingsEnvelope>>(`/clients/${clientId}/meetings`);
		// MeetingResource::collection() nested in a plain array serializes as { data: [...] }
		return (response.data.data?.meetings?.data ?? []).map(toMeeting);
	},
};

export function useGetClientMeetings(clientId: number, enabled = true) {
	return useQuery({
		queryKey: meetingKeys.client(clientId),
		queryFn: () => meetingApi.getClientMeetings(clientId),
		enabled: enabled && clientId > 0,
		staleTime: 5 * 60 * 1000,
	});
}
