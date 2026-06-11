export type NoteModelType = "client" | "project" | "lead";

export const NOTE_MODEL_TO_MORPH: Record<NoteModelType, string> = {
	client: "App\\Modules\\Client\\Models\\Client",
	project: "App\\Modules\\Project\\Models\\Project",
	lead: "App\\Modules\\Lead\\Models\\Lead",
};

export interface NoteAuthor {
	userId: number;
	name: string;
	email?: string | null;
}

export interface Note {
	noteId: number;
	modelType: string;
	modelId: number;
	body: string;
	notedAt: string | null;
	author: NoteAuthor | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateNotePayload {
	modelType: NoteModelType;
	modelId: number;
	body: string;
	notedAt?: string | null;
}
