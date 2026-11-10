"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { taskKeys } from "@/features/dashboard/hooks/useTasks";
import { notifyApiError } from "@/lib/errorHandling";
import type { Task } from "@/features/dashboard/types/task";

export function DescriptionChecklist({ task, canEdit }: { task: Task; canEdit: boolean }) {
	const client = useQueryClient();
	const mutation = useMutation({
		mutationFn: ({ id, completed }: { id: string; completed: boolean }) => api.patch(`/tasks/${task.taskId}/checklist/${id}`, { completed }),
		onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: taskKeys.detail(task.taskId) }), client.invalidateQueries({ queryKey: ["project-pipeline", task.projectId] })]),
		onError: notifyApiError,
	});
	if (!task.checklist?.length) return null;
	return <div className="space-y-2"><h4 className="text-sm font-medium">Checklist</h4>{task.checklist.map((item) => <label key={item.id} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={item.completed} disabled={!canEdit || mutation.isPending} onChange={(event) => mutation.mutate({ id: item.id, completed: event.target.checked })} /><span className={item.completed ? "line-through text-muted-foreground" : undefined}>{item.text}</span></label>)}</div>;
}
