"use client";

/**
 * LeadCard — Draggable card rendered inside a Kanban column.
 *
 * Clicking the card opens read-only details. Stage and document commands
 * remain separate controls in the card footer.
 */

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { ArrowRight, Building2, Mail, SlidersHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Lead } from "@/features/leads/model/types";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import { LeadDetailsSheet } from "./LeadDetailsSheet";

interface LeadCardProps {
	lead: Lead;
	index: number;
	isDragDisabled: boolean;
	onCardClick?: (leadId: number) => void;
	onAdvance?: (lead: Lead) => void;
	onManageActions?: (lead: Lead) => void;
}

export function LeadCard({ lead, index, isDragDisabled, onCardClick, onAdvance, onManageActions }: LeadCardProps) {
	const [sheetOpen, setSheetOpen] = useState(false);
	const currentStageIndex = PIPELINE_STAGES.indexOf(lead.stage);
	const nextStage = PIPELINE_STAGES[currentStageIndex + 1];

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
				isDragDisabled={isDragDisabled}
			>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						className="mb-2 last:mb-0"
					>
						<div
							className={cn(
								// Base
								"overflow-hidden rounded-lg border bg-background",
								"border-border/50 shadow-sm",
								// Hover
								"hover:border-primary/40 hover:shadow-md",
								// Transition
								"transition-all duration-150",
								// Dragging state
								snapshot.isDragging && "shadow-lg ring-2 ring-primary/30 border-primary/40 rotate-[0.5deg]",
							)}
						>
							<button
								type="button"
								aria-label={`View ${lead.name} details`}
								onClick={() => {
									if (!snapshot.isDragging) handleClick();
								}}
								className="w-full cursor-pointer p-3 text-left outline-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
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
							</button>

							{/* ── Footer ─────────────────────────────────────── */}
							<div className="flex items-center justify-between gap-2 border-t border-border/40 px-3 py-2">
								<span className="text-[10px] font-medium text-muted-foreground/60 tabular-nums">#{lead.id}</span>
								<div className="flex items-center gap-1">
									{onManageActions && (
										<button
											type="button"
											aria-label={`Manage ${lead.name} pipeline actions`}
											onClick={(event) => {
												event.stopPropagation();
												onManageActions(lead);
											}}
											className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
										>
											<SlidersHorizontal className="size-3.5" />
										</button>
									)}
									{nextStage && onAdvance && !isDragDisabled ? (
										<button
										type="button"
										aria-label={`Move ${lead.name} to ${STAGE_LABELS[nextStage]}`}
										onClick={(event) => {
											event.stopPropagation();
											onAdvance(lead);
										}}
										className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
									>
										{STAGE_LABELS[nextStage]}
										<ArrowRight className="size-3" />
										</button>
									) : (
										!onManageActions && lead.phone && <span className="text-[10px] text-muted-foreground/60 truncate max-w-[110px]">{lead.phone}</span>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</Draggable>

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
