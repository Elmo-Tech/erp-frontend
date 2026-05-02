"use client";

/**
 * usePipelineStore — Zustand store for the Sales Pipeline Drag Interceptor Engine.
 *
 * FLOW:
 * 1. User drags a lead card from stage A → stage Z.
 * 2. onDragEnd fires → interceptDrag() is called.
 * 3. The engine calculates all intermediate stages between A and Z that require
 *    a modal (MODAL_REQUIRED_STAGES), plus the destination stage itself (if it
 *    requires a modal).
 * 4. These stages are pushed into `modalQueue` as ModalQueueItem[].
 * 5. The board UI watches `modalQueue[0]` and opens the appropriate modal.
 * 6. When the user submits a modal (task / upload / skip), `advanceQueue()` is
 *    called, which pops the first item and stores the result.
 * 7. When `modalQueue` is empty, `commitDrag()` fires the API mutation with the
 *    final destination stage + all collected stage results.
 * 8. If the user cancels any modal, `cancelDrag()` reverts the optimistic UI.
 */

import { create } from "zustand";
import { PIPELINE_STAGES, MODAL_REQUIRED_STAGES } from "./pipelineConstants";
import type { Lead, PendingDrag, ModalQueueItem, StageModalResult } from "./types";
import type { PipelineStage } from "./pipelineConstants";

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface PipelineState {
	/** Current optimistic list of leads (keyed by stage for the board) */
	leads: Lead[];

	/** The drag that is currently being processed (null when idle) */
	pendingDrag: PendingDrag | null;

	/** Queue of modals that must be completed before the API call fires */
	modalQueue: ModalQueueItem[];

	/** Accumulated results from each completed modal */
	completedStageResults: StageModalResult[];

	// ── Actions ──────────────────────────────────────────────────────────────

	/** Seed the store with leads from the server */
	setLeads: (leads: Lead[]) => void;

	/** Prepend a single newly-created lead into the store (optimistic insert) */
	addLead: (lead: Lead) => void;

	/**
	 * Called by onDragEnd.
	 * Performs optimistic UI update and builds the modal queue.
	 * Returns false if the drag is a no-op (same column or backward move).
	 */
	interceptDrag: (leadId: number, fromStage: PipelineStage, toStage: PipelineStage) => boolean;

	/**
	 * Called when the user successfully submits a modal form.
	 * Pops the first item from the queue and stores the result.
	 * When the queue empties, calls the provided commit callback.
	 */
	advanceQueue: (result: StageModalResult, onCommit: (drag: PendingDrag, results: StageModalResult[]) => void) => void;

	/**
	 * Called when the user cancels/closes any modal in the queue.
	 * Reverts the optimistic UI and clears all state.
	 */
	cancelDrag: () => void;

	/** Internal: clear all drag-related state after commit or cancel */
	_resetDragState: () => void;
}

// ---------------------------------------------------------------------------
// Helper: compute the modal queue for a given drag
// ---------------------------------------------------------------------------

function buildModalQueue(fromStage: PipelineStage, toStage: PipelineStage): ModalQueueItem[] {
	const fromIdx = PIPELINE_STAGES.indexOf(fromStage);
	const toIdx = PIPELINE_STAGES.indexOf(toStage);

	if (toIdx <= fromIdx) return []; // backward / same — handled before calling

	const queue: ModalQueueItem[] = [];

	// Intermediate stages (exclusive of fromStage, exclusive of toStage)
	for (let i = fromIdx + 1; i < toIdx; i++) {
		const stage = PIPELINE_STAGES[i];
		if (MODAL_REQUIRED_STAGES.includes(stage as (typeof MODAL_REQUIRED_STAGES)[number])) {
			queue.push({
				stage: stage as ModalQueueItem["stage"],
				isIntermediateSkip: true,
			});
		}
	}

	// Destination stage itself (if it requires a modal)
	if (MODAL_REQUIRED_STAGES.includes(toStage as (typeof MODAL_REQUIRED_STAGES)[number])) {
		queue.push({
			stage: toStage as ModalQueueItem["stage"],
			isIntermediateSkip: false,
		});
	}

	return queue;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePipelineStore = create<PipelineState>((set, get) => ({
	leads: [],
	pendingDrag: null,
	modalQueue: [],
	completedStageResults: [],

	// ── setLeads ──────────────────────────────────────────────────────────────
	setLeads: (leads) => set({ leads }),

	// ── addLead ───────────────────────────────────────────────────────────────
	addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),

	// ── interceptDrag ─────────────────────────────────────────────────────────
	interceptDrag: (leadId, fromStage, toStage) => {
		const { leads } = get();

		const fromIdx = PIPELINE_STAGES.indexOf(fromStage);
		const toIdx = PIPELINE_STAGES.indexOf(toStage);

		// No-op: same column or backward drag
		if (toIdx <= fromIdx) return false;

		// Snapshot current leads for potential revert
		const snapshot = leads.map((l) => ({ ...l }));

		// Optimistic update: move the lead to the destination stage immediately
		const updatedLeads = leads.map((lead) => (lead.id === leadId ? { ...lead, stage: toStage } : lead));

		const queue = buildModalQueue(fromStage, toStage);

		set({
			leads: updatedLeads,
			pendingDrag: { leadId, fromStage, toStage, snapshot },
			modalQueue: queue,
			completedStageResults: [],
		});

		return true;
	},

	// ── advanceQueue ──────────────────────────────────────────────────────────
	advanceQueue: (result, onCommit) => {
		const { modalQueue, completedStageResults, pendingDrag } = get();

		const updatedResults = [...completedStageResults, result];
		const remainingQueue = modalQueue.slice(1);

		if (remainingQueue.length === 0) {
			// All modals completed — fire the API
			if (pendingDrag) {
				onCommit(pendingDrag, updatedResults);
			}
			get()._resetDragState();
		} else {
			set({
				modalQueue: remainingQueue,
				completedStageResults: updatedResults,
			});
		}
	},

	// ── cancelDrag ────────────────────────────────────────────────────────────
	cancelDrag: () => {
		const { pendingDrag } = get();

		if (pendingDrag) {
			// Revert optimistic update
			set({ leads: pendingDrag.snapshot });
		}

		get()._resetDragState();
	},

	// ── _resetDragState ───────────────────────────────────────────────────────
	_resetDragState: () =>
		set({
			pendingDrag: null,
			modalQueue: [],
			completedStageResults: [],
		}),
}));

// ---------------------------------------------------------------------------
// Selector helpers (use these in components to avoid re-renders)
// ---------------------------------------------------------------------------

export const selectLeads = (s: PipelineState) => s.leads;
export const selectModalQueue = (s: PipelineState) => s.modalQueue;
export const selectPendingDrag = (s: PipelineState) => s.pendingDrag;
export const selectActiveModal = (s: PipelineState) => s.modalQueue[0] ?? null;
