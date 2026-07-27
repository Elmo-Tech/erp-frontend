"use client";

import { useEffect, useMemo, useRef } from "react";
import { CalendarDays, FolderKanban, ListTodo, LocateFixed, Maximize2, Minus, Plus } from "lucide-react";
import type { DataGroup, DataItem, Timeline as VisTimeline, TimelineAnimationOptions, TimelineOptions } from "vis-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeliveryTimelineItem } from "../types";

interface DeliveryTimelineProps {
	entries: DeliveryTimelineItem[];
}

function toLocalDate(value: string) {
	return new Date(`${value}T12:00:00`);
}

const timelineGroups: DataGroup[] = [
	{ id: "project", content: "Projects" },
	{ id: "task", content: "Tasks" },
];

const timelineOptions: TimelineOptions = {
	autoResize: true,
	editable: false,
	height: "310px",
	horizontalScroll: true,
	margin: { axis: 16, item: { horizontal: 8, vertical: 10 } },
	moveable: true,
	orientation: { axis: "top", item: "top" },
	selectable: true,
	showCurrentTime: true,
	stack: true,
	zoomable: true,
	zoomMin: 1000 * 60 * 60 * 24 * 5,
	zoomMax: 1000 * 60 * 60 * 24 * 365 * 3,
};

function timelineItems(entries: DeliveryTimelineItem[]): DataItem[] {
	return entries.map((entry) => {
		const start = toLocalDate(entry.startDate);
		const end = toLocalDate(entry.endDate);
		const isSingleDay = start.getTime() === end.getTime();

		return {
			id: entry.id,
			group: entry.entityType,
			content: entry.title,
			title: `${entry.title} — ${entry.projectName}`,
			start,
			...(isSingleDay ? { type: "point" as const } : { end, type: "range" as const }),
			className: entry.entityType === "project" ? "delivery-project" : "delivery-task",
		};
	});
}

async function createDeliveryTimeline(container: HTMLDivElement, entries: DeliveryTimelineItem[]) {
	const { Timeline } = await import("vis-timeline/standalone");
	const timeline = new Timeline(container, timelineItems(entries), timelineGroups, timelineOptions);
	timeline.fit();

	return timeline;
}

function timelineAnimation(): TimelineAnimationOptions {
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	return {
		animation: reduceMotion ? false : { duration: 180, easingFunction: "easeOutQuad" },
	};
}

export function DeliveryTimeline({ entries }: DeliveryTimelineProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const timelineRef = useRef<VisTimeline | null>(null);
	const summary = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const nextDate = entries
			.map((entry) => toLocalDate(entry.endDate))
			.filter((date) => date >= today)
			.sort((left, right) => left.getTime() - right.getTime())[0];

		return {
			projects: entries.filter((entry) => entry.entityType === "project").length,
			tasks: entries.filter((entry) => entry.entityType === "task").length,
			nextDate: nextDate?.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
		};
	}, [entries]);

	useEffect(() => {
		if (!containerRef.current || entries.length === 0) return;

		let disposed = false;
		const container = containerRef.current;

		void createDeliveryTimeline(container, entries).then((createdTimeline) => {
			if (disposed) {
				createdTimeline.destroy();
			} else {
				timelineRef.current = createdTimeline;
			}
		});

		return () => {
			disposed = true;
			timelineRef.current?.destroy();
			timelineRef.current = null;
		};
	}, [entries]);

	const fitTimeline = () => timelineRef.current?.fit(timelineAnimation());
	const showToday = () => timelineRef.current?.moveTo(new Date(), timelineAnimation());
	const zoomIn = () => timelineRef.current?.zoomIn(0.25, timelineAnimation());
	const zoomOut = () => timelineRef.current?.zoomOut(0.25, timelineAnimation());

	return (
		<Card className="overflow-hidden">
			<CardHeader className="gap-4 border-b bg-muted/20">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-2">
							<CardTitle>Delivery timeline</CardTitle>
							<Badge variant="secondary" className="font-normal">Interactive</Badge>
						</div>
						<CardDescription>Project windows and task deadlines in one interactive view.</CardDescription>
					</div>
					{entries.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							<Button type="button" variant="outline" size="sm" onClick={showToday}>
								<LocateFixed />
								Today
							</Button>
							<div className="flex items-center rounded-md border bg-background p-0.5 shadow-xs">
								<Button type="button" variant="ghost" size="icon-sm" onClick={zoomOut} aria-label="Zoom timeline out" title="Zoom out">
									<Minus />
								</Button>
								<Button type="button" variant="ghost" size="icon-sm" onClick={zoomIn} aria-label="Zoom timeline in" title="Zoom in">
									<Plus />
								</Button>
								<Button type="button" variant="ghost" size="icon-sm" onClick={fitTimeline} aria-label="Fit all timeline items" title="Fit all">
									<Maximize2 />
								</Button>
							</div>
						</div>
					)}
				</div>
				{entries.length > 0 && (
					<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
						<span className="flex items-center gap-1.5"><FolderKanban className="h-3.5 w-3.5 text-[var(--chart-3)]" />{summary.projects} projects</span>
						<span className="flex items-center gap-1.5"><ListTodo className="h-3.5 w-3.5 text-[var(--chart-5)]" />{summary.tasks} tasks</span>
						{summary.nextDate && <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Next due {summary.nextDate}</span>}
						<span className="ml-auto hidden items-center gap-4 sm:flex">
							<span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[var(--chart-3)]" />Projects</span>
							<span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[var(--chart-5)]" />Tasks</span>
						</span>
					</div>
				)}
			</CardHeader>
			<CardContent className="pt-6">
				{entries.length > 0 ? (
					<div ref={containerRef} className="delivery-timeline min-w-0 overflow-hidden rounded-xl border bg-card shadow-xs" role="region" aria-label="Interactive timeline of project deadlines and task delivery dates" />
				) : (
					<div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">Add project deadlines and task due dates to populate the timeline</div>
				)}
			</CardContent>
		</Card>
	);
}
