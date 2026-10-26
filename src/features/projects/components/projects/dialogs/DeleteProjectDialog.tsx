"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleApiError } from "@/lib/errorHandling";
import { useRealtimeTimer } from "@/hooks/useTimerSocket";

export function DeleteProjectDialog({ project, onOpenChange, fromTrash = false }: { project: { projectId: number; title: string } | null; onOpenChange: (open: boolean) => void; fromTrash?: boolean }) {
	const [permanent, setPermanent] = useState(fromTrash);
	const [confirmation, setConfirmation] = useState("");
	const canPermanentlyDelete = useAuthStore((state) => state.hasPermission("force_delete_projects"));
	const client = useQueryClient();
	const { refetch: refreshTimer } = useRealtimeTimer();
	const mutation = useMutation({
		mutationFn: () => api.delete(fromTrash ? `/projects/${project!.projectId}/permanent` : `/projects/${project!.projectId}`, { data: permanent ? { permanent: true, confirmation } : { permanent: false } }),
		onSuccess: async () => {
			await Promise.all([
				client.invalidateQueries({ queryKey: ["projects"] }),
				client.invalidateQueries({ queryKey: ["project-trash"] }),
				client.invalidateQueries({ queryKey: ["dashboard-stats"] }),
				client.invalidateQueries({ queryKey: ["timeEntries", "activeTimers"] }),
				refreshTimer(),
			]);
			onOpenChange(false);
		},
	});
	return <Dialog open={!!project} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Delete {project?.title}</DialogTitle><DialogDescription>Choose whether to keep this project recoverable or remove all project-owned data permanently.</DialogDescription></DialogHeader>
		{!fromTrash && <div className="flex gap-3"><Button disabled={mutation.isPending} variant={!permanent ? "default" : "outline"} onClick={() => { mutation.reset(); setPermanent(false); }}>Move to trash</Button>{canPermanentlyDelete && <Button disabled={mutation.isPending} variant={permanent ? "destructive" : "outline"} onClick={() => { mutation.reset(); setPermanent(true); }}>Permanent deletion</Button>}</div>}
		{permanent ? <div className="space-y-3"><p className="text-sm font-medium text-destructive">This permanently removes the project, tasks, work timers and history, supervision, project records, and uploaded files. It cannot be undone. Linked external URLs and shared Google Drive folders are disconnected; external content is not erased.</p><label className="text-sm">Type the exact project name to confirm<Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label></div> : <p className="text-sm">The project and its records are retained in Projects → Trash and can be restored. Stop its running timers first.</p>}
		{mutation.isError && <p role="alert" className="text-sm text-destructive">{handleApiError(mutation.error)}</p>}
		<DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={mutation.isPending || (permanent && (!canPermanentlyDelete || confirmation !== project?.title))} onClick={() => mutation.mutate()}>{mutation.isPending ? "Deleting…" : permanent ? "Delete everything permanently" : "Move to trash"}</Button></DialogFooter>
	</DialogContent></Dialog>;
}
