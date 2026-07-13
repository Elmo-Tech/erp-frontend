"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import { format, startOfMonth, endOfMonth } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, CalendarCheck, CalendarDays, CheckSquare, Clock, CreditCard, ExternalLink, FileText, Flag, ListFilter, Loader2, Plus, Timer } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/Can";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { EventFormModal } from "@/features/calendar/ui/EventFormModal";
import { DeleteEventDialog } from "@/features/calendar/ui/DeleteEventDialog";
import { InvoiceFormModal } from "@/features/finance/ui/InvoiceFormModal";
import { TaskExecutionSheet } from "@/features/projects/ui/TaskExecutionSheet";
import { MeetingSheet } from "./MeetingSheet";
import { useCalendarFeed } from "@/features/calendar/model/use-calendar-actions";
import { useProjectTasks } from "@/features/projects/api/execution.api";
import type { Invoice, InvoiceStatus } from "@/entities/finance/model/types";
import type { AggregatedCalendarItem, AggregatedItemType, AttendanceMeta, EventMeta, InvoiceMeta, MeetingMeta, MilestoneMeta, SubscriptionMeta, TaskMeta } from "@/entities/calendar/model/types";
import { cn } from "@/shared/lib/utils";

const TYPE_THEME: Record<
	AggregatedItemType,
	{
		label: string;
		icon: LucideIcon;
		color: string;
		eventClass: string;
		softClass: string;
		textClass: string;
	}
> = {
	event: {
		label: "Events",
		icon: CalendarDays,
		color: "#64748b",
		eventClass: "calendar-event-event bg-slate-500 text-white border-none",
		softClass: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-950/40 dark:text-slate-200 dark:border-slate-900/60",
		textClass: "text-slate-700 dark:text-slate-300",
	},
	meeting: {
		label: "Meetings",
		icon: Clock,
		color: "#0070f3",
		eventClass: "calendar-event-meeting bg-blue-500 text-white border-none",
		softClass: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900/60",
		textClass: "text-blue-700 dark:text-blue-300",
	},
	task: {
		label: "Task Deadlines",
		icon: CheckSquare,
		color: "#8b5cf6",
		eventClass: "calendar-event-task bg-violet-500 text-white border-none",
		softClass: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-900/60",
		textClass: "text-violet-700 dark:text-violet-300",
	},
	invoice: {
		label: "Invoice Due Dates",
		icon: FileText,
		color: "#f59e0b",
		eventClass: "calendar-event-invoice bg-amber-500 text-white border-none",
		softClass: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900/60",
		textClass: "text-amber-700 dark:text-amber-300",
	},
	milestone: {
		label: "Project Milestones",
		icon: Flag,
		color: "#10b981",
		eventClass: "calendar-event-milestone bg-emerald-500 text-white border-none",
		softClass: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900/60",
		textClass: "text-emerald-700 dark:text-emerald-300",
	},
	subscription: {
		label: "Subscriptions",
		icon: CreditCard,
		color: "#0f766e",
		eventClass: "calendar-event-subscription bg-teal-700 text-white border-none",
		softClass: "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-900/60",
		textClass: "text-teal-700 dark:text-teal-300",
	},
	attendance: {
		label: "Attendance",
		icon: CalendarCheck,
		color: "#16a34a",
		eventClass: "calendar-event-attendance bg-green-600 text-white border-none",
		softClass: "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/40 dark:text-green-200 dark:border-green-900/60",
		textClass: "text-green-700 dark:text-green-300",
	},
};

interface FullCalendarEvent {
	id: string;
	title: string;
	start: string;
	end?: string;
	allDay: boolean;
	backgroundColor: string;
	borderColor: string;
	extendedProps: {
		type: AggregatedItemType;
		item: AggregatedCalendarItem;
	};
}

function entityNumericId(item: AggregatedCalendarItem): number {
	return Number(item.id.split("-").at(-1));
}

function toFullCalendarEvent(item: AggregatedCalendarItem): FullCalendarEvent {
	const start = item.startTime ?? item.date;
	const end = item.endTime ?? undefined;
	const theme = TYPE_THEME[item.type];

	return {
		id: item.id,
		title: item.title,
		start,
		end,
		allDay: !item.startTime,
		backgroundColor: theme.color,
		borderColor: theme.color,
		extendedProps: {
			type: item.type,
			item,
		},
	};
}

