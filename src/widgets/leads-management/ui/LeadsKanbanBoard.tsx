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
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePipelineStore, selectActiveModal, selectPendingDrag } from "@/features/leads/model/usePipelineStore";
import { PIPELINE_STAGES } from "@/features/leads/model/pipelineConstants";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";
import type { Lead, StageModalPayload, StageModalResult } from "@/features/leads/model/types";
import { getPipelineStageGateFailure } from "@/features/leads/model/pipelineGates";
import { getPipelinePermissionFailure } from "@/features/leads/model/pipeline-permission-gates";
import { StageModal } from "@/features/leads/ui/PipelineModals/StageModal";
import { leadKeys, useConvertLeadToProject, useUpdateLeadStage } from "@/features/leads/api/leads.api";
import { KanbanColumn } from "./KanbanColumn";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LeadsKanbanBoardProps {
	leads: Lead[];
	canEdit: boolean;
	canConvert: boolean;
	canCreateQuotations: boolean;
	canCreateContracts: boolean;
	/** Called when a card is clicked (not dragged). Receives the lead ID. */
	onCardClick?: (leadId: number) => void;
}

export function LeadsKanbanBoard({ leads, canEdit, canConvert, canCreateQuotations, canCreateContracts, onCardClick }: LeadsKanbanBoardProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const updateLeadStageMutation = useUpdateLeadStage();
	const convertLeadToProjectMutation = useConvertLeadToProject();

	// ── Store selectors ───────────────────────────────────────────────────────
	const activeModal = usePipelineStore(selectActiveModal);
	const pendingDrag = usePipelineStore(selectPendingDrag);

	// ── Store actions ─────────────────────────────────────────────────────────
	const startDrag = usePipelineStore((s) => s.startDrag);
	const advanceQueue = usePipelineStore((s) => s.advanceQueue);
	const cancelDrag = usePipelineStore((s) => s.cancelDrag);

	// ── Local loading state (shown on the modal submit button) ────────────────
	const [isCommitting, setIsCommitting] = useState(false);

	const invalidateLeadQueries = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: leadKeys.all });
	}, [queryClient]);

	const setCachedLeadStage = useCallback(
		(leadId: number, stage: PipelineStage) => {
			queryClient.setQueryData<Lead[]>(leadKeys.list(), (currentLeads) => currentLeads?.map((lead) => (lead.id === leadId ? { ...lead, stage } : lead)) ?? currentLeads);
		},
		[queryClient],
	);

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
				const result = await convertLeadToProjectMutation.mutateAsync(leadId);
				const { project_title, client_name } = result.data;

				// Celebratory toast with action link
				toast.success(`🎉 Deal Won! "${project_title}" is now live.`, {
					description: `Client "${client_name}" created. Redirecting to clients...`,
					duration: 6000,
				});

				// Give the toast a moment to render before navigating
				setTimeout(() => {
					router.push("/dashboard/clients");
					router.refresh();
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
		[convertLeadToProjectMutation, router],
	);

	// ── Commit helper — fires the stage update API, then conversion if won ────
	const commitStageUpdate = useCallback(
		async (leadId: number, toStage: PipelineStage, results: StageModalResult[]) => {
			const fromStage = usePipelineStore.getState().pendingDrag?.fromStage ?? leads.find((lead) => lead.id === leadId)?.stage ?? toStage;
			const permissionFailure = getPipelinePermissionFailure(fromStage, toStage, {
				canEditLeads: canEdit,
				canConvertLeads: canConvert,
				canCreateQuotations,
				canCreateContracts,
			});
			if (permissionFailure) {
				toast.error(permissionFailure);
				cancelDrag();
				return;
			}

			setIsCommitting(true);
			try {
				await updateLeadStageMutation.mutateAsync({ leadId, newStage: toStage, stageResults: results });

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
				invalidateLeadQueries();
				cancelDrag();
			} finally {
				setIsCommitting(false);
				invalidateLeadQueries();
			}
		},
		[canConvert, canCreateContracts, canCreateQuotations, canEdit, cancelDrag, invalidateLeadQueries, leads, triggerConversion, updateLeadStageMutation],
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
			const permissionFailure = getPipelinePermissionFailure(fromStage, toStage, {
				canEditLeads: canEdit,
				canConvertLeads: canConvert,
				canCreateQuotations,
				canCreateContracts,
			});
			if (permissionFailure) {
				toast.error(permissionFailure);
				return;
			}
			const lead = leads.find((item) => item.id === leadId);

			if (lead) {
				const gateFailure = getPipelineStageGateFailure(lead, toStage);
				if (gateFailure) {
					toast.error(gateFailure);
					return;
				}
			}

			const intercepted = startDrag(leadId, fromStage, toStage);
			if (!intercepted) return;
			setCachedLeadStage(leadId, toStage);

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
		[canConvert, canCreateContracts, canCreateQuotations, canEdit, leads, startDrag, setCachedLeadStage, commitStageUpdate],
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
				<div className="flex gap-4 min-h-[600px]">
					{PIPELINE_STAGES.map((stage) => (
						<KanbanColumn
							key={stage}
							stage={stage}
							leads={leadsByStage[stage]}
							isDragDisabled={!canEdit}
							onCardClick={onCardClick}
						/>
					))}
				</div>
			</DragDropContext>

			{/* ── Modal Queue Renderer ─────────────────────────────────────────── */}
			{activeModal && pendingDrag && (
				<StageModal
					item={activeModal}
					onSubmit={handleModalSubmit}
					onCancel={() => {
						invalidateLeadQueries();
						cancelDrag();
					}}
					isLoading={isCommitting}
				/>
			)}
		</>
	);
}
