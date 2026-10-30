"use client";

import { useMemo } from "react";
import type { ProjectWorkflowStage } from "../../types/pipeline";

export function ProjectTaskDashboard({ stages }: { stages: ProjectWorkflowStage[] }) {
	const summary = useMemo(() => {
		const tasks = stages.flatMap((stage) => stage.tasks.map((task) => ({ task, stage })));
		const byPerson = new Map<number, { userId: number; name: string; total: number; completed: number; open: number }>();
		tasks.forEach(({ task, stage }) => task.assignees.forEach((person) => {
			const item = byPerson.get(person.userId) || { userId: person.userId, name: person.name, total: 0, completed: 0, open: 0 };
			item.total++; if (stage.category === "done") item.completed++; else if (!stage.isTerminal) item.open++;
			byPerson.set(person.userId, item);
		}));
		return { total: tasks.length, unassigned: tasks.filter(({ task }) => task.assignees.length === 0).length, active: tasks.filter(({ stage }) => stage.category === "active").length, completed: tasks.filter(({ stage }) => stage.category === "done").length, people: [...byPerson.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)) };
	}, [stages]);
	const max = Math.max(1, ...summary.people.map((person) => person.total));
	const metrics = [
		{ label: "Total tasks", value: summary.total, tone: "bg-primary/10" },
		{ label: "Unassigned", value: summary.unassigned, tone: "bg-amber-500/10" },
		{ label: "In progress", value: summary.active, tone: "bg-violet-500/10" },
		{ label: "Completed", value: summary.completed, tone: "bg-emerald-500/10" },
	];
	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">Live task summary for this project. Tasks with multiple assignees are counted for each person.</p>
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((item) => <div key={item.label} className={`rounded-2xl border border-transparent p-5 ${item.tone}`}><p className="text-sm font-medium text-muted-foreground">{item.label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</p></div>)}</div>
			<div className="grid gap-4 lg:grid-cols-2">
				<section className="rounded-2xl border bg-card p-5"><h3 className="font-semibold">Tasks by status</h3><div className="mt-4 space-y-3">{stages.map((stage) => <div key={stage.stageId}><div className="flex items-center justify-between gap-3 text-sm"><span><span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: stage.color }} />{stage.name}: {stage.tasks.length}</span></div><div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full" style={{ backgroundColor: stage.color, width: `${summary.total ? stage.tasks.length / summary.total * 100 : 0}%` }} /></div></div>)}</div></section>
				<section className="rounded-2xl border bg-card p-5"><h3 className="font-semibold">Tasks by assignee</h3>{summary.people.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No assigned tasks yet.</p> : <div className="mt-4 space-y-4">{summary.people.map((person) => <div key={person.userId}><div className="flex flex-wrap justify-between gap-1 text-sm"><span>{person.name}</span><span className="text-muted-foreground">{person.total} total · {person.open} open · {person.completed} completed</span></div><div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${person.total / max * 100}%` }} /></div></div>)}</div>}</section>
			</div>
		</div>
	);
}