function money(value: number | null | undefined, currency = "USD") {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(value ?? 0);
}

function formatDateLabel(date: string) {
	return format(new Date(`${date}T00:00:00`), "EEE, MMM d, yyyy");
}

function formatTime(iso: string | null | undefined) {
	if (!iso) return "—";
	return format(new Date(iso), "hh:mm a");
}

function formatMinutes(value: number | null | undefined) {
	if (value == null) return "—";
	const hours = Math.floor(value / 60);
	const minutes = value % 60;
	if (hours === 0) return `${minutes}m`;
	return `${hours}h ${minutes}m`;
}

function titleCase(value: string | null | undefined) {
	if (!value) return "—";
	return value
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function buildInvoiceEditTarget(item: AggregatedCalendarItem): Invoice {
	const meta = item.meta as InvoiceMeta;
	const status = (item.status ?? "draft") as InvoiceStatus;

	return {
		id: entityNumericId(item),
		invoiceNumber: meta.invoiceNumber,
		clientId: meta.clientId,
		projectId: meta.projectId ?? null,
		invoiceType: "one_time",
		billingCycle: null,
		subscriptionId: null,
		issueDate: item.date,
		dueDate: item.date,
		subtotal: meta.totalAmount,
		taxRate: 0,
		taxAmount: 0,
		discountAmount: 0,
		totalAmount: meta.totalAmount,
		status,
		notes: null,
		client: {
			id: meta.clientId,
			name: meta.clientName ?? `Client #${meta.clientId}`,
			displayName: meta.clientName ?? `Client #${meta.clientId}`,
		},
		project: meta.projectId
			? {
					id: meta.projectId,
					title: meta.projectTitle ?? `Project #${meta.projectId}`,
				}
			: null,
		items: [],
		createdAt: "",
		updatedAt: "",
	};
}

function buildEventEditTarget(item: AggregatedCalendarItem) {
	const meta = item.meta as EventMeta;

	return {
		id: entityNumericId(item),
		userId: meta.creatorId,
		title: item.title,
		description: meta.description,
		startTime: item.startTime ?? "",
		endTime: item.endTime ?? "",
		eventType: meta.eventType,
		createdAt: "",
		updatedAt: "",
	};
}

function AgendaRows({ items, onOpen }: { items: AggregatedCalendarItem[]; onOpen: (item: AggregatedCalendarItem) => void }) {
	const grouped = useMemo(() => {
		const chronologicalItems = [...items].sort((left, right) => (left.startTime ?? left.date).localeCompare(right.startTime ?? right.date));
		return chronologicalItems.reduce<Record<string, AggregatedCalendarItem[]>>((acc, item) => {
			acc[item.date] ??= [];
			acc[item.date].push(item);
			return acc;
		}, {});
	}, [items]);

	return (
		<div className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
			{Object.entries(grouped).map(([date, dayItems]) => (
				<div
					key={date}
					className="grid border-b last:border-b-0 md:grid-cols-[150px_1fr]"
				>
					<div className="border-b bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 md:border-b-0 md:border-r">
						{formatDateLabel(date)}
					</div>
					<div className="divide-y">
						{dayItems.map((item) => {
							const theme = TYPE_THEME[item.type];
							const Icon = theme.icon;
							return (
								<button
									key={item.id}
									type="button"
									className="grid w-full grid-cols-[28px_1fr_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900/70"
									onClick={() => onOpen(item)}
								>
									<span
										className="size-2.5 rounded-full"
										style={{ backgroundColor: theme.color }}
									/>
									<span className="min-w-0">
										<span className="flex min-w-0 items-center gap-2">
											<Icon className={cn("size-4 shrink-0", theme.textClass)} />
											<span className="truncate text-sm font-medium">{item.title}</span>
										</span>
										<span className="mt-0.5 block truncate text-xs text-muted-foreground">{agendaSubtitle(item)}</span>
									</span>
									<Badge
										variant="outline"
										className={cn("hidden border text-xs md:inline-flex", theme.softClass)}
									>
										{theme.label}
									</Badge>
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}

function CalendarInsights({ items }: { items: AggregatedCalendarItem[] }) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const nextWeek = new Date(today);
	nextWeek.setDate(today.getDate() + 7);
	const datedItems = items.map((item) => ({ item, date: new Date(`${item.date}T00:00:00`) }));
	const upcoming = datedItems.filter(({ date }) => date >= today && date <= nextWeek).length;
	const overdue = datedItems.filter(({ item, date }) => date < today && isCommitment(item) && !isCompletedStatus(item.status)).length;
	const countsByDay = items.reduce<Record<string, number>>((counts, item) => {
		counts[item.date] = (counts[item.date] ?? 0) + 1;
		return counts;
	}, {});
	const busyDays = Object.values(countsByDay).filter((count) => count >= 4).length;
	const insights = [
		{ label: "Visible items", value: items.length, detail: "in current filters" },
		{ label: "Next 7 days", value: upcoming, detail: "upcoming commitments" },
		{ label: "Busy days", value: busyDays, detail: "4+ items scheduled" },
		{ label: "Overdue", value: overdue, detail: "open dated commitments" },
	] as const;

	return (
		<div className="grid overflow-hidden rounded-lg border bg-card sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
			{insights.map((insight) => <div key={insight.label} className="border-b px-4 py-3 last:border-b-0 lg:border-b-0"><p className="text-xs text-muted-foreground">{insight.label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{insight.value}</p><p className="text-[11px] text-muted-foreground">{insight.detail}</p></div>)}
		</div>
	);
}

function isCommitment(item: AggregatedCalendarItem) {
	return item.type === "task" || item.type === "invoice" || item.type === "milestone" || item.type === "subscription";
}

function isCompletedStatus(status: string | null | undefined) {
	if (!status) return false;
	const normalized = status.toLowerCase();
	return normalized.includes("complete") || normalized.includes("done") || normalized.includes("paid");
}

function agendaSubtitle(item: AggregatedCalendarItem) {
	if (item.type === "task") {
		const meta = item.meta as TaskMeta;
		return [meta.projectTitle, meta.assigneeName].filter(Boolean).join(" / ") || "Task deadline";
	}
	if (item.type === "invoice") {
		const meta = item.meta as InvoiceMeta;
		return `${meta.clientName ?? "Client"} / ${money(meta.totalAmount, meta.currency)}`;
	}
	if (item.type === "subscription") {
		const meta = item.meta as SubscriptionMeta;
		return `${meta.clientName ?? "Client"} / ${money(meta.totalAmount, meta.currency)} / ${meta.billingCycle}`;
	}
	if (item.type === "milestone") {
		const meta = item.meta as MilestoneMeta;
		return `${meta.projectTitle ?? "Project"} / ${meta.progressPercentage}% complete`;
	}
	if (item.type === "attendance") {
		const meta = item.meta as AttendanceMeta;
		return `${formatTime(meta.clockIn)} - ${formatTime(meta.clockOut)} / ${formatMinutes(meta.actualWorkedMinutes ?? meta.totalWorkedMinutes)} / ${meta.workedTasks.length} tasks`;
	}
	if (item.type === "meeting") {
		const meta = item.meta as MeetingMeta;
		return [meta.subjectName, titleCase(meta.meetingType), formatTime(item.startTime)].filter((part) => part && part !== "—").join(" / ") || "Meeting";
	}
	const meta = item.meta as EventMeta;
	return meta.creatorName ? `Created by ${meta.creatorName}` : "Calendar meeting";
}

function MilestoneSheet({ item, onOpenChange }: { item: AggregatedCalendarItem | null; onOpenChange: (open: boolean) => void }) {
	const router = useRouter();

	if (!item) return null;

	const meta = item.meta as MilestoneMeta;

	return (
		<Sheet
			open={Boolean(item)}
			onOpenChange={onOpenChange}
		>
			<SheetContent className="sm:max-w-md">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<Flag className="size-4 text-emerald-600" />
						{item.title}
					</SheetTitle>
					<SheetDescription>{meta.projectTitle ?? "Project milestone"}</SheetDescription>
				</SheetHeader>
				<div className="mt-6 space-y-4 text-sm">
					<div className="rounded-md border p-4">
						<div className="text-xs font-medium uppercase text-muted-foreground">Due date</div>
						<div className="mt-1 font-medium">{format(new Date(`${item.date}T00:00:00`), "MMM d, yyyy")}</div>
					</div>
					<div className="rounded-md border p-4">
						<div className="text-xs font-medium uppercase text-muted-foreground">Progress</div>
						<div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
							<div
								className="h-2 rounded-full bg-emerald-500"
								style={{ width: `${Math.min(Math.max(meta.progressPercentage ?? 0, 0), 100)}%` }}
							/>
						</div>
						<div className="mt-2 font-medium">{meta.progressPercentage ?? 0}% complete</div>
					</div>
					<Button
						type="button"
						className="w-full gap-2"
						onClick={() => router.push(`/dashboard/projects/${meta.projectId}`)}
					>
						<ExternalLink className="size-4" />
						Open Project
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}

function AttendanceSheet({ item, onOpenChange }: { item: AggregatedCalendarItem | null; onOpenChange: (open: boolean) => void }) {
	const router = useRouter();

	if (!item) return null;

	const meta = item.meta as AttendanceMeta;
	const workedMinutes = meta.actualWorkedMinutes ?? meta.totalWorkedMinutes;

	return (
		<Sheet
			open={Boolean(item)}
			onOpenChange={onOpenChange}
		>
			<SheetContent className="overflow-y-auto sm:max-w-xl">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<CalendarCheck className="size-4 text-green-600" />
						Attendance Details
					</SheetTitle>
					<SheetDescription>
						{[meta.userName, formatDateLabel(item.date)].filter(Boolean).join(" / ")}
					</SheetDescription>
				</SheetHeader>

				<div className="mt-6 space-y-5 text-sm px-5">
					<div className="rounded-md border p-4">
						<div className="text-xs font-medium uppercase text-muted-foreground">Employee</div>
						<div className="mt-1 font-semibold">{meta.userName ?? `User #${meta.userId}`}</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-md border p-4">
							<div className="text-xs font-medium uppercase text-muted-foreground">Clock In</div>
							<div className="mt-1 font-semibold tabular-nums">{formatTime(meta.clockIn)}</div>
						</div>
						<div className="rounded-md border p-4">
							<div className="text-xs font-medium uppercase text-muted-foreground">Clock Out</div>
							<div className="mt-1 font-semibold tabular-nums">{meta.isClockedIn ? "Still clocked in" : formatTime(meta.clockOut)}</div>
						</div>
						<div className="rounded-md border p-4">
							<div className="text-xs font-medium uppercase text-muted-foreground">Worked</div>
							<div className="mt-1 font-semibold tabular-nums">{formatMinutes(workedMinutes)}</div>
						</div>
						<div className="rounded-md border p-4">
							<div className="text-xs font-medium uppercase text-muted-foreground">Status</div>
							<div className="mt-2 flex flex-wrap gap-2">
								<Badge
									variant="outline"
									className={cn("capitalize", TYPE_THEME.attendance.softClass)}
								>
									{titleCase(item.status)}
								</Badge>
								{meta.lateMinutes ? <Badge variant="secondary">{meta.lateMinutes}m late</Badge> : null}
								{meta.usedGraceDay ? <Badge variant="outline">Grace used</Badge> : null}
							</div>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-md border p-3">
							<div className="text-xs text-muted-foreground">Expected</div>
							<div className="mt-1 font-medium tabular-nums">{formatMinutes(meta.expectedWorkedMinutes)}</div>
						</div>
						<div className="rounded-md border p-3">
							<div className="text-xs text-muted-foreground">Stopped</div>
							<div className="mt-1 font-medium tabular-nums">{formatMinutes(meta.stoppedMinutes)}</div>
						</div>
						<div className="rounded-md border p-3">
							<div className="text-xs text-muted-foreground">Idle / Deducted</div>
							<div className="mt-1 font-medium tabular-nums">
								{formatMinutes(meta.idleMinutes)} / {formatMinutes(meta.deductionMinutes)}
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between gap-3">
							<h3 className="text-sm font-semibold">Tasks Worked On</h3>
							<Badge variant="outline">{meta.workedTasks.length}</Badge>
						</div>
						{meta.workedTasks.length > 0 ? (
							<div className="space-y-2">
								{meta.workedTasks.map((task) => (
									<button
										key={`${task.projectId}-${task.taskId}`}
										type="button"
										className="grid w-full gap-2 rounded-md border p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900/70"
										onClick={() => {
											if (task.source === "project" && task.projectId) router.push(`/dashboard/projects/${task.projectId}`);
										}}
									>
										<span className="flex min-w-0 items-start justify-between gap-3">
											<span className="min-w-0">
												<span className="block truncate font-medium">{task.title}</span>
												<span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
													<BriefcaseBusiness className="size-3 shrink-0" />
													<span className="truncate">{task.projectTitle ?? "Project"}</span>
												</span>
											</span>
											<span className="flex shrink-0 flex-col items-end gap-1">
												<Badge variant="outline">{task.source === "personal" ? "Personal" : "Project"}</Badge>
												<Badge variant="outline">{formatMinutes(task.durationMinutes)}</Badge>
											</span>
										</span>
										<span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
											<span className="inline-flex items-center gap-1">
												<Timer className="size-3" />
												{task.entriesCount} {task.entriesCount === 1 ? "entry" : "entries"}
											</span>
											{task.status ? <span>{titleCase(task.status)}</span> : null}
											{task.lastStartTime ? <span>Last start {formatTime(task.lastStartTime)}</span> : null}
										</span>
									</button>
								))}
							</div>
						) : (
							<div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No task time entries were logged for this day.</div>
						)}
					</div>

					{meta.notes ? (
						<div className="rounded-md border p-4">
							<div className="text-xs font-medium uppercase text-muted-foreground">Notes</div>
							<p className="mt-2 leading-6">{meta.notes}</p>
						</div>
					) : null}
				</div>
			</SheetContent>
		</Sheet>
	);
}

export function MasterCalendarWidget() {
	const router = useRouter();
	const calendarRef = useRef<FullCalendar>(null);
	const [currentDate, setCurrentDate] = useState(() => new Date());
	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<AggregatedCalendarItem | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AggregatedCalendarItem | null>(null);
	const [invoiceTarget, setInvoiceTarget] = useState<AggregatedCalendarItem | null>(null);
	const [taskTarget, setTaskTarget] = useState<AggregatedCalendarItem | null>(null);
	const [meetingTarget, setMeetingTarget] = useState<AggregatedCalendarItem | null>(null);
	const [milestoneTarget, setMilestoneTarget] = useState<AggregatedCalendarItem | null>(null);
	const [attendanceTarget, setAttendanceTarget] = useState<AggregatedCalendarItem | null>(null);
	const [activeTypes, setActiveTypes] = useState<Set<AggregatedItemType>>(() => new Set(Object.keys(TYPE_THEME) as AggregatedItemType[]));
	const [agendaOpen, setAgendaOpen] = useState(false);

	const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
	const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");
	const { data, isLoading, error } = useCalendarFeed({ startDate, endDate });
	const items = useMemo(() => data?.items ?? [], [data?.items]);
	const visibleItems = useMemo(() => items.filter((item) => activeTypes.has(item.type)), [activeTypes, items]);
	const events = useMemo<FullCalendarEvent[]>(() => visibleItems.map(toFullCalendarEvent), [visibleItems]);
	const typeCounts = useMemo(() => items.reduce<Partial<Record<AggregatedItemType, number>>>((counts, item) => {
		counts[item.type] = (counts[item.type] ?? 0) + 1;
		return counts;
	}, {}), [items]);

	const taskMeta = taskTarget?.meta as TaskMeta | undefined;
	const taskProjectId = taskMeta?.projectId ?? 0;
	const taskId = taskTarget ? entityNumericId(taskTarget) : 0;
	const taskQuery = useProjectTasks(taskProjectId);
	const selectedTask = taskQuery.data?.find((task) => task.taskId === taskId) ?? null;

	const openItem = useCallback((item: AggregatedCalendarItem) => {
		if (item.type === "event") {
			setEditTarget(item);
			setFormOpen(true);
			return;
		}
		if (item.type === "invoice") {
			setInvoiceTarget(item);
			return;
		}
		if (item.type === "task") {
			setTaskTarget(item);
			return;
		}
		if (item.type === "meeting") {
			setMeetingTarget(item);
			return;
		}
		if (item.type === "attendance") {
			setAttendanceTarget(item);
			return;
		}
		if (item.type === "subscription") {
			router.push("/dashboard/finance/subscriptions");
			return;
		}
		setMilestoneTarget(item);
	}, [router]);

	const renderEventContent = useCallback((eventInfo: EventContentArg) => {
		const type = eventInfo.event.extendedProps.type as AggregatedItemType;
		const theme = TYPE_THEME[type];
		const Icon = theme.icon;
		return (
			<div
				className="flex min-w-0 items-center gap-1.5 px-1 py-0.5"
				title={eventInfo.event.title}
			>
				<Icon className="size-3 shrink-0 text-white" />
				<span className="truncate text-[11px] font-semibold leading-4 text-white">{eventInfo.event.title}</span>
			</div>
		);
	}, []);

	const eventClassNames = useCallback((eventInfo: EventContentArg) => {
		const type = eventInfo.event.extendedProps.type as AggregatedItemType;
		return TYPE_THEME[type].eventClass.split(" ");
	}, []);

	const eventTargetAsEvent = editTarget ? buildEventEditTarget(editTarget) : null;
	const invoiceEditTarget = invoiceTarget ? buildInvoiceEditTarget(invoiceTarget) : null;
	const toggleType = (type: AggregatedItemType) => {
		setActiveTypes((current) => {
			const next = new Set(current);
			if (next.has(type)) next.delete(type);
			else next.add(type);
			return next;
		});
	};

	return (
		<>
			<style>{`
				.fc {
					--fc-border-color: #e5e7eb;
					--fc-today-bg-color: rgba(0, 112, 243, 0.07);
					--fc-neutral-bg-color: #f8fafc;
					font-family: inherit;
				}
				.dark .fc {
					--fc-border-color: #1f2937;
					--fc-neutral-bg-color: #0f172a;
				}
				.fc .fc-scrollgrid {
					border: 0 !important;
				}
				.fc-theme-standard td,
				.fc-theme-standard th {
					border-color: var(--fc-border-color) !important;
				}
				.fc-col-header-cell {
					background: #f9fafb;
					border: 0 !important;
				}
				.dark .fc-col-header-cell {
					background: #0f172a;
				}
				.fc-col-header-cell-cushion {
					padding: 11px 8px !important;
					font-size: 11px !important;
					font-weight: 700 !important;
					text-transform: uppercase;
					color: #64748b !important;
				}
				.fc-daygrid-day-number {
					padding: 8px !important;
					font-size: 12px !important;
					font-weight: 600 !important;
					color: #334155 !important;
				}
				.dark .fc-daygrid-day-number {
					color: #cbd5e1 !important;
				}
				.fc-day-today .fc-daygrid-day-number {
					margin: 4px;
					display: inline-flex;
					width: 28px;
					height: 28px;
					min-width: 28px;
					align-items: center;
					justify-content: center;
					border-radius: 999px;
					background: #0070f3;
					color: #fff !important;
				}
				.fc-event {
					border: 0 !important;
					border-radius: 6px !important;
					box-shadow: none !important;
					transition: transform .16s ease, box-shadow .16s ease, opacity .16s ease;
				}
				.fc .fc-event.calendar-event-event {
					background-color: #64748b !important;
					border-color: transparent !important;
					color: #fff !important;
				}
				.fc .fc-event.calendar-event-meeting {
					background-color: #3b82f6 !important;
					border-color: transparent !important;
					color: #fff !important;
				}
				.fc .fc-event.calendar-event-task {
					background-color: #8b5cf6 !important;
					border-color: transparent !important;
					color: #fff !important;
				}
				.fc .fc-event.calendar-event-invoice {
					background-color: #f59e0b !important;
					border-color: transparent !important;
					color: #fff !important;
				}
				.fc .fc-event.calendar-event-milestone {
					background-color: #10b981 !important;
					border-color: transparent !important;
					color: #fff !important;
				}
				.fc .fc-event.calendar-event-subscription {
					background-color: #0f766e !important;
					border-color: transparent !important;
					color: #fff !important;
				}
				.fc .fc-event.calendar-event-attendance {
					background-color: #16a34a !important;
					border-color: transparent !important;
					color: #fff !important;
				}
				.fc .fc-event[class*="calendar-event-"] .fc-event-main {
					color: #fff !important;
				}
				.fc-event:hover {
					opacity: .95;
					transform: translateY(-1px);
					box-shadow: 0 8px 18px rgba(15, 23, 42, .13) !important;
				}
				.fc .fc-button-primary {
					border: 1px solid #dbe3ef !important;
					background: #fff !important;
					color: #334155 !important;
					border-radius: 7px !important;
					padding: 7px 10px !important;
					font-size: 12px !important;
					font-weight: 650 !important;
					text-transform: capitalize !important;
					box-shadow: 0 1px 1px rgba(15, 23, 42, .04);
				}
				.dark .fc .fc-button-primary {
					border-color: #243044 !important;
					background: #111827 !important;
					color: #d1d5db !important;
				}
				.fc .fc-button-primary:hover,
				.fc .fc-button-primary.fc-button-active {
					border-color: #0070f3 !important;
					background: #0070f3 !important;
					color: #fff !important;
				}
				.fc-toolbar-title {
					font-size: 18px !important;
					font-weight: 700 !important;
					color: #0f172a !important;
				}
				.dark .fc-toolbar-title {
					color: #f8fafc !important;
				}
				.fc-list {
					border: 0 !important;
				}
				.fc-list-day-cushion {
					background: #f8fafc !important;
					color: #334155 !important;
					font-size: 12px;
					text-transform: uppercase;
				}
				.dark .fc-list-day-cushion {
					background: #0f172a !important;
					color: #cbd5e1 !important;
				}
				.fc-list-event td {
					padding: 12px 10px !important;
					border-color: #eef2f7 !important;
				}
				.dark .fc-list-event td {
					border-color: #1f2937 !important;
				}
				.fc-popover {
					border-radius: 8px !important;
					border-color: var(--fc-border-color) !important;
					overflow: hidden;
					box-shadow: 0 18px 45px rgba(15, 23, 42, .18) !important;
				}
				.fc-daygrid-day-frame {
					min-height: 108px;
				}
				@media (max-width: 640px) {
					.fc .fc-toolbar {
						align-items: stretch;
						gap: 8px;
					}
					.fc .fc-toolbar.fc-header-toolbar {
						flex-direction: column;
					}
					.fc .fc-toolbar-chunk {
						display: flex;
						justify-content: center;
					}
					.fc-toolbar-title {
						font-size: 16px !important;
					}
					.fc-daygrid-day-frame {
						min-height: 82px;
					}
				}
			`}</style>

			<section className="flex flex-col gap-5">
				<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div className="min-w-0">
						<h1 className="text-2xl font-semibold tracking-tight">Master Calendar</h1>
						<p className="text-sm text-muted-foreground">Meetings, deadlines, invoice due dates, and project milestones in one operating view.</p>
					</div>
					<Can permission="view_calendar">
						<Button
							size="sm"
							className="shrink-0 gap-2"
							onClick={() => {
								setEditTarget(null);
								setFormOpen(true);
							}}
						>
							<Plus className="size-4" />
							New Event
						</Button>
					</Can>
				</div>

				<CalendarInsights items={visibleItems} />

				<div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter calendar item types">
					{(Object.keys(TYPE_THEME) as AggregatedItemType[]).map((type) => {
						const theme = TYPE_THEME[type];
						const Icon = theme.icon;
						const active = activeTypes.has(type);
						return (
							<button
								key={type}
								type="button"
								aria-pressed={active}
								onClick={() => toggleType(type)}
								className={cn("inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? theme.softClass : "border-border bg-background text-muted-foreground opacity-65 hover:opacity-100")}
							>
								<Icon className="size-3" />
								{theme.label}
								<span className="tabular-nums opacity-70">{typeCounts[type] ?? 0}</span>
							</button>
						);
					})}
					</div>
					<div className="flex shrink-0 items-center gap-2">
						<Button type="button" variant="ghost" size="sm" onClick={() => setActiveTypes(new Set(Object.keys(TYPE_THEME) as AggregatedItemType[]))}>Show all</Button>
						<Button type="button" variant="outline" size="sm" onClick={() => setAgendaOpen((open) => !open)} aria-expanded={agendaOpen}><ListFilter className="size-3.5" />{agendaOpen ? "Hide agenda" : "Show agenda"}</Button>
					</div>
				</div>

				{isLoading ? (
					<div className="rounded-md border bg-white py-16 text-center text-sm text-muted-foreground dark:bg-slate-950">Loading calendar...</div>
				) : error ? (
					<div className="rounded-md border bg-white py-16 text-center text-sm text-destructive dark:bg-slate-950">Failed to load calendar data.</div>
				) : (
					<div className="overflow-hidden rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
						<FullCalendar
							ref={calendarRef}
							plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
							initialView="dayGridMonth"
							headerToolbar={{
								left: "prev,next today",
								center: "title",
								right: "dayGridMonth,timeGridWeek,listWeek",
							}}
							buttonText={{
								today: "Today",
								month: "Month",
								week: "Week",
								list: "Agenda",
							}}
							events={events}
							eventClick={(info: EventClickArg) => openItem(info.event.extendedProps.item as AggregatedCalendarItem)}
							eventClassNames={eventClassNames}
							eventContent={renderEventContent}
							height="auto"
							contentHeight={650}
							expandRows
							stickyHeaderDates
							dayMaxEvents={3}
							moreLinkClick="popover"
							nowIndicator
							editable={false}
							selectable={false}
							weekends
							datesSet={(dateInfo) => setCurrentDate(dateInfo.view.currentStart)}
						/>
					</div>
				)}

				{!isLoading && !error && agendaOpen && visibleItems.length > 0 ? <AgendaRows items={visibleItems} onOpen={openItem} /> : null}

				{!isLoading && !error && events.length === 0 ? (
					<div className="flex flex-col items-center gap-3 py-8">
						<CalendarDays className="size-8 text-muted-foreground/40" />
						<p className="text-sm font-medium text-muted-foreground">Nothing scheduled for {format(currentDate, "MMMM yyyy")}</p>
					</div>
				) : null}
			</section>

			<EventFormModal
				open={formOpen}
				onClose={() => {
					setFormOpen(false);
					setEditTarget(null);
				}}
				editTarget={eventTargetAsEvent}
			/>
			<InvoiceFormModal
				open={Boolean(invoiceTarget)}
				onClose={() => setInvoiceTarget(null)}
				editTarget={invoiceEditTarget}
			/>
			{taskTarget && selectedTask ? (
				<TaskExecutionSheet
					task={selectedTask}
					projectId={taskProjectId}
					open={Boolean(taskTarget)}
					onOpenChange={(open) => {
						if (!open) setTaskTarget(null);
					}}
				/>
			) : taskTarget ? (
				<Sheet
					open={Boolean(taskTarget)}
					onOpenChange={(open) => {
						if (!open) setTaskTarget(null);
					}}
				>
					<SheetContent className="sm:max-w-md">
						<SheetHeader>
							<SheetTitle className="flex items-center gap-2">
								<CheckSquare className="size-4 text-violet-600" />
								{taskTarget.title}
							</SheetTitle>
							<SheetDescription>{agendaSubtitle(taskTarget)}</SheetDescription>
						</SheetHeader>
						<div className="mt-6 space-y-4 text-sm">
							{taskQuery.isLoading ? (
								<div className="flex items-center gap-2 rounded-md border p-4 text-muted-foreground">
									<Loader2 className="size-4 animate-spin" />
									Loading task details...
								</div>
							) : (
								<div className="rounded-md border p-4 text-muted-foreground">Task details are not available from the calendar feed right now.</div>
							)}
							{taskProjectId > 0 ? (
								<Button
									type="button"
									className="w-full gap-2"
									onClick={() => router.push(`/dashboard/projects/${taskProjectId}`)}
								>
									<ExternalLink className="size-4" />
									Open Project
								</Button>
							) : null}
						</div>
					</SheetContent>
				</Sheet>
			) : null}
			<AttendanceSheet
				item={attendanceTarget}
				onOpenChange={(open) => {
					if (!open) setAttendanceTarget(null);
				}}
			/>
			<MeetingSheet
				item={meetingTarget}
				onOpenChange={(open) => {
					if (!open) setMeetingTarget(null);
				}}
			/>
			<MilestoneSheet
				item={milestoneTarget}
				onOpenChange={(open) => {
					if (!open) setMilestoneTarget(null);
				}}
			/>
			<DeleteEventDialog
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				event={deleteTarget}
			/>
		</>
	);
}
