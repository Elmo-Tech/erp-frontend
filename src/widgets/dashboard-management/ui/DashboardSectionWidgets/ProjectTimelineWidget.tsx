import { CalendarClock } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface TimelineProject {
	project_id?: number;
	id?: number | string;
	title?: string;
	name?: string;
	status: string;
	start_date?: string | null;
	end_date?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	deadline?: string | null;
	progress?: number;
}

interface ProjectTimelineWidgetProps {
	timeline?: TimelineProject[];
}

interface TimelineGeometry {
	left: number;
	width: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_VISIBLE_PROJECTS = 8;

export function ProjectTimelineWidget({ timeline = [] }: ProjectTimelineWidgetProps) {
	const today = new Date();
	const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
	const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(today);
	const visibleProjects = timeline.slice(0, MAX_VISIBLE_PROJECTS);

	return (
		<section className="overflow-hidden rounded-md border border-border bg-card">
			<div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<h2 className="text-sm font-medium text-foreground">Project timeline</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">{timeline.length} active timeline items</p>
				</div>
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<CalendarClock className="size-3.5" />
					<span>{monthLabel}</span>
				</div>
			</div>

			{visibleProjects.length ? (
				<div className="divide-y divide-border">
					<div className="hidden grid-cols-[minmax(140px,220px)_minmax(0,1fr)] gap-4 px-4 py-2 text-[11px] font-medium uppercase text-muted-foreground sm:grid">
						<span>Project</span>
						<div className="grid grid-cols-4">
							<span>Week 1</span>
							<span>Week 2</span>
							<span>Week 3</span>
							<span className="text-right">Week 4</span>
						</div>
					</div>

					{visibleProjects.map((project) => {
						const geometry = getTimelineGeometry(project, monthStart, monthEnd);
						const progress = clamp(project.progress ?? 0, 0, 100);
						const projectName = project.title ?? project.name ?? "Untitled project";

						return (
							<div
								key={project.project_id ?? project.id ?? projectName}
								className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(140px,220px)_minmax(0,1fr)] sm:items-center sm:gap-4"
							>
								<div className="flex min-w-0 items-center gap-2">
									<span className={cn("size-2 shrink-0 rounded-full", statusDotClass(project.status))} />
									<div className="min-w-0">
										<p className="truncate text-sm font-medium leading-5 text-foreground">{projectName}</p>
										<p className="truncate text-xs capitalize text-muted-foreground">{project.status.replaceAll("_", " ")}</p>
									</div>
								</div>

								<div className="min-w-0">
									<div className="relative h-8 rounded-md border border-border bg-muted/25">
										<div className="absolute inset-y-0 left-1/4 border-l border-border/80" />
										<div className="absolute inset-y-0 left-1/2 border-l border-border/80" />
										<div className="absolute inset-y-0 left-3/4 border-l border-border/80" />
										<div
											className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full border border-primary/40 bg-primary/20"
											style={{
												left: `${geometry.left}%`,
												width: `${geometry.width}%`,
											}}
										>
											<div
												className="h-full rounded-full bg-primary/35"
												style={{ width: `${progress}%` }}
											/>
										</div>
									</div>
									<div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
										<span>{formatShortDate(getProjectStart(project) ?? monthStart)}</span>
										<span className="tabular-nums">{progress}%</span>
										<span>{formatShortDate(getProjectEnd(project) ?? monthEnd)}</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="flex min-h-32 items-center justify-center px-4 text-center text-sm text-muted-foreground">No project timeline data.</div>
			)}
		</section>
	);
}

function getTimelineGeometry(project: TimelineProject, monthStart: Date, monthEnd: Date): TimelineGeometry {
	const start = getProjectStart(project) ?? monthStart;
	const end = getProjectEnd(project) ?? monthEnd;
	const totalDays = Math.max(1, differenceInDays(monthStart, monthEnd));
	const offsetDays = differenceInDays(monthStart, maxDate(start, monthStart));
	const durationDays = differenceInDays(maxDate(start, monthStart), minDate(end, monthEnd));
	const left = clamp((offsetDays / totalDays) * 100, 0, 97);

	return {
		left,
		width: clamp((Math.max(1, durationDays) / totalDays) * 100, 3, 100 - left),
	};
}

function getProjectStart(project: TimelineProject) {
	return parseDate(project.start_date ?? project.startDate);
}

function getProjectEnd(project: TimelineProject) {
	return parseDate(project.end_date ?? project.endDate ?? project.deadline);
}

function parseDate(value?: string | null) {
	if (!value) {
		return undefined;
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

function differenceInDays(start: Date, end: Date) {
	return Math.ceil((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

function minDate(left: Date, right: Date) {
	return left.getTime() <= right.getTime() ? left : right;
}

function maxDate(left: Date, right: Date) {
	return left.getTime() >= right.getTime() ? left : right;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function formatShortDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function statusDotClass(status: string) {
	const normalizedStatus = status.toLowerCase();

	if (normalizedStatus.includes("complete") || normalizedStatus.includes("done")) {
		return "bg-emerald-500/80";
	}

	if (normalizedStatus.includes("blocked") || normalizedStatus.includes("overdue")) {
		return "bg-red-500/80";
	}

	if (normalizedStatus.includes("progress") || normalizedStatus.includes("active")) {
		return "bg-primary/80";
	}

	return "bg-muted-foreground/50";
}
