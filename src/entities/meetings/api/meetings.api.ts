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

/** Shape returned by MeetingCollection (wraps the array in a `meetings` key) */
interface MeetingCollectionData {
	meetings: RawMeetingResource[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

/** Shape returned by MeetingResource */
interface RawMeetingResource {
	meetingId: number;
	subjectId: number;
	subjectType: string;
	subjectName?: string;
	meetingType?: string | null;
	status: string;
	statusLabel?: string;
	statusColor?: string;
	title: string;
	description?: string | null;
	location?: string | null;
	locationDetails?: string | null;
	outcomeSummary?: string | null;
	isCompleted?: boolean;
	assignedTo?: {
		userId: number;
		name: string;
		email: string;
		avatar?: string;
	} | null;
	scheduledAt: string;
	completedAt?: string | null;
	createdAt: string;
	updatedAt: string;
}

/** Maps a raw MeetingResource to the PolyMeeting interface used by the UI */
function toPolyMeeting(raw: RawMeetingResource, modelType: MeetingModelType, modelId: number): PolyMeeting {
	// Derive locationType from the backend `location` field
	const locationMap: Record<string, PolyMeeting["locationType"]> = {
		online: "online",
		office: "our_office",
		client_site: "client_site",
	};

	return {
		id: raw.meetingId,
		modelType,
		modelId,
		// Backend has no meeting_type column — default to "discovery" as a safe fallback
		meetingType: (raw.meetingType ?? "discovery") as PolyMeeting["meetingType"],
		status: raw.status as PolyMeeting["status"],
		title: raw.title,
		description: raw.description ?? null,
		scheduledAt: raw.scheduledAt,
		completionNote: raw.outcomeSummary ?? null,
		assignedTo: raw.assignedTo ?? null,
		// Backend stores attendees on the subject, not the meeting — default to empty
		internalAttendees: [],
		externalAttendees: [],
		locationType: locationMap[raw.location ?? ""] ?? "online",
		locationDetails: raw.locationDetails ?? null,
		createdAt: raw.createdAt,
		updatedAt: raw.updatedAt,
	};
}

function inferModelType(subjectType: string): MeetingModelType {
	const match = Object.entries(MODEL_TYPE_TO_MORPH).find(([, morph]) => morph === subjectType);
	return (match?.[0] ?? "project") as MeetingModelType;
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
		const res = await api.get<ApiEnvelope<MeetingCollectionData>>(`/meetings?${params.toString()}`);
		const meetings = res.data.data?.meetings ?? [];
		return meetings.map((raw) => toPolyMeeting(raw, modelType, modelId));
	},

	async getTodayMeetings(): Promise<PolyMeeting[]> {
		const res = await api.get<ApiEnvelope<RawMeetingResource[]>>("/schedule/today");
		const meetings = res.data.data ?? [];
		return meetings.map((raw) => toPolyMeeting(raw, inferModelType(raw.subjectType), raw.subjectId));
	},

	/**
	 * POST /meetings
	 * Creates a new meeting for a polymorphic parent.
	 *
	 * The frontend payload uses snake_case keys (model_type, model_id,
	 * scheduled_at) but the backend StoreMeetingRequest / CreateMeetingRequest
	 * expects camelCase (subjectType, subjectId, scheduledAt).
	 * We transform here so the form layer never needs to know about the mismatch.
	 */
	async createMeeting(payload: CreateMeetingPayload): Promise<PolyMeeting> {
		// Map frontend snake_case keys → backend camelCase keys
		const backendPayload = {
			subjectType: payload.model_type,
			subjectId: payload.model_id,
			title: payload.title,
			meetingType: payload.meeting_type,
			description: payload.description,
			scheduledAt: payload.scheduled_at,
			location: payload.location_type,
			locationDetails: payload.location_details,
			internalAttendees: payload.internal_attendees,
			externalAttendees: payload.external_attendees,
			assignedTo: payload.assigned_to,
		};

		const res = await api.post<ApiEnvelope<RawMeetingResource>>("/meetings", backendPayload);
		// Derive modelType from the morph string in the original payload
		const reverseMap = Object.entries(MODEL_TYPE_TO_MORPH).find(([, v]) => v === payload.model_type);
		const modelType = (reverseMap?.[0] ?? "lead") as MeetingModelType;
		return toPolyMeeting(res.data.data, modelType, payload.model_id);
	},

	/**
	 * PATCH /meetings/{id}
	 * Updates the status of a meeting.
	 * completion_note is REQUIRED for any status other than "scheduled".
	 */
	async updateMeetingStatus(meetingId: number, payload: UpdateMeetingStatusPayload): Promise<PolyMeeting> {
		const res = await api.patch<ApiEnvelope<RawMeetingResource>>(`/meetings/${meetingId}`, {
			status: payload.status,
			outcomeSummary: payload.completion_note,
		});
		return toPolyMeeting(res.data.data, inferModelType(res.data.data.subjectType), res.data.data.subjectId);
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

export function useGetTodayMeetings() {
	return useQuery({
		queryKey: [...polyMeetingKeys.lists(), "today"] as const,
		queryFn: meetingsApi.getTodayMeetings,
		staleTime: 60 * 1000,
		refetchInterval: 60 * 1000,
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
