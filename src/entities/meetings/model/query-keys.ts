import type { MeetingModelType } from "./types";

export const polyMeetingKeys = {
	all: ["poly-meetings"] as const,
	lists: () => [...polyMeetingKeys.all, "list"] as const,
	byModel: (modelType: MeetingModelType, modelId: number) => [...polyMeetingKeys.lists(), modelType, modelId] as const,
	detail: (id: number) => [...polyMeetingKeys.all, "detail", id] as const,
};
