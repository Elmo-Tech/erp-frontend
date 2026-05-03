"use client";

/**
 * LeadCard — Draggable card rendered inside a Kanban column.
 *
 * Clicking the card (when not dragging) calls `onCardClick(lead.id)` so the
 * parent can navigate to `/leads/[id]`. Falls back to opening the legacy
 * LeadDetailsSheet if no `onCardClick` is provided.
 */

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Building2, Mail } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Lead } from "@/features/leads/model/types";
import { LeadDetailsSheet } from "./LeadDetailsSheet";

interface LeadCardProps {
	lead: Lead;
	index: number;
	/** If provided, clicking the card calls this instead of opening the sheet. */
	onCardClick?: (leadId: number) => void;
}

export function LeadCard({ lead, index, onCardClick }: LeadCardProps) {
	const [sheetOpen, setSheetOpen] = useState(false);

	const handleClick = () => {
		if (onCardClick) {
			onCardClick(lead.id);
		} else {
			setSheetOpen(true);
		}
	};

	return (
		<>
			<Draggable
				draggableId={String(lead.id)}
				index={index}
			>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						className="mb-2 last:mb-0"
					>
						<div
							onClick={() => {
								if (!snapshot.isDragging) handleClick();
							}}
							className={cn(
								// Base
								"rounded-lg border bg-background p-3 cursor-pointer",
								"border-border/50 shadow-sm",
								// Hover
								"hover:border-primary/40 hover:shadow-md",
								// Transition
								"transition-all duration-150",
								// Dragging state
								snapshot.isDragging && "shadow-lg ring-2 ring-primary/30 border-primary/40 rotate-[0.5deg]",
							)}
						>
							{/* ── Title ──────────────────────────────────────── */}
							<p className="font-semibold text-sm leading-snug text-foreground truncate">{lead.name}</p>

							{/* ── Company ────────────────────────────────────── */}
							{lead.company && (
								<div className="flex items-center gap-1.5 mt-1.5">
									<Building2 className="size-3 text-muted-foreground/60 shrink-0" />
									<p className="text-xs text-muted-foreground truncate">{lead.company}</p>
								</div>
							)}

							{/* ── Email ──────────────────────────────────────── */}
							{lead.email && (
								<div className="flex items-center gap-1.5 mt-1">
									<Mail className="size-3 text-muted-foreground/60 shrink-0" />
									<p className="text-xs text-muted-foreground truncate">{lead.email}</p>
								</div>
							)}

							{/* ── Footer ─────────────────────────────────────── */}
							<div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/40">
								<span className="text-[10px] font-medium text-muted-foreground/60 tabular-nums">#{lead.id}</span>
								{lead.phone && <span className="text-[10px] text-muted-foreground/60 truncate max-w-[110px]">{lead.phone}</span>}
							</div>
						</div>
					</div>
				)}
			</Draggable>

			{/* Legacy sheet — only rendered when no onCardClick is provided */}
			{!onCardClick && (
				<LeadDetailsSheet
					lead={lead}
					open={sheetOpen}
					onOpenChange={setSheetOpen}
				/>
			)}
		</>
	);
}
