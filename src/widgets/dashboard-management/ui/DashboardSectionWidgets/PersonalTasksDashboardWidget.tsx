import { AlertCircle, ArrowUpRight, Circle, Clock3, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export interface PersonalTaskItem {
	task_id?: number;
	id?: number | string;
	title: string;
	status?: string;
	priority?: string | null;
	due_date?: string | null;
	date?: string | null;
	project?: string | null;
	is_late?: boolean;
}

export interface PersonalTasksSnapshot {
	summary?: {
		total?: number;
		todo?: number;
		in_progress?: number;
		review?: number;
		testing?: number;
		completed?: number;
	};
	items?: PersonalTaskItem[];
	tasks?: PersonalTaskItem[];
}

export interface BlockerItem {
	task_id?: number;
	dependency_id?: number;
	id?: number | string;
	title: string;
	status?: string;
	project?: string | null;
	is_escalated?: boolean;
	waiting_on?: string | { name?: string | null } | null;
	waitingOn?: string | { name?: string | null } | null;
	assignee?: { name?: string | null; email?: string | null } | null;
	escalated_by?: { name?: string | null; email?: string | null } | null;
	blocked_by?: Array<{
		dependency_id?: number;
		task_id?: number;
		id?: number | string;
		title?: string;
		name?: string | null;
		status?: string;
	}>;
}

interface PersonalTasksDashboardWidgetProps {
	personalTasks?: PersonalTasksSnapshot;
	blockers?: BlockerItem[];
	showTasksPanel?: boolean;
	blockersTitle?: string;
	onEscalate?: (blocker: BlockerItem) => void;
	escalatingTaskId?: number | string | null;
}

const MAX_TASKS = 8;
const MAX_BLOCKERS = 5;

export function PersonalTasksDashboardWidget({
	personalTasks,
	blockers = [],
	showTasksPanel = true,
	blockersTitle = "My blockers",
	onEscalate,
	escalatingTaskId,
}: PersonalTasksDashboardWidgetProps) {
	const tasks = (personalTasks?.items ?? personalTasks?.tasks ?? []).slice(0, MAX_TASKS);
	const visibleBlockers = blockers.slice(0, MAX_BLOCKERS);

	return (
		<section className={cn("grid gap-4", showTasksPanel && "xl:grid-cols-[minmax(0,1fr)_380px]")}>
			{showTasksPanel && (
				<div className="overflow-hidden rounded-md border border-border bg-card">
					<PanelHeader
						title="My tasks"
						description={`${personalTasks?.summary?.total ?? tasks.length} assigned today`}
					/>

					<div className="p-2">
						{tasks.length ? (
							<div className="space-y-1">
								{tasks.map((task) => (
									<TaskRow
										key={task.task_id ?? task.id ?? task.title}
										task={task}
									/>
								))}
							</div>
						) : (
							<EmptyState message="No personal tasks available." />
						)}
					</div>
				</div>
			)}

			<div className="overflow-hidden rounded-md border border-destructive/20 bg-destructive/[0.03]">
				<PanelHeader
					title={blockersTitle}
					description={`${blockers.length} waiting on action`}
					className="border-destructive/20"
				/>

				<div className="p-2">
					{visibleBlockers.length ? (
						<div className="space-y-1">
							{visibleBlockers.map((blocker) => (
								<BlockerRow
									key={blocker.task_id ?? blocker.id ?? blocker.title}
									blocker={blocker}
									onEscalate={onEscalate}
									isEscalating={Boolean(escalatingTaskId && String(escalatingTaskId) === String(blocker.task_id ?? blocker.id))}
								/>
							))}
						</div>
					) : (
						<EmptyState message="No active blockers." />
					)}
				</div>
			</div>
		</section>
	);
}

function TaskRow({ task }: { task: PersonalTaskItem }) {
	const dueDate = parseDate(task.due_date ?? task.date);
	const late = task.is_late ?? isLate(dueDate, task.status);

	return (
		<div className="flex min-w-0 items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/35">
			<div className="flex min-w-0 items-center gap-3">
				<Circle className="size-4 shrink-0 text-muted-foreground/70" />
				<div className="min-w-0">
					<p className="truncate text-sm font-medium leading-5 text-foreground">{task.title}</p>
					<p className="truncate text-xs text-muted-foreground">{task.project || normalizeStatus(task.status) || "No project"}</p>
				</div>
			</div>

			<div className={cn("shrink-0 text-xs tabular-nums text-muted-foreground", late && "text-destructive")}>{dueDate ? formatTaskDate(dueDate) : "No date"}</div>
		</div>
	);
}

function BlockerRow({ blocker, onEscalate, isEscalating }: { blocker: BlockerItem; onEscalate?: (blocker: BlockerItem) => void; isEscalating?: boolean }) {
	return (
		<div className="rounded-md border border-destructive/20 bg-destructive/[0.05] px-3 py-2">
			<div className="flex min-w-0 items-start justify-between gap-3">
				<div className="flex min-w-0 items-start gap-2">
					<AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive/80" />
					<div className="min-w-0">
						<p className="truncate text-sm font-medium leading-5 text-foreground">{blocker.title}</p>
						<p className="mt-0.5 truncate text-xs text-muted-foreground">Waiting on: {getWaitingOn(blocker)}</p>
						{blocker.assignee?.name && <p className="mt-0.5 truncate text-xs text-muted-foreground/80">Owner: {blocker.assignee.name}</p>}
					</div>
				</div>

				{onEscalate && (
					blocker.is_escalated ? (
						<span className="shrink-0 rounded-full border border-destructive/20 px-2 py-1 text-[11px] font-medium text-destructive/80">Escalated</span>
					) : (
						<Button
							type="button"
							size="sm"
							variant="outline"
							className="h-7 shrink-0 border-destructive/25 px-2 text-[11px]"
							disabled={isEscalating}
							onClick={() => onEscalate(blocker)}
						>
							{isEscalating ? <Loader2 className="size-3 animate-spin" /> : <ArrowUpRight className="size-3" />}
							Escalate
						</Button>
					)
				)}
			</div>
		</div>
	);
}

function PanelHeader({ title, description, className }: { title: string; description: string; className?: string }) {
	return (
		<div className={cn("flex items-center justify-between gap-3 border-b border-border px-4 py-3", className)}>
			<div className="min-w-0">
				<h2 className="text-sm font-medium text-foreground">{title}</h2>
				<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
			</div>
			<Clock3 className="size-4 shrink-0 text-muted-foreground" />
		</div>
	);
}

function EmptyState({ message }: { message: string }) {
	return <div className="flex min-h-24 items-center justify-center px-4 text-center text-sm text-muted-foreground">{message}</div>;
}

function getWaitingOn(blocker: BlockerItem) {
	const directWaitingOn = blocker.waiting_on ?? blocker.waitingOn;

	if (typeof directWaitingOn === "string" && directWaitingOn.trim()) {
		return directWaitingOn;
	}

	if (typeof directWaitingOn === "object" && directWaitingOn?.name) {
		return directWaitingOn.name;
	}

	const blockedBy = blocker.blocked_by ?? [];
	const names = blockedBy.map((item) => item.name || item.title).filter(Boolean);

	return names.length ? names.join(", ") : "Unassigned";
}

function normalizeStatus(status?: string) {
	return status?.replaceAll("_", " ");
}

function parseDate(value?: string | null) {
	if (!value) {
		return undefined;
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

function isLate(date?: Date, status?: string) {
	if (!date || status?.toLowerCase().includes("complete")) {
		return false;
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const comparableDate = new Date(date);
	comparableDate.setHours(0, 0, 0, 0);

	return comparableDate.getTime() < today.getTime();
}

function formatTaskDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}
