import type { NoteModelType } from "./types";

export const noteKeys = {
	all: ["notes"] as const,
	lists: () => [...noteKeys.all, "list"] as const,
	byModel: (modelType: NoteModelType, modelId: number) => [...noteKeys.lists(), modelType, modelId] as const,
};
