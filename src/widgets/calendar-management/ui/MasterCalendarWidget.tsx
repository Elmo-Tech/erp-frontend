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
import { CalendarDays, CheckSquare, Clock, CreditCard, ExternalLink, FileText, Flag, Plus } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/Can";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { EventFormModal } from "@/features/calendar/ui/EventFormModal";
import { DeleteEventDialog } from "@/features/calendar/ui/DeleteEventDialog";
import { InvoiceFormModal } from "@/features/finance/ui/InvoiceFormModal";
import { TaskExecutionSheet } from "@/features/projects/ui/TaskExecutionSheet";
import { useCalendarFeed } from "@/features/calendar/model/use-calendar-actions";
import { useProjectTasks } from "@/features/projects/api/execution.api";
import type { Invoice, InvoiceStatus } from "@/entities/finance/model/types";
import type { AggregatedCalendarItem, AggregatedItemType, EventMeta, InvoiceMeta, MilestoneMeta, SubscriptionMeta, TaskMeta } from "@/entities/calendar/model/types";
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
		return items.reduce<Record<string, AggregatedCalendarItem[]>>((acc, item) => {
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
						{format(new Date(`${date}T00:00:00`), "EEE, MMM d")}
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

export function MasterCalendarWidget() {
	const router = useRouter();
	const calendarRef = useRef<FullCalendar>(null);
	const [currentDate, setCurrentDate] = useState(() => new Date());
	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<AggregatedCalendarItem | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AggregatedCalendarItem | null>(null);
	const [invoiceTarget, setInvoiceTarget] = useState<AggregatedCalendarItem | null>(null);
	const [taskTarget, setTaskTarget] = useState<AggregatedCalendarItem | null>(null);
	const [milestoneTarget, setMilestoneTarget] = useState<AggregatedCalendarItem | null>(null);

	const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
	const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");
	const { data, isLoading, error } = useCalendarFeed({ startDate, endDate });
	const items = useMemo(() => data?.items ?? [], [data?.items]);
	const events = useMemo<FullCalendarEvent[]>(() => items.map(toFullCalendarEvent), [items]);

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
		if (item.type === "subscription") {
			router.push("/dashboard/finance/subscriptions");
			return;
		}
		setMilestoneTarget(item);
	}, [router]);

	const renderEventContent = useCallback((eventInfo: EventContentArg) => {
		const type = eventInfo.event.extendedProps.type as AggregatedItemType;
		const Icon = TYPE_THEME[type].icon;
		return (
			<div className="flex min-w-0 items-center gap-1.5 px-1 py-0.5">
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

				<div className="flex flex-wrap items-center gap-2">
					{(Object.keys(TYPE_THEME) as AggregatedItemType[]).map((type) => {
						const theme = TYPE_THEME[type];
						const Icon = theme.icon;
						return (
							<Badge
								key={type}
								variant="outline"
								className={cn("gap-1.5 border px-2.5 py-1 text-xs", theme.softClass)}
							>
								<Icon className="size-3" />
								{theme.label}
							</Badge>
						);
					})}
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

				{!isLoading && !error && items.length > 0 ? <AgendaRows items={items} onOpen={openItem} /> : null}

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
			) : null}
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
