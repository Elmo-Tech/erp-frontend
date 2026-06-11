"use client";

import { useState } from "react";
import { NotebookPen, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/data-display/EmptyState";
import { formatDateTimeDisplay } from "@/shared/lib/dateUtils";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { useCreateNote, useNotes } from "../api/notes.api";
import type { NoteModelType } from "../model/types";

interface NotesPanelProps {
	modelType: NoteModelType;
	modelId: number;
}

export function NotesPanel({ modelType, modelId }: NotesPanelProps) {
	const [body, setBody] = useState("");
	const notesQuery = useNotes(modelType, modelId);
	const createNote = useCreateNote(modelType, modelId);
	const notes = notesQuery.data ?? [];
	const trimmedBody = body.trim();

	const handleSubmit = async () => {
		if (!trimmedBody) {
			return;
		}

		try {
			await createNote.mutateAsync(trimmedBody);
			setBody("");
			toast.success("Note added.");
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Failed to add note."));
		}
	};

	return (
		<section className="flex flex-col gap-4">
			<div className="rounded-md border bg-background p-4">
				<div className="flex flex-col gap-3">
					<Textarea
						value={body}
						onChange={(event) => setBody(event.target.value)}
						placeholder="Add an internal note..."
						rows={4}
						disabled={createNote.isPending}
					/>
					<div className="flex justify-end">
						<Button
							type="button"
							size="sm"
							onClick={handleSubmit}
							disabled={!trimmedBody || createNote.isPending}
						>
							<Plus data-icon="inline-start" />
							Add Note
						</Button>
					</div>
				</div>
			</div>

			{notesQuery.isLoading ? (
				<div className="space-y-3">
					<Skeleton className="h-24 rounded-md" />
					<Skeleton className="h-24 rounded-md" />
				</div>
			) : notesQuery.isError ? (
				<div className="rounded-md border px-4 py-8 text-sm text-muted-foreground">Notes could not be loaded.</div>
			) : notes.length === 0 ? (
				<EmptyState
					icon={NotebookPen}
					title="No notes yet"
					description="Internal notes added for this record will appear here."
					className="min-h-64 rounded-md border bg-background"
				/>
			) : (
				<div className="space-y-3">
					{notes.map((note) => (
						<article
							key={note.noteId}
							className="rounded-md border bg-background p-4"
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div className="text-sm font-medium">{note.author?.name ?? "System"}</div>
								<div className="text-xs text-muted-foreground">{formatDateTimeDisplay(note.notedAt ?? note.createdAt)}</div>
							</div>
							<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{note.body}</p>
						</article>
					))}
				</div>
			)}
		</section>
	);
}
