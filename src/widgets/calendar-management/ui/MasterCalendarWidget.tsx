"use client";

/**
 * MasterCalendarWidget
 *
 * Powered by react-big-calendar + date-fns localizer.
 * Maps AggregatedCalendarItem → RBC Event format.
 * Vercel-style minimal CSS overrides via Tailwind.
 */

import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, CheckSquare, FileText } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Can } from "@/shared/ui/Can";
import { EventFormModal } from "@/features/calendar/ui/EventFormModal";
import { DeleteEventDialog } from "@/features/calendar/ui/DeleteEventDialog";
import { useCalendarFeed } from "@/features/calendar/model/use-calendar-actions";
import type { AggregatedCalendarItem, AggregatedItemType, EventMeta } from "@/entities/calendar/model/types";
import { cn } from "@/shared/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// date-fns localizer
// ─────────────────────────────────────────────────────────────────────────────

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
	getDay,
	locales,
});

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_COLOR_HEX: Record<AggregatedItemType, string> = {
	event: "#3b82f6", // blue-500
	task: "#8b5cf6", // violet-500
	invoice: "#f59e0b", // amber-500
};

const TYPE_LABEL: Record<AggregatedItemType, string> = {
	event: "Event",
	task: "Task",
	invoice: "Invoice",
};

const TYPE_ICON: Record<AggregatedItemType, React.ElementType> = {
	event: Clock,
	task: CheckSquare,
	invoice: FileText,
};

// ─────────────────────────────────────────────────────────────────────────────
// RBC Event shape
// ─────────────────────────────────────────────────────────────────────────────

interface CalendarEvent {
	title: string;
	start: Date;
	end: Date;
	resource: AggregatedCalendarItem;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toCalendarEvent(item: AggregatedCalendarItem): CalendarEvent {
	// Use startTime/endTime when available; fall back to the item's date (all-day)
	const baseDate = new Date(item.date);
	const start = item.startTime ? new Date(item.startTime) : baseDate;
	const end = item.endTime
		? new Date(item.endTime)
		: item.startTime
			? new Date(start.getTime() + 60 * 60 * 1000) // +1 h default
			: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000 - 1); // end of day

