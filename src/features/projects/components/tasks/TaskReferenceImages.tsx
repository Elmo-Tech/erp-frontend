"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { taskKeys } from "@/features/dashboard/hooks/useTasks";
import type { Task } from "@/features/dashboard/types/task";

export function TaskReferenceImages({ task, canManage }: { task: Task; canManage: boolean }) {
	const [busy, setBusy] = useState(false);
	const queryClient = useQueryClient();
	const images = task.referenceImages ?? [];
	if (!task.isPipelineTask || !task.projectId) return null;
	const endpoint = `/projects/${task.projectId}/pipeline/tasks/${task.taskId}/references`;
	const refresh = () => queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.taskId) });
	const upload = async (files: File[]) => {
		if (images.length + files.length > 10) { toast.error("A task can have up to 10 reference images"); return; }
		if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 25 * 1024 * 1024)) { toast.error("Choose JPG, PNG, or WebP images up to 25 MB each"); return; }
		setBusy(true);
		try {
			for (const file of files) { const form = new FormData(); form.append("images[]", file); await api.post(endpoint, form, { skipSuccessToast: true }); }
			toast.success("Reference images uploaded");
		} catch { toast.error("Some images could not be uploaded. Check the images listed below."); }
		finally { await refresh(); setBusy(false); }
	};
	const remove = async (id: string) => {
		setBusy(true);
		try { await api.delete(`${endpoint}/${encodeURIComponent(id)}`); } catch { toast.error("Could not remove the reference image"); } finally { await refresh(); setBusy(false); }
	};
	return <div className="mx-6 mt-3 rounded-md border p-3 text-sm">
		<p className="font-medium">Task images</p>
		<div className="mt-2 flex max-h-28 flex-wrap gap-x-4 gap-y-2 overflow-auto">
			{task.coverImageUrl && <a className="text-primary underline" href={task.coverImageUrl} target="_blank" rel="noopener noreferrer">Open cover image</a>}
			{images.map((image, index) => <span key={image.id} className="flex items-center gap-2"><a className="text-primary underline" href={image.url} target="_blank" rel="noopener noreferrer">Reference {index + 1}</a>{canManage && <button type="button" disabled={busy} aria-label={`Remove reference ${index + 1}`} onClick={() => void remove(image.id)} className="text-destructive">×</button>}</span>)}
			{!task.coverImageUrl && !images.length && <span className="text-muted-foreground">No images yet.</span>}
		</div>
		{canManage && <label className="mt-2 block text-muted-foreground">Add up to 10 reference images · JPG, PNG, WebP · 25 MB each<input aria-label="Add reference images" disabled={busy || images.length >= 10} type="file" multiple accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-xs" onChange={(event) => { const files = Array.from(event.target.files ?? []); event.target.value = ""; if (files.length) void upload(files); }} /></label>}
	</div>;
}
