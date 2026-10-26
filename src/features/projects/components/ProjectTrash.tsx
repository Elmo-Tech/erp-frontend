"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { DeleteProjectDialog } from "./projects/dialogs/DeleteProjectDialog";

type TrashedProject = { projectId: number; title: string; deletedAt: string };
export function ProjectTrash() {
	const { hasPermission: has } = useAuthStore((state) => state);
	const client = useQueryClient();
	const [selected, setSelected] = useState<TrashedProject | null>(null);
	const query = useQuery({ queryKey: ["project-trash"], queryFn: async () => (await api.get<{ data: TrashedProject[] }>("/projects/trash")).data.data, enabled: has("view_deleted_projects") });
	const restore = useMutation({ mutationFn: (id: number) => api.post(`/projects/${id}/restore`), onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: ["project-trash"] }), client.invalidateQueries({ queryKey: ["projects"] })]) });
	if (!has("view_deleted_projects")) return <p>You do not have permission to view deleted projects.</p>;
	return <div className="space-y-4"><Button asChild variant="ghost"><Link href="/dashboard/projects">Back to projects</Link></Button><h1 className="text-2xl font-semibold">Project trash</h1>{query.isLoading ? <p>Loading deleted projects…</p> : query.isError ? <Button onClick={() => query.refetch()}>Retry</Button> : query.data?.length ? query.data.map((project) => <div key={project.projectId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><h2 className="font-medium">{project.title}</h2><p className="text-xs text-muted-foreground">Deleted {new Date(project.deletedAt).toLocaleString()}</p></div><div className="flex gap-2">{has("restore_projects") && <Button variant="outline" disabled={restore.isPending} onClick={() => restore.mutate(project.projectId)}>Restore</Button>}{has("force_delete_projects") && <Button variant="destructive" onClick={() => setSelected(project)}>Delete permanently</Button>}</div></div>) : <p>No deleted projects.</p>}{selected && <DeleteProjectDialog key={selected.projectId} project={selected} fromTrash onOpenChange={(open) => { if (!open) setSelected(null); }} />}</div>;
}
