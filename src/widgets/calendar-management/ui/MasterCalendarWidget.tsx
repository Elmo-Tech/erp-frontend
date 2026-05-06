"use client";

import { useState, useMemo } from "react";
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, CheckSquare, FileText, Pencil, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Can } from "@/shared/ui/Can";
import { EventFormModal } from "@/features/calendar/ui/EventFormModal";
import { DeleteEventDialog } from "@/features/calendar/ui/DeleteEventDialog";
import { useCalendarFeed } from "@/features/calendar/model/use-calendar-actions";
import type { AggregatedCalendarItem, AggregatedItemType, EventMeta } from "@/entities/calendar/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<AggregatedItemType, React.ElementType> = {
	event: Clock,
	task: CheckSquare,
	invoice: FileText,
};

const TYPE_BADGE_VARIANT: Record<AggregatedItemType, "default" | "secondary" | "outline" | "destructive"> = {
	event: "default",
	task: "secondary",
	invoice: "outline",
};

const TYPE_LABEL: Record<AggregatedItemType, string> = {
	event: "Event",
	task: "Task",
	invoice: "Invoice",
};

function formatTime(iso: string | null) {
	if (!iso) return null;
	try {
		return format(new Date(iso), "h:mm a");
	} catch {
		return null;
	}
}

function formatDateHeading(dateStr: string) {
	try {
		return format(new Date(dateStr + "T00:00:00"), "EEEE, MMMM d");
	} catch {
		return dateStr;
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Item Card
// ─────────────────────────────────────────────────────────────────────────────

interface ItemCardProps {
	item: AggregatedCalendarItem;
	onEdit: (item: AggregatedCalendarItem) => void;
	onDelete: (item: AggregatedCalendarItem) => void;
}

function CalendarItemCard({ item, onEdit, onDelete }: ItemCardProps) {
	const Icon = TYPE_ICON[item.type];
	const startTime = formatTime(item.startTime);
	const endTime = formatTime(item.endTime);
	const isNativeEvent = item.type === "event";
	const meta = item.meta as EventMeta;

	return (
		<div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/40">
			<div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
				<Icon className="h-3.5 w-3.5 text-primary" />
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<p className="text-sm font-medium leading-snug">{item.title}</p>
					<Badge
						variant={TYPE_BADGE_VARIANT[item.type]}
						className="shrink-0 text-xs capitalize"
					>
						{TYPE_LABEL[item.type]}
					</Badge>
				</div>

				{startTime && (
					<p className="mt-0.5 text-xs text-muted-foreground">
						{startTime}
						{endTime ? ` – ${endTime}` : ""}
					</p>
				)}

				{item.status && <p className="mt-0.5 text-xs text-muted-foreground capitalize">Status: {item.status}</p>}

				{isNativeEvent && meta.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{meta.description}</p>}
			</div>

			{/* Only native events can be edited/deleted */}
			{isNativeEvent && (
				<Can permission="view_calendar">
					<div className="flex shrink-0 items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={() => onEdit(item)}
						>
							<Pencil className="h-3 w-3" />
							<span className="sr-only">Edit event</span>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 text-destructive hover:text-destructive"
							onClick={() => onDelete(item)}
						>
							<Trash2 className="h-3 w-3" />
							<span className="sr-only">Delete event</span>
						</Button>
					</div>
				</Can>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function MasterCalendarWidget() {
	// Current month navigation
	const [currentMonth, setCurrentMonth] = useState(() => new Date());

	const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
	const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

	const { data, isLoading, error } = useCalendarFeed({ startDate, endDate });

	// Modal state
	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<AggregatedCalendarItem | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AggregatedCalendarItem | null>(null);

	// Group items by date
	const groupedByDate = useMemo(() => {
		const items = data?.items ?? [];
		const map = new Map<string, AggregatedCalendarItem[]>();

		for (const item of items) {
			const existing = map.get(item.date) ?? [];
			map.set(item.date, [...existing, item]);
		}

		// Return sorted date entries
		return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
	}, [data]);

	const handleCreateEvent = () => {
		setEditTarget(null);
		setFormOpen(true);
	};

	const handleEditEvent = (item: AggregatedCalendarItem) => {
		setEditTarget(item);
		setFormOpen(true);
	};

	const handleCloseForm = () => {
		setFormOpen(false);
		setEditTarget(null);
	};

	// Convert aggregated item back to CalendarEvent shape for the edit modal
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

			{/* ── Month Navigator ── */}
			<div className="flex items-center gap-3">
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
				>
					<ChevronLeft className="h-4 w-4" />
					<span className="sr-only">Previous month</span>
				</Button>
				<span className="min-w-[160px] text-center text-sm font-semibold">{format(currentMonth, "MMMM yyyy")}</span>
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
				>
					<ChevronRight className="h-4 w-4" />
					<span className="sr-only">Next month</span>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="ml-2 text-xs"
					onClick={() => setCurrentMonth(new Date())}
				>
					Today
				</Button>
			</div>

			{/* ── Timeline ── */}
			{isLoading && (
				<Card>
					<CardContent className="py-12 text-center text-sm text-muted-foreground">Loading calendar…</CardContent>
				</Card>
			)}

			{error && (
				<Card>
					<CardContent className="py-12 text-center text-sm text-destructive">Failed to load calendar data.</CardContent>
				</Card>
			)}

			{!isLoading && !error && groupedByDate.length === 0 && (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-16">
						<CalendarDays className="h-10 w-10 text-muted-foreground/40" />
						<p className="text-sm font-medium text-muted-foreground">Nothing scheduled for {format(currentMonth, "MMMM yyyy")}</p>
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
					</CardContent>
				</Card>
			)}

			{!isLoading && !error && groupedByDate.length > 0 && (
				<div className="flex flex-col gap-6">
					{groupedByDate.map(([date, items]) => (
						<div
							key={date}
							className="flex flex-col gap-2"
						>
							{/* Date heading */}
							<div className="flex items-center gap-3">
								<h2 className="text-sm font-semibold text-foreground">{formatDateHeading(date)}</h2>
								<div className="h-px flex-1 bg-border" />
								<span className="text-xs text-muted-foreground">
									{items.length} {items.length === 1 ? "item" : "items"}
								</span>
							</div>

							{/* Items for this date */}
							<div className="flex flex-col gap-2 pl-0 md:pl-4">
								{items.map((item) => (
									<CalendarItemCard
										key={item.id}
										item={item}
										onEdit={handleEditEvent}
										onDelete={setDeleteTarget}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			)}

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
		</section>
	);
}
