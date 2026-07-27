"use client";

import { useEffect, useRef } from "react";
import type { DataGroup, DataItem, Timeline as VisTimeline, TimelineOptions } from "vis-timeline";
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

export function DeliveryTimeline({ entries }: DeliveryTimelineProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current || entries.length === 0) return;

		let disposed = false;
		let timeline: VisTimeline | undefined;
		const container = containerRef.current;

		void createDeliveryTimeline(container, entries).then((createdTimeline) => {
			if (disposed) {
				createdTimeline.destroy();
			} else {
				timeline = createdTimeline;
			}
		});

		return () => {
			disposed = true;
			timeline?.destroy();
		};
	}, [entries]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Delivery timeline</CardTitle>
				<CardDescription>Project deadlines and task delivery windows. Drag to move through time and scroll to zoom.</CardDescription>
			</CardHeader>
			<CardContent>
				{entries.length > 0 ? (
					<div ref={containerRef} className="delivery-timeline min-w-0 overflow-hidden rounded-lg border" role="img" aria-label="Interactive timeline of project deadlines and task delivery dates" />
				) : (
					<div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">Add project deadlines and task due dates to populate the timeline</div>
				)}
			</CardContent>
		</Card>
	);
}
