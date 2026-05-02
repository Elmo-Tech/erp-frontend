"use client";

/**
 * LeadsKanbanBoard — Main Kanban Board component for the Sales Pipeline.
 *
 * DRAG INTERCEPTOR ENGINE INTEGRATION:
 * ─────────────────────────────────────
 * 1. DragDropContext.onDragEnd fires.
 * 2. interceptDrag() is called → optimistic UI update + modal queue built.
 * 3. This component watches modalQueue[0] (selectActiveModal).
 * 4. When a modal item is present, <StageModal> is rendered.
 * 5. StageModal.onSubmit → advanceQueue() → pops item, stores result.
 * 6. When queue empties, advanceQueue calls onCommit → fires the API mutation.
 * 7. StageModal.onCancel → cancelDrag() → reverts optimistic UI.
 *
 * CONVERSION ENGINE:
 * ───────────────────
 * When a lead is dragged to "closed_won":
 *   a. updateLeadStage fires (marks the lead as won in the pipeline).
 *   b. convertLeadToProject fires immediately after (creates Client + Project).
 *   c. A celebratory toast is shown with the project title.
 *   d. The user is redirected to the new project's detail page.
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { usePipelineStore, selectLeads, selectActiveModal, selectPendingDrag } from "@/features/leads/model/usePipelineStore";
import { PIPELINE_STAGES } from "@/features/leads/model/pipelineConstants";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";
import type { StageModalPayload, StageModalResult } from "@/features/leads/model/types";
import { StageModal } from "@/features/leads/ui/PipelineModals/StageModal";
import { updateLeadStage, convertLeadToProject } from "@/features/leads/api/leads.api";
import { KanbanColumn } from "./KanbanColumn";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LeadsKanbanBoard() {
	const router = useRouter();

	// ── Store selectors ───────────────────────────────────────────────────────
	const leads = usePipelineStore(selectLeads);
	const activeModal = usePipelineStore(selectActiveModal);
	const pendingDrag = usePipelineStore(selectPendingDrag);

	// ── Store actions ─────────────────────────────────────────────────────────
	const interceptDrag = usePipelineStore((s) => s.interceptDrag);
	const advanceQueue = usePipelineStore((s) => s.advanceQueue);
	const cancelDrag = usePipelineStore((s) => s.cancelDrag);

	// ── Local loading state (shown on the modal submit button) ────────────────
	const [isCommitting, setIsCommitting] = useState(false);

	// ── Derived: leads grouped by stage ──────────────────────────────────────
	const leadsByStage = PIPELINE_STAGES.reduce<Record<PipelineStage, typeof leads>>(
		(acc, stage) => {
			acc[stage] = leads.filter((l) => l.stage === stage);
			return acc;
		},
		{} as Record<PipelineStage, typeof leads>,
	);

	// ── Conversion helper — fires after a successful closed_won stage update ──
	const triggerConversion = useCallback(
		async (leadId: number) => {
			try {
				const result = await convertLeadToProject(leadId);
				const { project_id, project_title, client_name } = result.data;

				// Celebratory toast with action link
				toast.success(`🎉 Deal Won! "${project_title}" is now live.`, {
					description: `Client "${client_name}" created. Redirecting to the project…`,
					duration: 6000,
				});

				// Give the toast a moment to render before navigating
				setTimeout(() => {
					router.push(`/dashboard/projects/${project_id}`);
				}, 1200);
			} catch (conversionErr) {
				// Stage update already succeeded — don't revert the board.
				// Log and surface a non-blocking warning so the user can retry.
				console.error("[LeadsKanbanBoard] Conversion failed:", conversionErr);
				toast.warning("Lead marked as won, but automatic conversion failed.", {
					description: "Please convert the lead manually from the lead detail page.",
					duration: 8000,
				});
			}
		},
		[router],
	);

	// ── Commit helper — fires the stage update API, then conversion if won ────
	const commitStageUpdate = useCallback(
		async (leadId: number, toStage: PipelineStage, results: StageModalResult[]) => {
			setIsCommitting(true);
			try {
				await updateLeadStage(leadId, toStage, results);

				if (toStage === "closed_won") {
					// Don't show the generic success toast — triggerConversion
					// will show the celebratory one instead.
					await triggerConversion(leadId);
				} else {
					toast.success("Lead stage updated and documents generated successfully!");
				}
			} catch (err) {
				console.error("[LeadsKanbanBoard] Stage update failed:", err);
				toast.error("Failed to update lead stage. Changes have been reverted.");
				cancelDrag();
			} finally {
				setIsCommitting(false);
			}
		},
		[cancelDrag, triggerConversion],
	);

	// ── onDragEnd — the Drag Interceptor Engine entry point ──────────────────
	const handleDragEnd = useCallback(
		(result: DropResult) => {
			const { source, destination, draggableId } = result;

			if (!destination) return;
			if (destination.droppableId === source.droppableId && destination.index === source.index) {
				return;
			}

			const leadId = Number(draggableId);
			const fromStage = source.droppableId as PipelineStage;
			const toStage = destination.droppableId as PipelineStage;

			const intercepted = interceptDrag(leadId, fromStage, toStage);
			if (!intercepted) return;

			// If the queue is empty (no modal stages between from and to),
			// commit immediately without opening any modal.
			const queueAfterIntercept = usePipelineStore.getState().modalQueue;
			if (queueAfterIntercept.length === 0) {
				const drag = usePipelineStore.getState().pendingDrag;
				if (drag) {
					commitStageUpdate(drag.leadId, drag.toStage, []).finally(() => {
						usePipelineStore.getState()._resetDragState();
					});
				}
			}
			// Otherwise the modal queue is non-empty — StageModal will render.
		},
		[interceptDrag, commitStageUpdate],
	);

	// ── Modal submit handler ──────────────────────────────────────────────────
	const handleModalSubmit = useCallback(
		(payload: StageModalPayload) => {
			if (!activeModal) return;

			const result: StageModalResult = {
				stage: activeModal.stage,
				payload,
			};

			advanceQueue(result, async (drag, results) => {
				await commitStageUpdate(drag.leadId, drag.toStage, results);
			});
		},
		[activeModal, advanceQueue, commitStageUpdate],
	);

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<>
			<DragDropContext onDragEnd={handleDragEnd}>
				<div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-12rem)]">
					{PIPELINE_STAGES.map((stage) => (
						<KanbanColumn
							key={stage}
							stage={stage}
							leads={leadsByStage[stage]}
						/>
					))}
				</div>
			</DragDropContext>

			{/* ── Modal Queue Renderer ─────────────────────────────────────────── */}
			{activeModal && pendingDrag && (
				<StageModal
					item={activeModal}
					onSubmit={handleModalSubmit}
					onCancel={cancelDrag}
					isLoading={isCommitting}
				/>
			)}
		</>
	);
}
