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
import { Building2, Mail, Phone, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";
import type { Lead } from "@/features/leads/model/types";
import { STAGE_COLORS, InfoRow, PipelineProgress, ActivityTimeline } from "@/features/leads/ui/LeadInfoRow";

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
							<ActivityTimeline currentStage={lead.stage} />
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