	return { title: item.title, start, end, resource: item };
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom event component — compact pill with type colour
// ─────────────────────────────────────────────────────────────────────────────

function EventPill({ event }: { event: CalendarEvent }) {
	const item = event.resource;
	const Icon = TYPE_ICON[item.type];
	return (
		<div
			className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] font-medium text-white"
			style={{ backgroundColor: TYPE_COLOR_HEX[item.type] }}
		>
			<Icon className="h-2.5 w-2.5 shrink-0" />
			<span className="truncate">{event.title}</span>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function MasterCalendarWidget() {
	const [currentDate, setCurrentDate] = useState(() => new Date());
	const [view, setView] = useState<View>(Views.MONTH);

	// Modal state
	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<AggregatedCalendarItem | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AggregatedCalendarItem | null>(null);

	// Fetch range based on current month
	const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
	const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

	const { data, isLoading, error } = useCalendarFeed({ startDate, endDate });

	// Map items → RBC events
	const events = useMemo<CalendarEvent[]>(() => (data?.items ?? []).map(toCalendarEvent), [data]);

	const handleCreateEvent = () => {
		setEditTarget(null);
		setFormOpen(true);
	};

	const handleCloseForm = () => {
		setFormOpen(false);
		setEditTarget(null);
	};

	// RBC event click — only native events are editable
	const handleSelectEvent = useCallback((event: CalendarEvent) => {
		const item = event.resource;
		if (item.type === "event") {
			setEditTarget(item);
			setFormOpen(true);
		}
	}, []);

	// Colour each event by type
	const eventPropGetter = useCallback(
		(event: CalendarEvent) => ({
			style: {
				backgroundColor: TYPE_COLOR_HEX[event.resource.type],
				border: "none",
				borderRadius: "4px",
				color: "#fff",
				fontSize: "11px",
				padding: "1px 4px",
			},
		}),
		[],
	);

	const editTargetAsEvent = editTarget
		? {
				id: parseInt(editTarget.id.replace("event-", ""), 10),
				userId: (editTarget.meta as EventMeta).creatorId,
				title: editTarget.title,
				description: (editTarget.meta as EventMeta).description,
				startTime: editTarget.startTime ?? "",
				endTime: editTarget.endTime ?? "",
				eventType: (editTarget.meta as EventMeta).eventType,
				createdAt: "",
				updatedAt: "",
			}
		: null;

	return (
		<>
			{/*
			  ── Minimal RBC CSS overrides ──────────────────────────────────────
			  We import the base stylesheet and override only what's needed to
			  match the Shadcn / Vercel design language (neutral palette, no
			  heavy borders, clean typography).
			*/}
			<style>{`
				.rbc-calendar { font-family: inherit; }
				.rbc-header { padding: 6px 4px; font-size: 11px; font-weight: 600;
				              text-transform: uppercase; letter-spacing: .05em;
				              color: hsl(var(--muted-foreground)); border-bottom: 1px solid hsl(var(--border)); }
				.rbc-month-view { border: 1px solid hsl(var(--border)); border-radius: 8px; overflow: hidden; }
				.rbc-day-bg + .rbc-day-bg { border-left: 1px solid hsl(var(--border)); }
				.rbc-month-row + .rbc-month-row { border-top: 1px solid hsl(var(--border)); }
				.rbc-off-range-bg { background: hsl(var(--muted) / .3); }
				.rbc-today { background: hsl(var(--primary) / .05); }
				.rbc-date-cell { padding: 4px 6px; font-size: 12px; }
				.rbc-date-cell.rbc-now > a { display: inline-flex; align-items: center; justify-content: center;
				                             width: 20px; height: 20px; border-radius: 50%;
				                             background: hsl(var(--primary)); color: hsl(var(--primary-foreground));
				                             font-weight: 600; }
				.rbc-event { padding: 0; background: transparent; border: none; }
				.rbc-event:focus { outline: 2px solid hsl(var(--ring)); outline-offset: 1px; }
				.rbc-show-more { font-size: 11px; color: hsl(var(--muted-foreground)); padding: 0 4px; }
				.rbc-toolbar { display: none; }
				.rbc-agenda-view table.rbc-agenda-table { border: 1px solid hsl(var(--border)); border-radius: 8px; overflow: hidden; }
				.rbc-agenda-table thead > tr > th { background: hsl(var(--muted) / .4); font-size: 11px;
				                                    font-weight: 600; text-transform: uppercase; letter-spacing: .05em;
				                                    color: hsl(var(--muted-foreground)); padding: 8px 12px; }
				.rbc-agenda-table tbody > tr > td { padding: 8px 12px; font-size: 13px; }
				.rbc-agenda-table tbody > tr + tr > td { border-top: 1px solid hsl(var(--border)); }
				.rbc-time-view { border: 1px solid hsl(var(--border)); border-radius: 8px; overflow: hidden; }
				.rbc-time-header { border-bottom: 1px solid hsl(var(--border)); }
				.rbc-time-content { border-top: none; }
				.rbc-timeslot-group { border-bottom: 1px solid hsl(var(--border) / .5); }
				.rbc-current-time-indicator { background: hsl(var(--primary)); height: 2px; }
			`}</style>

			<section className="flex flex-col gap-6">
				{/* ── Header ── */}
				<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div className="min-w-0">
						<h1 className="text-2xl font-semibold tracking-tight">Master Calendar</h1>
						<p className="text-sm text-muted-foreground">Unified view of events, project tasks, and invoice due dates.</p>
					</div>
					<Can permission="view_calendar">
						<Button
							size="sm"
							className="gap-2 shrink-0"
							onClick={handleCreateEvent}
						>
							<Plus className="h-4 w-4" />
							New Event
						</Button>
					</Can>
				</div>

				{/* ── Toolbar: navigator + view switcher ── */}
				<div className="flex flex-wrap items-center justify-between gap-3">
					{/* Month navigator */}
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => setCurrentDate((d) => subMonths(d, 1))}
						>
							<ChevronLeft className="h-4 w-4" />
							<span className="sr-only">Previous</span>
						</Button>
						<span className="min-w-[160px] text-center text-sm font-semibold">{format(currentDate, "MMMM yyyy")}</span>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => setCurrentDate((d) => addMonths(d, 1))}
						>
							<ChevronRight className="h-4 w-4" />
							<span className="sr-only">Next</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="ml-1 text-xs"
							onClick={() => setCurrentDate(new Date())}
						>
							Today
						</Button>
					</div>

					{/* View switcher */}
					<div className="flex items-center gap-1 rounded-md border p-0.5">
						{([Views.MONTH, Views.WEEK, Views.AGENDA] as View[]).map((v) => (
							<button
								key={v}
								type="button"
								onClick={() => setView(v)}
								className={cn("rounded px-3 py-1 text-xs font-medium capitalize transition-colors", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
							>
								{v}
							</button>
						))}
					</div>
				</div>

				{/* ── Legend ── */}
				<div className="flex items-center gap-4 text-xs text-muted-foreground">
					{(Object.keys(TYPE_COLOR_HEX) as AggregatedItemType[]).map((type) => (
						<span
							key={type}
							className="flex items-center gap-1.5"
						>
							<span
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: TYPE_COLOR_HEX[type] }}
							/>
							{TYPE_LABEL[type]}
						</span>
					))}
				</div>

				{/* ── Loading / Error ── */}
				{isLoading && <div className="rounded-lg border bg-card py-12 text-center text-sm text-muted-foreground">Loading calendar…</div>}
				{error && <div className="rounded-lg border bg-card py-12 text-center text-sm text-destructive">Failed to load calendar data.</div>}

				{/* ── Calendar ── */}
				{!isLoading && !error && (
					<div className="rounded-lg bg-card">
						<Calendar<CalendarEvent>
							localizer={localizer}
							events={events}
							date={currentDate}
							view={view}
							onNavigate={setCurrentDate}
							onView={setView}
							onSelectEvent={handleSelectEvent}
							eventPropGetter={eventPropGetter}
							components={{
								event: EventPill,
							}}
							style={{ height: 640 }}
							popup
							showMultiDayTimes
						/>
					</div>
				)}

				{/* ── Empty state ── */}
				{!isLoading && !error && events.length === 0 && (
					<div className="flex flex-col items-center gap-3 py-8">
						<CalendarDays className="h-8 w-8 text-muted-foreground/40" />
						<p className="text-sm font-medium text-muted-foreground">Nothing scheduled for {format(currentDate, "MMMM yyyy")}</p>
						<Can permission="view_calendar">
							<Button
								size="sm"
								variant="outline"
								onClick={handleCreateEvent}
							>
								<Plus className="mr-1.5 h-3.5 w-3.5" />
								Create an Event
							</Button>
						</Can>
					</div>
				)}

				{/* ── Event count badges ── */}
				{!isLoading && !error && events.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{(Object.keys(TYPE_COLOR_HEX) as AggregatedItemType[]).map((type) => {
							const count = events.filter((e) => e.resource.type === type).length;
							if (count === 0) return null;
							return (
								<Badge
									key={type}
									variant="outline"
									className="gap-1.5 text-xs"
								>
									<span
										className="h-1.5 w-1.5 rounded-full"
										style={{ backgroundColor: TYPE_COLOR_HEX[type] }}
									/>
									{count} {TYPE_LABEL[type]}
									{count !== 1 ? "s" : ""}
								</Badge>
							);
						})}
					</div>
				)}
			</section>

			{/* ── Modals ── */}
			<EventFormModal
				open={formOpen}
				onClose={handleCloseForm}
				editTarget={editTargetAsEvent}
			/>
			<DeleteEventDialog
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				event={deleteTarget}
			/>
		</>
	);
}
