"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface TaskStatusRow {
	id: number;
	title: string;
	project?: string | null;
	projectId?: number | null;
	assignees: string[];
	dueDate?: string | null;
	priority?: string | null;
	onOpen: () => void;
}

export interface TaskStatusGroup {
	id: string;
	name: string;
	color?: string | null;
	tasks: TaskStatusRow[];
	onCreate?: () => void;
}

const EMPTY_COLLAPSED = "[]";
const COLLAPSED_CHANGED = "task-status-collapse-changed";

export function TaskStatusSections({ groups, showProject = false, storageKey }: { groups: TaskStatusGroup[]; showProject?: boolean; storageKey?: string }) {
	const [localCollapsed, setLocalCollapsed] = useState<string[]>([]);
	const [storageFailed, setStorageFailed] = useState(false);
	const subscribe = useCallback((onChange: () => void) => {
		window.addEventListener("storage", onChange);
		window.addEventListener(COLLAPSED_CHANGED, onChange);
		return () => { window.removeEventListener("storage", onChange); window.removeEventListener(COLLAPSED_CHANGED, onChange); };
	}, []);
	const getSnapshot = useCallback(() => {
		try { return storageKey ? window.localStorage.getItem(storageKey) ?? EMPTY_COLLAPSED : EMPTY_COLLAPSED; } catch { return EMPTY_COLLAPSED; }
	}, [storageKey]);
	const stored = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_COLLAPSED);
	const storedCollapsed = useMemo(() => {
		try { const parsed: unknown = JSON.parse(stored); return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []; } catch { return []; }
	}, [stored]);
	const collapsed = storageKey && !storageFailed ? storedCollapsed : localCollapsed;
	const toggle = (id: string) => {
		const next = collapsed.includes(id) ? collapsed.filter((value) => value !== id) : [...collapsed, id];
		if (storageKey && !storageFailed) {
			try { window.localStorage.setItem(storageKey, JSON.stringify(next)); window.dispatchEvent(new Event(COLLAPSED_CHANGED)); return; }
			catch { setStorageFailed(true); }
		}
		setLocalCollapsed(next);
	};
	return <div className="space-y-4">{groups.map((group) => {
		const isCollapsed = collapsed.includes(group.id);
		const color = group.color || "#64748b";
		return <section key={group.id} aria-label={`${group.name} tasks`}>
			<div className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1" style={{ backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)` }}>
				<button type="button" aria-expanded={!isCollapsed} onClick={() => toggle(group.id)} className="inline-flex items-center gap-2 rounded-md p-1 text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring">
					{isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}<span className="size-2 rounded-full" style={{ backgroundColor: color }} />{group.name}<span className="text-muted-foreground">({group.tasks.length})</span>
				</button>
				{group.onCreate && <Button variant="ghost" size="sm" onClick={group.onCreate}>+ Add task</Button>}
			</div>
			{!isCollapsed && <div className="overflow-x-auto"><table className={`w-full table-fixed ${showProject ? "min-w-[760px]" : "min-w-[600px]"} text-sm`}><colgroup><col className={showProject ? "w-[29%]" : "w-[40%]"} />{showProject && <col className="w-[23%]" />}<col className={showProject ? "w-[22%]" : "w-[30%]"} /><col className={showProject ? "w-[16%]" : "w-[20%]"} /><col className="w-[10%]" /></colgroup><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="p-3 font-medium">Task</th>{showProject && <th className="p-3 font-medium">Project</th>}<th className="p-3 font-medium">Assignee</th><th className="p-3 font-medium">Due date</th><th className="p-3 font-medium">Priority</th></tr></thead><tbody>{group.tasks.map((task) => <tr key={task.id} onDoubleClick={task.onOpen} className="cursor-pointer border-b last:border-0 hover:bg-muted/30"><td className="break-words p-3"><button type="button" onClick={task.onOpen} className="text-left font-medium hover:text-primary hover:underline">{task.title}</button></td>{showProject && <td className="break-words p-3 text-muted-foreground">{task.projectId ? <Link href={`/dashboard/projects/${task.projectId}`} className="text-primary hover:underline" onDoubleClick={(event) => event.stopPropagation()}>{task.project || "Open project"}</Link> : task.project || "No project"}</td>}<td className="break-words p-3 text-muted-foreground">{task.assignees.join(", ") || "Unassigned"}</td><td className="p-3 text-muted-foreground">{task.dueDate || "—"}</td><td className="p-3 capitalize">{task.priority || "—"}</td></tr>)}</tbody></table>{group.tasks.length === 0 && <p className="px-3 py-4 text-sm text-muted-foreground">No matching tasks</p>}</div>}
		</section>;
	})}</div>;
}
