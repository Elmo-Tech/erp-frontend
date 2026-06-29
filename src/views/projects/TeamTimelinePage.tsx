"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { addDays, eachDayOfInterval, format, parseISO } from "date-fns";
import { AlertTriangle, ArrowRight, CalendarRange, FolderKanban, RotateCw, Users } from "lucide-react";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { DatePicker } from "@/shared/ui/forms";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { ExecutionTaskStatusLabels, useProjectTimeline, type ProjectTimelineItem } from "@/features/projects/api/execution.api";

function isoDate(date: Date): string {
	return format(date, "yyyy-MM-dd");
}

function toggleValue(values: number[], value: number): number[] {
	return values.includes(value) ? values.filter((current) => current !== value) : [...values, value];
}

export default function TeamTimelinePage() {
	const router = useRouter();
	const today = useMemo(() => new Date(), []);
	const [startDate, setStartDate] = useState(isoDate(today));
	const [endDate, setEndDate] = useState(isoDate(addDays(today, 14)));
	const [projectIds, setProjectIds] = useState<number[]>([]);
	const [userIds, setUserIds] = useState<number[]>([]);
	const [status, setStatus] = useState<string>("all");
	const [overloadOnly, setOverloadOnly] = useState(false);

	const timelineQuery = useProjectTimeline({ startDate, endDate, projectIds, userIds });
	const projectsQuery = useQuery({
		queryKey: projectKeys.list({ perPage: 100 }),
		queryFn: () => projectApi.getProjects({ perPage: 100 }),
		staleTime: 5 * 60 * 1000,
	});

	const days = useMemo(() => {
		if (!startDate || !endDate) return [];
		return eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) }).map((day) => isoDate(day));
	}, [startDate, endDate]);

	const timeline = timelineQuery.data;
	const conflictsByUserDate = useMemo(() => {
		const map = new Map<string, number>();
		for (const conflict of timeline?.conflicts ?? []) {
			map.set(`${conflict.userId}:${conflict.date}`, conflict.overloadHours);
		}
		return map;
	}, [timeline?.conflicts]);

	const filteredItems = useMemo(() => {
		const base = timeline?.items ?? [];
		const statusFiltered = status === "all" ? base : base.filter((item) => item.status === status);
		if (!overloadOnly) return statusFiltered;

		const overloadedTaskIds = new Set((timeline?.conflicts ?? []).flatMap((conflict) => conflict.taskIds));
		return statusFiltered.filter((item) => overloadedTaskIds.has(item.taskId));
	}, [overloadOnly, status, timeline?.conflicts, timeline?.items]);

	const itemsByUser = useMemo(() => {
		const map = new Map<number, ProjectTimelineItem[]>();
		for (const item of filteredItems) {
			if (item.assigneeId == null) continue;
			const existing = map.get(item.assigneeId) ?? [];
			existing.push(item);
			map.set(item.assigneeId, existing);
		}
		return map;
	}, [filteredItems]);

	const statusOptions = Object.entries(ExecutionTaskStatusLabels).map(([value, label]) => ({ value, label }));

	const handleTaskOpen = (item: ProjectTimelineItem) => {
		router.push(`/dashboard/projects/${item.projectId}?taskId=${item.taskId}`);
	};

	return (
		<section className="flex flex-col gap-5">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Team Timeline</h1>
					<p className="mt-1 text-sm text-muted-foreground">Plan project tasks across people, capacity, and active conflicts.</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => timelineQuery.refetch()}
					disabled={timelineQuery.isFetching}
				>
					<RotateCw className={cn("size-4", timelineQuery.isFetching && "animate-spin")} />
					Refresh
				</Button>
			</div>

			<div className="grid gap-3 rounded-md border bg-background p-3 lg:grid-cols-[1.1fr_1fr_1fr_auto]">
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<Label htmlFor="timeline-start">Start</Label>
						<DatePicker
							id="timeline-start"
							value={startDate}
							onChange={setStartDate}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="timeline-end">End</Label>
						<DatePicker
							id="timeline-end"
							value={endDate}
							onChange={setEndDate}
						/>
					</div>
				</div>

				<FilterChecklist
					title="Projects"
					icon={<FolderKanban className="size-4" />}
					options={(projectsQuery.data?.projects ?? []).map((project) => ({ id: project.projectId, label: project.title }))}
					selected={projectIds}
					onToggle={(id) => setProjectIds((current) => toggleValue(current, id))}
				/>

				<FilterChecklist
					title="People"
					icon={<Users className="size-4" />}
					options={(timeline?.users ?? []).map((user) => ({ id: user.userId, label: user.name }))}
					selected={userIds}
					onToggle={(id) => setUserIds((current) => toggleValue(current, id))}
				/>

				<div className="flex flex-col gap-3">
					<label className="flex flex-col gap-1.5 text-sm font-medium">
						Status
						<select
							value={status}
							onChange={(event) => setStatus(event.target.value)}
							className="h-9 rounded-md border bg-background px-3 text-sm font-normal"
						>
							<option value="all">All statuses</option>
							{statusOptions.map((option) => (
								<option
									key={option.value}
									value={option.value}
								>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<label className="flex items-center gap-2 text-sm">
						<Checkbox
							checked={overloadOnly}
							onCheckedChange={(checked) => setOverloadOnly(checked === true)}
						/>
						Overload only
					</label>
				</div>
			</div>

			{timelineQuery.isLoading ? (
				<TimelineSkeleton />
			) : timelineQuery.error ? (
				<div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">Failed to load timeline.</div>
			) : !timeline || timeline.items.length === 0 ? (
				<div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center">
					<CalendarRange className="size-8 text-muted-foreground/50" />
					<p className="text-sm font-medium">No scheduled tasks in this range</p>
					<p className="max-w-sm text-xs text-muted-foreground">Add task start and due dates to see workload planning here.</p>
				</div>
			) : (
				<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
					<div className="overflow-hidden rounded-md border">
						<div
							className="grid border-b bg-muted/40 text-xs font-medium text-muted-foreground"
							style={{ gridTemplateColumns: `220px repeat(${days.length}, minmax(72px, 1fr))` }}
						>
							<div className="px-3 py-2">Member</div>
							{days.map((day) => (
								<div
									key={day}
									className="border-l px-2 py-2 text-center"
								>
									<div>{format(parseISO(day), "EEE")}</div>
									<div className="tabular-nums">{format(parseISO(day), "MMM d")}</div>
								</div>
							))}
						</div>

						<div className="max-h-[620px] overflow-auto">
							{timeline.users.map((user) => {
								const userItems = itemsByUser.get(user.userId) ?? [];
								if (overloadOnly && userItems.length === 0) return null;

								return (
									<div
										key={user.userId}
										className="grid min-h-28 border-b last:border-b-0"
										style={{ gridTemplateColumns: `220px repeat(${days.length}, minmax(72px, 1fr))` }}
									>
										<div className="sticky left-0 z-10 border-r bg-background p-3">
											<div className="truncate text-sm font-medium">{user.name}</div>
											<div className="mt-1 text-xs text-muted-foreground">{userItems.length} scheduled tasks</div>
										</div>
										{days.map((day) => {
											const capacity = user.dailyCapacityHoursByDate[day] ?? 0;
											const allocated = userItems.reduce((total, item) => total + (item.allocatedHoursByDate[day] ?? 0), 0);
											const overload = conflictsByUserDate.get(`${user.userId}:${day}`) ?? 0;

											return (
												<div
													key={day}
													className={cn("min-h-28 border-l p-1.5", overload > 0 ? "bg-red-50/80" : capacity === 0 ? "bg-muted/30" : "bg-background")}
												>
													<div className="mb-1 flex items-center justify-between text-[11px] tabular-nums text-muted-foreground">
														<span>{allocated.toFixed(1)}h</span>
														<span>{capacity.toFixed(0)}h</span>
													</div>
													<div className="flex flex-col gap-1">
														{userItems
															.filter((item) => (item.allocatedHoursByDate[day] ?? 0) > 0)
															.map((item) => (
																<button
																	key={item.taskId}
																	type="button"
																	onClick={() => handleTaskOpen(item)}
																	className="min-h-10 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-left text-[11px] leading-tight text-sky-950 hover:border-sky-300 hover:bg-sky-100"
																>
																	<span className="block truncate font-medium">{item.title}</span>
																	<span className="block truncate text-sky-700">{item.projectTitle}</span>
																</button>
															))}
													</div>
												</div>
											);
										})}
									</div>
								);
							})}
						</div>
					</div>

					<ConflictPanel
						conflicts={timeline.conflicts}
						suggestions={timeline.suggestions}
						items={timeline.items}
						userNames={new Map(timeline.users.map((user) => [user.userId, user.name]))}
					/>
				</div>
			)}
		</section>
	);
}

function FilterChecklist({ title, icon, options, selected, onToggle }: { title: string; icon: React.ReactNode; options: { id: number; label: string }[]; selected: number[]; onToggle: (id: number) => void }) {
	return (
		<div className="rounded-md border p-2">
			<div className="mb-2 flex items-center gap-2 text-sm font-medium">
				{icon}
				{title}
				{selected.length > 0 && <Badge variant="secondary">{selected.length}</Badge>}
			</div>
			<div className="flex max-h-24 flex-col gap-1 overflow-auto pr-1">
				{options.length === 0 ? (
					<div className="text-xs text-muted-foreground">No options</div>
				) : (
					options.map((option) => (
						<label
							key={option.id}
							className="flex items-center gap-2 rounded-sm px-1 py-0.5 text-xs hover:bg-muted"
						>
							<Checkbox
								checked={selected.includes(option.id)}
								onCheckedChange={() => onToggle(option.id)}
							/>
							<span className="truncate">{option.label}</span>
						</label>
					))
				)}
			</div>
		</div>
	);
}

function ConflictPanel({ conflicts, suggestions, items, userNames }: { conflicts: { userId: number; date: string; overloadHours: number; allocatedHours: number; capacityHours: number; taskIds: number[] }[]; suggestions: { type: string; risk: string; taskId: number; reason: string; current: { startDate: string | null; dueDate: string | null; assigneeId: number | null }; suggested: { startDate: string | null; dueDate: string | null; assigneeId: number | null; assigneeName?: string | null } }[]; items: ProjectTimelineItem[]; userNames: Map<number, string> }) {
	const itemsById = new Map(items.map((item) => [item.taskId, item]));

	return (
		<aside className="flex flex-col gap-3">
			<div className="rounded-md border p-3">
				<div className="mb-3 flex items-center gap-2">
					<AlertTriangle className="size-4 text-red-600" />
					<h2 className="text-sm font-semibold">Conflicts</h2>
					<Badge variant={conflicts.length > 0 ? "destructive" : "secondary"}>{conflicts.length}</Badge>
				</div>
				<div className="flex max-h-64 flex-col gap-2 overflow-auto">
					{conflicts.length === 0 ? (
						<p className="text-sm text-muted-foreground">No overload detected in this range.</p>
					) : (
						conflicts.map((conflict) => (
							<div
								key={`${conflict.userId}-${conflict.date}`}
								className="rounded-md border bg-red-50 p-2 text-sm"
							>
								<div className="font-medium text-red-950">{userNames.get(conflict.userId) ?? `User #${conflict.userId}`}</div>
								<div className="mt-1 text-xs text-red-800">
									{conflict.date}: {conflict.allocatedHours}h allocated / {conflict.capacityHours}h capacity
								</div>
								<div className="mt-1 text-xs font-medium text-red-900">+{conflict.overloadHours}h overload</div>
							</div>
						))
					)}
				</div>
			</div>

			<div className="rounded-md border p-3">
				<div className="mb-3 flex items-center gap-2">
					<ArrowRight className="size-4 text-sky-700" />
					<h2 className="text-sm font-semibold">Suggestions</h2>
					<Badge variant="secondary">{suggestions.length}</Badge>
				</div>
				<div className="flex max-h-[420px] flex-col gap-2 overflow-auto">
					{suggestions.length === 0 ? (
						<p className="text-sm text-muted-foreground">No suggestions for the current conflicts.</p>
					) : (
						suggestions.map((suggestion) => {
							const task = itemsById.get(suggestion.taskId);
							return (
								<div
									key={`${suggestion.type}-${suggestion.taskId}`}
									className="rounded-md border p-2 text-sm"
								>
									<div className="flex items-center justify-between gap-2">
										<div className="truncate font-medium">{task?.title ?? `Task #${suggestion.taskId}`}</div>
										<Badge variant={suggestion.risk === "low" ? "secondary" : "outline"}>{suggestion.type}</Badge>
									</div>
									<p className="mt-1 text-xs text-muted-foreground">{suggestion.reason}</p>
									<div className="mt-2 rounded-sm bg-muted/50 p-2 text-xs">
										{suggestion.type === "reassign" ? (
											<span>Move to {suggestion.suggested.assigneeName ?? `User #${suggestion.suggested.assigneeId}`}</span>
										) : (
											<span>
												{suggestion.current.startDate} - {suggestion.current.dueDate} → {suggestion.suggested.startDate} - {suggestion.suggested.dueDate}
											</span>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</aside>
	);
}

function TimelineSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-28 w-full" />
			<Skeleton className="h-28 w-full" />
			<Skeleton className="h-28 w-full" />
		</div>
	);
}
