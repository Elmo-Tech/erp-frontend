"use client";

/**
 * ProjectActivityTab
 *
 * Renders the project audit trail from GET /projects/{id}/history.
 *
 * Each history entry records a field change (e.g. status: draft → active)
 * with the user who made it and an optional reason.
 *
 * Layout: vertical timeline — newest entries at the top.
 */

import { Activity, ArrowRight, AlertCircle } from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { EmptyState } from "@/shared/ui/data-display/EmptyState";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { formatDateTimeDisplay } from "@/shared/lib/dateUtils";
import { useProjectHistory } from "@/features/projects/api/execution.api";
import type { ProjectHistoryEntry } from "@/features/projects/api/execution.api";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
	return name
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase();
}

/** Convert snake_case field names to readable labels */
function formatFieldName(fieldName: string): string {
	return fieldName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────────────────────
// Single timeline entry
// ─────────────────────────────────────────────────────────────────────────────

function HistoryEntry({ entry }: { entry: ProjectHistoryEntry }) {
	const actor = entry.changedByUser;
	const actorName = actor?.name ?? `User #${entry.changedBy}`;

	return (
		<div className="relative flex gap-4">
			{/* ── Vertical connector line ──────────────────────────────────── */}
			<div className="flex flex-col items-center">
				<Avatar className="size-8 shrink-0 ring-2 ring-background">
					<AvatarFallback className="text-[10px] font-medium">{getInitials(actorName)}</AvatarFallback>
				</Avatar>
				{/* Line below avatar — hidden on last item via CSS in parent */}
				<div className="mt-1 w-px flex-1 bg-border" />
			</div>

			{/* ── Entry content ────────────────────────────────────────────── */}
			<div className="mb-6 min-w-0 flex-1 pb-0">
				{/* Actor + timestamp */}
				<div className="flex flex-wrap items-baseline gap-1.5">
					<span className="text-sm font-semibold">{actorName}</span>
					<span className="text-xs text-muted-foreground">changed</span>
					<span className="text-xs font-medium">{formatFieldName(entry.fieldName)}</span>
					<span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatDateTimeDisplay(entry.createdAt)}</span>
				</div>

				{/* Old → New value */}
				<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
					<Badge
						variant="outline"
						className={cn("rounded-sm border px-1.5 py-0 font-mono text-[10px] uppercase tracking-wide", "bg-red-50 text-red-700 border-red-200")}
					>
						{entry.oldValue || "—"}
					</Badge>
					<ArrowRight className="size-3 shrink-0 text-muted-foreground" />
					<Badge
						variant="outline"
						className={cn("rounded-sm border px-1.5 py-0 font-mono text-[10px] uppercase tracking-wide", "bg-emerald-50 text-emerald-700 border-emerald-200")}
					>
						{entry.newValue || "—"}
					</Badge>
				</div>

				{/* Optional reason */}
				{entry.reason && <p className="mt-1.5 text-xs italic text-muted-foreground">"{entry.reason}"</p>}
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function ActivitySkeleton() {
	return (
		<div className="flex flex-col gap-0">
			{Array.from({ length: 5 }).map((_, i) => (
				<div
					key={i}
					className="flex gap-4"
				>
					<div className="flex flex-col items-center">
						<Skeleton className="size-8 rounded-full" />
						<div className="mt-1 w-px flex-1 bg-border" />
					</div>
					<div className="mb-6 flex flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-64" />
						<Skeleton className="h-5 w-40" />
					</div>
				</div>
			))}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectActivityTabProps {
	projectId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectActivityTab({ projectId }: ProjectActivityTabProps) {
	const historyQuery = useProjectHistory(projectId);

	if (historyQuery.isLoading) {
		return <ActivitySkeleton />;
	}

	if (historyQuery.error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>{historyQuery.error.message ?? "Failed to load activity log."}</AlertDescription>
			</Alert>
		);
	}

	const entries = historyQuery.data ?? [];

	if (entries.length === 0) {
		return (
			<EmptyState
				icon={Activity}
				title="No activity yet"
				description="The project audit trail will appear here as changes are made — status updates, budget edits, deadline changes, and more."
			/>
		);
	}

	return (
		<div className="flex flex-col">
			<div className="mb-4 flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{entries.length} {entries.length === 1 ? "event" : "events"} recorded
				</p>
			</div>

			{/* Timeline — last entry has no connector line */}
			<div className="[&>div:last-child>div:first-child>div:last-child]:hidden">
				{entries.map((entry) => (
					<HistoryEntry
						key={entry.historyId}
						entry={entry}
					/>
				))}
			</div>
		</div>
	);
}
