"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/base";
import { noteKeys } from "../model/query-keys";
import type { CreateNotePayload, Note, NoteModelType } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
	success?: boolean;
	message?: string;
}

interface NotesEnvelope {
	notes: Note[];
}

export const notesApi = {
	async getNotes(modelType: NoteModelType, modelId: number): Promise<Note[]> {
		const params = new URLSearchParams({
			modelType,
			modelId: String(modelId),
		});
		const response = await api.get<ApiEnvelope<NotesEnvelope>>(`/notes?${params.toString()}`);
		return response.data.data?.notes ?? [];
	},

	async createNote(payload: CreateNotePayload): Promise<Note> {
		const response = await api.post<ApiEnvelope<Note>>("/notes", payload);
		return response.data.data;
	},
};

export function useNotes(modelType: NoteModelType, modelId: number, enabled = true) {
	return useQuery({
		queryKey: noteKeys.byModel(modelType, modelId),
		queryFn: () => notesApi.getNotes(modelType, modelId),
		enabled: enabled && modelId > 0,
		staleTime: 60 * 1000,
	});
}

export function useCreateNote(modelType: NoteModelType, modelId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: string) => notesApi.createNote({ modelType, modelId, body }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: noteKeys.byModel(modelType, modelId) });
		},
	});
}
