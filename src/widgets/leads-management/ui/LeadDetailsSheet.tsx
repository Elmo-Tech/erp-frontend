"use client";

/**
 * LeadDetailsSheet
 *
 * A right-side Sheet that opens when a LeadCard is clicked.
 * Displays:
 *  - Lead basic info (name, company, email, phone, budget)
 *  - Current pipeline stage with a visual progress indicator
 *  - Activity Timeline: a summary of completed stages the lead has passed
 *    (e.g. showing the Quotation amount if it passed that stage)
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/ui/sheet";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Building2, Mail, Phone, DollarSign, Calendar, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";
import type { Lead } from "@/features/leads/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Stage colour map
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<PipelineStage, string> = {
	new: "bg-slate-100 text-slate-700 border-slate-200",
	meeting: "bg-blue-50 text-blue-700 border-blue-200",
	proposal: "bg-violet-50 text-violet-700 border-violet-200",
	quotation: "bg-amber-50 text-amber-700 border-amber-200",
	contract: "bg-orange-50 text-orange-700 border-orange-200",
	closed_won: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ─────────────────────────────────────────────────────────────────────────────
// Info row helper
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number | null }) {
	if (!value) return null;
	return (
		<div className="flex items-start gap-3">
			<div className="flex items-center justify-center size-7 rounded-md bg-muted shrink-0 mt-0.5">
				<Icon className="size-3.5 text-muted-foreground" />
			</div>
			<div className="min-w-0">
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className="text-sm font-medium text-foreground truncate">{value}</p>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline progress bar
// ─────────────────────────────────────────────────────────────────────────────

function PipelineProgress({ currentStage }: { currentStage: PipelineStage }) {
	const currentIdx = PIPELINE_STAGES.indexOf(currentStage);

	return (
		<div className="space-y-2">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pipeline Progress</p>
			<div className="flex items-center gap-1">
				{PIPELINE_STAGES.map((stage, idx) => {
					const isCompleted = idx < currentIdx;
					const isCurrent = idx === currentIdx;
					const isLast = idx === PIPELINE_STAGES.length - 1;

					return (
						<div
							key={stage}
							className="flex items-center gap-1 flex-1 min-w-0"
						>
							<div className="flex flex-col items-center gap-1 flex-1 min-w-0">
								<div className={cn("size-2 rounded-full shrink-0 transition-colors", isCompleted && "bg-emerald-500", isCurrent && "bg-primary ring-2 ring-primary/30", !isCompleted && !isCurrent && "bg-muted-foreground/30")} />
								<p className={cn("text-[9px] text-center leading-tight truncate w-full", isCurrent ? "text-primary font-semibold" : "text-muted-foreground")}>{STAGE_LABELS[stage]}</p>
							</div>
							{!isLast && <div className={cn("h-px flex-1 mb-3 transition-colors", isCompleted ? "bg-emerald-400" : "bg-muted-foreground/20")} />}
						</div>
					);
				})}
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity timeline
// ─────────────────────────────────────────────────────────────────────────────

interface TimelineEvent {
	stage: PipelineStage;
	label: string;
	completed: boolean;
	current: boolean;
}

function ActivityTimeline({ lead }: { lead: Lead }) {
	const currentIdx = PIPELINE_STAGES.indexOf(lead.stage);

	const events: TimelineEvent[] = PIPELINE_STAGES.filter((s) => s !== "new").map((stage, i) => {
		const stageIdx = PIPELINE_STAGES.indexOf(stage);
		return {
			stage,
			label: STAGE_LABELS[stage],
			completed: stageIdx < currentIdx,
			current: stageIdx === currentIdx,
		};
	});

	return (
		<div className="space-y-1">
			{events.map((event, idx) => (
				<div
					key={event.stage}
					className="flex items-start gap-3"
				>
					{/* Timeline connector */}
					<div className="flex flex-col items-center shrink-0">
						<div
							className={cn(
								"flex items-center justify-center size-6 rounded-full border-2 transition-colors",
								event.completed && "bg-emerald-500 border-emerald-500 text-white",
								event.current && "bg-primary border-primary text-primary-foreground",
								!event.completed && !event.current && "bg-background border-muted-foreground/30 text-muted-foreground/50",
							)}
						>
							{event.completed ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3" />}
						</div>
						{idx < events.length - 1 && <div className={cn("w-px h-6 mt-0.5 transition-colors", event.completed ? "bg-emerald-300" : "bg-muted-foreground/20")} />}
					</div>

					{/* Event content */}
					<div className="pb-2 min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<p className={cn("text-sm font-medium", event.completed && "text-foreground", event.current && "text-primary", !event.completed && !event.current && "text-muted-foreground")}>{event.label}</p>
							{event.current && (
								<Badge
									variant="outline"
									className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary"
								>
									Current
								</Badge>
							)}
							{event.completed && (
								<Badge
									variant="outline"
									className="text-[10px] px-1.5 py-0 h-4 border-emerald-400/60 text-emerald-600"
								>
									Done
								</Badge>
							)}
						</div>
						{event.completed && <p className="text-xs text-muted-foreground mt-0.5">Stage completed</p>}
						{event.current && <p className="text-xs text-muted-foreground mt-0.5">Lead is currently here</p>}
						{!event.completed && !event.current && <p className="text-xs text-muted-foreground/60 mt-0.5">Pending</p>}
					</div>
				</div>
			))}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface LeadDetailsSheetProps {
	lead: Lead | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function LeadDetailsSheet({ lead, open, onOpenChange }: LeadDetailsSheetProps) {
	if (!lead) return null;

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
		>
			<SheetContent
				side="right"
				className="w-full sm:max-w-md flex flex-col p-0"
			>
				{/* ── Header ─────────────────────────────────────────────── */}
				<SheetHeader className="px-5 pt-5 pb-4 border-b shrink-0">
					<div className="flex items-start justify-between gap-3 pr-6">
						<div className="min-w-0">
							<SheetTitle className="text-base font-semibold leading-tight truncate">{lead.name}</SheetTitle>
							{lead.company && <SheetDescription className="text-sm mt-0.5 truncate">{lead.company}</SheetDescription>}
						</div>
						<Badge
							variant="outline"
							className={cn("shrink-0 text-xs border", STAGE_COLORS[lead.stage])}
						>
							{STAGE_LABELS[lead.stage]}
						</Badge>
					</div>
				</SheetHeader>

				{/* ── Scrollable body ─────────────────────────────────────── */}
				<ScrollArea className="flex-1 overflow-y-auto">
					<div className="px-5 py-4 space-y-6">
						{/* ── Contact Info ─────────────────────────────────── */}
						<div className="space-y-3">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</p>
							<div className="space-y-2.5">
								<InfoRow
									icon={Building2}
									label="Company"
									value={lead.company}
								/>
								<InfoRow
									icon={Mail}
									label="Email"
									value={lead.email}
								/>
								<InfoRow
									icon={Phone}
									label="Phone"
									value={lead.phone}
								/>
								<InfoRow
									icon={Calendar}
									label="Created"
									value={new Date(lead.createdAt).toLocaleDateString(undefined, {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								/>
							</div>
						</div>

						<Separator />

						{/* ── Pipeline Progress ────────────────────────────── */}
						<PipelineProgress currentStage={lead.stage} />

						<Separator />

						{/* ── Activity Timeline ────────────────────────────── */}
						<div className="space-y-3">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stage History</p>
							<ActivityTimeline lead={lead} />
						</div>

						{/* ── Lead ID ──────────────────────────────────────── */}
						<div className="pt-2">
							<p className="text-xs text-muted-foreground/60">Lead #{lead.id}</p>
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
