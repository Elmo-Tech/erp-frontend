/**
 * entities/calendar/model/types.ts
 *
 * All TypeScript interfaces for the Calendar domain.
 * Derived directly from CalendarEventResource and MasterCalendarAggregatorService.
 *
 * NO React Query, NO Zod, NO hooks — pure types only.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared envelope
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiEnvelope<T> {
	data: T;
	message?: string;
	success?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar Event  (CalendarEventResource)
// ─────────────────────────────────────────────────────────────────────────────

export type CalendarEventType = "meeting" | "reminder" | "custom";

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
	meeting: "Meeting",
	reminder: "Reminder",
	custom: "Custom",
};

export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
	meeting: "blue",
	reminder: "amber",
	custom: "violet",
};

export interface CalendarEvent {
	id: number;
	userId: number;
	title: string;
	description: string | null;
	startTime: string; // ISO-8601
	endTime: string; // ISO-8601
	eventType: CalendarEventType;
	creator?: {
		id: number;
		name: string;
		avatar: string | null;
	};
	createdAt: string;
	updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregated Calendar Item  (MasterCalendarAggregatorService output)
//
// Each item has a consistent shape regardless of its source module.
// ─────────────────────────────────────────────────────────────────────────────

export type AggregatedItemType = "event" | "meeting" | "task" | "invoice" | "milestone" | "subscription" | "attendance";

/** Meta fields for type === "event" */
export interface EventMeta {
	description: string | null;
	eventType: CalendarEventType;
	creatorId: number;
	creatorName: string | null;
}

/** Meta fields for type === "task" */
export interface TaskMeta {
	projectId: number;
	projectTitle: string | null;
	assigneeId: number | null;
	assigneeName: string | null;
	milestoneId: number | null;
}

/** Meta fields for type === "invoice" */
export interface InvoiceMeta {
	invoiceNumber: string;
	clientId: number;
	clientName: string | null;
	projectId: number | null;
	projectTitle: string | null;
	totalAmount: number;
	currency: string;
}

export interface SubscriptionMeta {
	subscriptionId: number;
	billingCycle: string;
	clientId: number | null;
	clientName: string | null;
	projectId: number | null;
	projectTitle: string | null;
	totalAmount: number;
	currency: string;
}

export interface AttendanceWorkedTask {
	source: "project" | "personal";
	taskId: number;
	projectId: number | null;
	title: string;
	status: string | null;
	projectTitle: string | null;
	durationMinutes: number;
	entriesCount: number;
	lastStartTime: string | null;
}

export interface AttendanceMeta {
	attendanceId: number;
	userId: number;
	userName: string | null;
	clockIn: string | null;
	clockOut: string | null;
	isClockedIn: boolean;
	totalWorkedMinutes: number | null;
	actualWorkedMinutes: number | null;
	expectedWorkedMinutes: number | null;
	stoppedMinutes: number | null;
	lateMinutes: number | null;
	deductionMinutes: number | null;
	idleMinutes: number | null;
	usedGraceDay: boolean;
	notes: string | null;
	workedTasks: AttendanceWorkedTask[];
}

/** Meta fields for type === "milestone" */
export interface MilestoneMeta {
	milestoneId: number;
	projectId: number;
	projectTitle: string | null;
	progressPercentage: number;
	invoiceId: number | null;
	paymentStageId: number | null;
}

export interface AggregatedCalendarItem {
	/** Prefixed unique ID: "event-12", "task-7", "invoice-3" */
	id: string;
	type: AggregatedItemType;
	title: string;
	/** YYYY-MM-DD — used for grouping in the timeline */
	date: string;
	startTime: string | null; // ISO-8601 (events only)
	endTime: string | null; // ISO-8601 (events only)
	status: string | null;
	meta: EventMeta | TaskMeta | InvoiceMeta | MilestoneMeta | SubscriptionMeta | AttendanceMeta;
}

export interface AggregatedCalendarResponse {
	items: AggregatedCalendarItem[];
	total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Payload types (sent TO the backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateCalendarEventPayload {
	title: string;
	description?: string | null;
	startTime: string; // ISO-8601 datetime
	endTime: string; // ISO-8601 datetime
	eventType?: CalendarEventType;
}

export type UpdateCalendarEventPayload = Partial<CreateCalendarEventPayload>;

export interface CalendarAggregatorParams {
	startDate: string; // YYYY-MM-DD
	endDate: string; // YYYY-MM-DD
}
