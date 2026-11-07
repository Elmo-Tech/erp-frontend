"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { notifyApiError } from "@/lib/errorHandling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EditableWorkflowStage, WorkflowStageCategory } from "@/features/projects/types/pipeline";

type Source = { key: string; name: string; slug: string; category: WorkflowStageCategory; projects: number; tasks: number };
type Snapshot = { stages: EditableWorkflowStage[]; sources: Source[]; revision: string };
const categories: WorkflowStageCategory[] = ["backlog", "planned", "active", "review", "paused", "done", "cancelled"];

export function GlobalWorkflowSettings() {
	const [generation, setGeneration] = useState(0);
	const query = useQuery({ queryKey: ["global-workflow"], refetchOnWindowFocus: false, staleTime: Infinity, queryFn: async () => (await api.get<{ data: Snapshot }>("/workflow-settings")).data.data });
	if (query.isLoading) return <p>Loading workflow…</p>;
	if (query.isError || !query.data) return <div role="alert">Could not load workflow. <Button variant="outline" onClick={() => void query.refetch()}>Retry</Button></div>;
	return <WorkflowEditor key={`${query.data.revision}:${generation}`} snapshot={query.data} reload={() => { void query.refetch().then(() => setGeneration((value) => value + 1)); }} />;
}

function WorkflowEditor({ snapshot, reload }: { snapshot: Snapshot; reload: () => void }) {
	const queryClient = useQueryClient();
	const [draft, setDraft] = useState<EditableWorkflowStage[]>(() => snapshot.stages);
	const [mapping, setMapping] = useState<Record<string, string>>(() => Object.fromEntries(snapshot.sources.map((source) => [source.key, snapshot.stages.find((stage) => stage.slug === source.slug && stage.category === source.category)?.slug ?? ""])));
	const [review, setReview] = useState(false);
	const save = useMutation({ mutationFn: async () => (await api.put("/workflow-settings", { revision: snapshot.revision, stages: draft, mapping })).data,
		onSuccess: async () => { setReview(false); await Promise.all([queryClient.invalidateQueries({ queryKey: ["global-workflow"] }), queryClient.invalidateQueries({ queryKey: ["project-pipeline"] }), queryClient.invalidateQueries({ queryKey: ["tasks"] }), queryClient.invalidateQueries({ queryKey: ["timeEntries"] })]); },
		onError: (error) => { setReview(false); notifyApiError(error); },
	});
	const patch = (index: number, value: Partial<EditableWorkflowStage>) => setDraft((stages) => stages.map((stage, i) => i === index ? { ...stage, ...value } : stage));
	const move = (index: number, delta: number) => setDraft((stages) => { const next = [...stages]; const target = index + delta; if (target < 0 || target >= next.length) return next; [next[index], next[target]] = [next[target], next[index]]; return next; });
	const useSuggestedStages = () => {
		const ordered = ["planned", "active", "review", "paused", "done"].map((category) => draft.find((stage) => stage.category === category));
		if (ordered.some((stage) => !stage)) return;
		setDraft(ordered.map((stage, index) => ({ ...stage!, name: index === 0 ? "To Do" : stage!.name })));
	};
	const targets = new Set(draft.map((stage) => stage.slug));
	const complete = snapshot.sources.every((source) => targets.has(mapping[source.key]));
	const uniqueNames = new Set(draft.map((stage) => stage.name.trim().toLocaleLowerCase())).size === draft.length;
	const valid = draft.length >= 2 && uniqueNames && draft.every((stage) => stage.name.trim()) && ["active", "paused", "done"].every((category) => draft.filter((stage) => stage.category === category).length === 1) && draft.some((stage) => stage.category === "planned");
	const changeCount = snapshot.sources.reduce((total, source) => total + (draft.find((stage) => stage.slug === mapping[source.key])?.category !== source.category ? source.tasks : 0), 0);
	return <div className="space-y-5 rounded-xl border p-5">
		<div><h2 className="text-lg font-semibold">Company workflow</h2><p className="text-sm text-muted-foreground">These stages apply to every project. Changes to stages and task categories affect existing projects as well as new ones.</p></div>
		<Button variant="outline" onClick={useSuggestedStages} disabled={["planned", "active", "review", "paused", "done"].some((category) => !draft.some((stage) => stage.category === category))}>Use five-stage arrangement</Button>
		<div className="space-y-3">{draft.map((stage, index) => <div key={stage.slug} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
			<div><Label htmlFor={`color-${stage.slug}`}>Color</Label><Input id={`color-${stage.slug}`} className="w-16" type="color" value={stage.color} onChange={(e) => patch(index, { color: e.target.value })} /></div>
			<div className="min-w-40 flex-1"><Label htmlFor={`name-${stage.slug}`}>Stage name</Label><Input id={`name-${stage.slug}`} value={stage.name} maxLength={80} onChange={(e) => patch(index, { name: e.target.value })} /></div>
			<div><Label htmlFor={`category-${stage.slug}`}>Category</Label><select id={`category-${stage.slug}`} className="block h-9 rounded-md border bg-background px-2 text-sm" value={stage.category} onChange={(e) => { const category = e.target.value as WorkflowStageCategory; patch(index, { category, isTerminal: category === "done" || category === "cancelled" }); }}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
			<Button variant="ghost" size="icon" aria-label={`Move ${stage.name} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></Button><Button variant="ghost" size="icon" aria-label={`Move ${stage.name} down`} disabled={index === draft.length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button><Button variant="ghost" size="icon" aria-label={`Remove ${stage.name}`} onClick={() => setDraft((s) => s.filter((_, i) => i !== index))}><Trash2 /></Button>
		</div>)}</div>
		<Button variant="outline" onClick={() => setDraft((s) => [...s, { slug: `stage_${crypto.randomUUID().replaceAll("-", "")}`, name: "New stage", color: "#64748b", category: "planned", isTerminal: false }])} disabled={draft.length >= 20}><Plus /> Add stage</Button>
		<p className="text-sm text-muted-foreground">Use unique names, one active, one paused and one done category, and at least one planned category. Done and cancelled are terminal. Changing a category can change task status and stop running timers.</p>
		<div className="space-y-3 border-t pt-4"><h3 className="font-semibold">Map existing stages</h3><p className="text-sm text-muted-foreground">Choose where each existing stage goes. Counts include tasks in deleted projects or tasks that may be restored.</p>
			{snapshot.sources.map((source) => <div key={source.key} className="flex flex-wrap items-center gap-3"><span className="min-w-56 text-sm">{source.name} [{source.slug}] ({source.category}) · {source.tasks} tasks · {source.projects} projects</span><select aria-label={`Map ${source.name} ${source.category}`} className="h-9 rounded-md border bg-background px-2 text-sm" value={targets.has(mapping[source.key]) ? mapping[source.key] : ""} onChange={(e) => setMapping((old) => ({ ...old, [source.key]: e.target.value }))}><option value="">Choose destination</option>{draft.map((target) => <option key={target.slug} value={target.slug}>{target.name} ({target.category})</option>)}</select></div>)}
		</div>
		<div className="flex gap-2"><Button disabled={!complete || !valid || save.isPending} onClick={() => setReview(true)}>Review changes</Button><Button variant="outline" disabled={save.isPending} onClick={reload}>Reload and discard edits</Button></div>{save.isError && <p role="alert" className="text-sm text-destructive">Changes were not applied. If the workflow or task counts changed, reload and review again.</p>}
		<Dialog open={review} onOpenChange={setReview}><DialogContent className="max-h-[85vh] overflow-auto"><DialogHeader><DialogTitle>Apply workflow to all projects?</DialogTitle><DialogDescription>Review these mappings. {changeCount} tasks are mapped to a different category; completed stages stop running timers. An audit record will be saved.</DialogDescription></DialogHeader><div className="space-y-1 text-sm">{snapshot.sources.map((source) => <p key={source.key}>{source.name} ({source.category}) → {draft.find((stage) => stage.slug === mapping[source.key])?.name} ({draft.find((stage) => stage.slug === mapping[source.key])?.category}) · {source.tasks} tasks</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setReview(false)}>Back</Button><Button disabled={save.isPending} onClick={() => save.mutate()}>Apply to all projects</Button></DialogFooter></DialogContent></Dialog>
	</div>;
}
