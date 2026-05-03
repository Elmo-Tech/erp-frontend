/**
 * leads.api.ts
 *
 * API functions for the Leads / Sales Pipeline feature.
 * Uses the shared Axios instance (`api`) which handles auth tokens,
 * token-expiry redirects, and Accept-Language headers automatically.
 */

import api from "@/shared/api/base";
import type { StageModalResult } from "../model/types";
import type { PipelineStage } from "../model/pipelineConstants";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single entry in the `stage_results` array sent to the backend.
 * Maps the frontend StageModalPayload union to the flat shape that
 * ProcessLeadStageUpdateAction expects.
 */
export interface StageResultPayload {
	type: "proposal" | "quotation" | "contract";
	creation_type: "task" | "direct_upload" | "skipped";
	skip_reason?: string | null;
	status?: string | null;
	assigned_to?: number | null;
	file_path?: string | null;
	notes?: string | null;

	// Quotation
	currency?: string | null;
	base_price?: number | null;
	commission_type?: string | null;
	final_total?: number | null;
	payment_stages?: Array<{ stage_name: string; percentage: number; amount: number }> | null;

	// Contract (shared)
	contract_model?: "standard" | "saas_subscription" | null;
	development_days?: number | null;
	review_days?: number | null;
	testing_days?: number | null;
	delay_penalty?: number | null;
	source_code_handover?: boolean | null;
	execution_start_date?: string | null;
	working_days_per_week?: number | null;

	// Contract SaaS
	setup_fee?: number | null;
	recurring_fee?: number | null;
	billing_cycle?: string | null;
	subscription_start_date?: string | null;
	apply_promo?: boolean | null;
	promo_discount?: number | null;
	addons?: Array<{ name: string; price: number }> | null;
}

export interface UpdateLeadStageResponse {
	success: boolean;
	message: string;
	data: {
		id: number;
		stage: string;
	};
}

export interface ConvertLeadResponse {
	success: boolean;
	message: string;
	data: {
		client_id: number;
		client_name: string;
		project_id: number;
		project_title: string;
	};
}

// ─── Create Lead ─────────────────────────────────────────────────────────────

export interface CreateLeadPayload {
	title: string;
	company_name?: string | null;
	contact_name?: string | null;
	primary_email?: string | null;
	primary_phone?: string | null;
	expected_budget?: number | null;
	source?: string | null;
	notes?: string | null;
}

export interface CreateLeadResponse {
	success: boolean;
	message: string;
	data: {
		id: number;
		title: string;
		stage: string;
		status: string;
		company: string | null;
		email: string | null;
		phone: string | null;
		expected_budget: number | null;
		source: string | null;
		assignedTo: number | null;
		createdAt: string;
		updatedAt: string;
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// Payload mapper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps the frontend StageModalResult[] (collected from the modal queue) to the
 * flat StageResultPayload[] shape that the backend action expects.
 *
 * Stage → document type mapping:
 *   meeting  → proposal  (a meeting produces a proposal document)
 *   proposal → proposal
 *   quotation → quotation
 *   contract  → contract
 */
function mapStageResultToPayload(result: StageModalResult): StageResultPayload {
	const { stage, payload } = result;

	// Resolve the backend document type from the frontend stage name
	const typeMap: Record<StageModalResult["stage"], StageResultPayload["type"]> = {
		meeting: "proposal",
		proposal: "proposal",
		quotation: "quotation",
		contract: "contract",
	};
	const type = typeMap[stage];

	// ── Skip mode ─────────────────────────────────────────────────────────────
	if (payload.mode === "skip") {
		if (!payload.skipReason) {
			throw new Error(`[leads.api] skip_reason is required for stage "${stage}" but was not provided.`);
		}
		return {
			type,
			creation_type: "skipped",
			skip_reason: payload.skipReason,
			notes: payload.notes ?? null,
		};
	}

	// ── Task mode ─────────────────────────────────────────────────────────────
	if (payload.mode === "task") {
		return {
			type,
			creation_type: "task",
			assigned_to: payload.assignedTo,
			notes: payload.notes ?? null,
		};
	}

	// ── Direct upload — generic (meeting / proposal) ──────────────────────────
	if (stage === "meeting" || stage === "proposal") {
		return {
			type,
			creation_type: "direct_upload",
			// File upload is handled separately (multipart); here we pass null
			// until a dedicated file-upload endpoint is wired up.
			file_path: null,
			notes: (payload as { notes?: string }).notes ?? null,
		};
	}

	// ── Direct upload — quotation ─────────────────────────────────────────────
	if (stage === "quotation") {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const p = payload as any;
		return {
			type: "quotation",
			creation_type: "direct_upload",
			file_path: null,
			currency: p.currency ?? null,
			base_price: p.base_price ?? null,
			commission_type: p.commission_type ?? null,
			final_total: p.final_total ?? null,
			payment_stages: p.payment_stages ?? null,
			notes: p.notes ?? null,
		};
	}

	// ── Direct upload — contract ──────────────────────────────────────────────
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const p = payload as any;
	return {
		type: "contract",
		creation_type: "direct_upload",
		file_path: null,
		contract_model: p.contract_model ?? null,
		development_days: p.development_days ?? null,
		review_days: p.review_days ?? null,
		testing_days: p.testing_days ?? null,
		delay_penalty: p.delay_penalty ?? null,
		source_code_handover: p.source_code_handover ?? null,
		execution_start_date: p.execution_start_date ?? null,
		working_days_per_week: p.working_days_per_week ?? null,
		// Standard
		currency: p.currency ?? null,
		payment_stages: p.payment_stages ?? null,
		// SaaS
		setup_fee: p.setup_fee ?? null,
		recurring_fee: p.recurring_fee ?? null,
		billing_cycle: p.billing_cycle ?? null,
		subscription_start_date: p.subscription_start_date ?? null,
		apply_promo: p.apply_promo ?? null,
		promo_discount: p.promo_discount ?? null,
		addons: p.addons ?? null,
		notes: p.notes ?? null,
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// API function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update the pipeline stage of a lead.
 *
 * POST /api/v1/leads/{leadId}/stage
 *
 * @param leadId       - The ID of the lead being moved.
 * @param newStage     - The destination pipeline stage (backend enum value).
 * @param stageResults - Collected modal results from the drag interceptor queue.
 */
export async function updateLeadStage(leadId: number, newStage: PipelineStage, stageResults: StageModalResult[]): Promise<UpdateLeadStageResponse> {
	// Map frontend stage key to backend LeadStage enum value.
	// Frontend uses: "new" | "meeting" | "proposal" | "quotation" | "contract" | "closed_won"
	// Backend uses:  "new_lead" | "meeting" | "proposal" | "quotation" | "contract" | "won"
	const stageValueMap: Record<PipelineStage, string> = {
		new: "new_lead",
		meeting: "meeting",
		proposal: "proposal",
		quotation: "quotation",
		contract: "contract",
		closed_won: "won",
	};

	const payload = {
		new_stage: stageValueMap[newStage] ?? newStage,
		stage_results: stageResults.map(mapStageResultToPayload),
	};

	const response = await api.post<UpdateLeadStageResponse>(`/leads/${leadId}/stage`, payload);

	return response.data;
}

/**
 * Convert a won lead into a Client + Project.
 *
 * POST /api/v1/leads/{leadId}/convert
 *
 * Should be called immediately after a successful `updateLeadStage` call
 * where `newStage === "closed_won"`. Returns the new client and project IDs
 * so the UI can redirect to the project detail page.
 */
export async function convertLeadToProject(leadId: number): Promise<ConvertLeadResponse> {
	const response = await api.post<ConvertLeadResponse>(`/leads/${leadId}/convert`);
	return response.data;
}

/**
 * Create a new lead in the "new" pipeline column.
 *
 * POST /api/v1/leads
 *
 * Returns the full lead object so the caller can immediately push it
 * into the Zustand store for instant Kanban board appearance.
 */
export async function createLead(payload: CreateLeadPayload): Promise<CreateLeadResponse> {
	const response = await api.post<CreateLeadResponse>("/leads", payload);
	return response.data;
}

// ─── Get Leads ───────────────────────────────────────────────────────────────

export interface GetLeadsResponse {
	success: boolean;
	message: string;
	data: Array<{
		id: number;
		title: string;
		stage: string;
		status: string;
		company: string | null;
		email: string | null;
		phone: string | null;
		expected_budget: number | null;
		source: string | null;
		assignedTo: number | null;
		createdAt: string;
		updatedAt: string;
	}>;
}

/**
 * Fetch all leads for the pipeline board.
 *
 * GET /api/v1/leads
 *
 * Returns all leads so the Zustand store can be seeded on mount.
 */
export async function getLeads(): Promise<GetLeadsResponse> {
	const response = await api.get<GetLeadsResponse>("/leads");
	return response.data;
}

// ─── Get Single Lead ─────────────────────────────────────────────────────────

export interface GetLeadResponse {
	success: boolean;
	message: string;
	data: {
		id: number;
		title: string;
		stage: string;
		status: string;
		company: string | null;
		email: string | null;
		phone: string | null;
		contact_name: string | null;
		expected_budget: number | null;
		source: string | null;
		notes: string | null;
		expected_close_date: string | null;
		assignedTo: number | null;
		assignee: {
			id: number;
			name: string;
			email: string;
			avatar: string | null;
		} | null;
		createdAt: string;
		updatedAt: string;
	};
}

/**
 * Fetch a single lead by ID.
 *
 * GET /api/v1/leads/{leadId}
 */
export async function getLead(leadId: number): Promise<GetLeadResponse> {
	const response = await api.get<GetLeadResponse>(`/leads/${leadId}`);
	return response.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead sub-resource types (Proposals, Quotations, Contracts)
// ─────────────────────────────────────────────────────────────────────────────

export interface LeadProposal {
	id: number;
	status: string;
	creation_type: string;
	skip_reason: string | null;
	file_path: string | null;
	assigned_to: number | null;
	assignee: { id: number; name: string; email: string; avatar: string | null } | null;
	created_at: string;
	updated_at: string;
}

export interface LeadQuotation {
	id: number;
	status: string;
	creation_type: string;
	skip_reason: string | null;
	file_path: string | null;
	currency: string | null;
	base_price: number | null;
	commission_type: string | null;
	final_total: number | null;
	payment_stages: Array<{ stage_name: string; percentage: number; amount: number }>;
	assigned_to: number | null;
	assignee: { id: number; name: string; email: string; avatar: string | null } | null;
	created_at: string;
	updated_at: string;
}

export interface LeadContract {
	id: number;
	status: string;
	creation_type: string;
	skip_reason: string | null;
	file_path: string | null;
	contract_model: string | null;
	development_days: number | null;
	review_days: number | null;
	testing_days: number | null;
	delay_penalty: number | null;
	source_code_handover: boolean;
	execution_start_date: string | null;
	working_days_per_week: number | null;
	currency: string | null;
	total_amount: number | null;
	payment_stages: Array<{ stage_name: string; percentage: number; amount: number }>;
	setup_fee: number | null;
	recurring_fee: number | null;
	billing_cycle: string | null;
	subscription_start_date: string | null;
	apply_promo: boolean;
	promo_discount: number | null;
	addons: Array<{ name: string; price: number }>;
	notes: string | null;
	assigned_to: number | null;
	assignee: { id: number; name: string; email: string; avatar: string | null } | null;
	created_at: string;
	updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET sub-resources
// ─────────────────────────────────────────────────────────────────────────────

export async function getLeadProposals(leadId: number): Promise<{ data: LeadProposal[] }> {
	const res = await api.get<{ success: boolean; data: LeadProposal[] }>(`/leads/${leadId}/proposals`);
	return res.data;
}

export async function getLeadQuotations(leadId: number): Promise<{ data: LeadQuotation[] }> {
	const res = await api.get<{ success: boolean; data: LeadQuotation[] }>(`/leads/${leadId}/quotations`);
	return res.data;
}

export async function getLeadContracts(leadId: number): Promise<{ data: LeadContract[] }> {
	const res = await api.get<{ success: boolean; data: LeadContract[] }>(`/leads/${leadId}/contracts`);
	return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST sub-resources (direct creation — same payload shape as pipeline)
// ─────────────────────────────────────────────────────────────────────────────

export async function createLeadProposal(leadId: number, payload: Record<string, unknown>): Promise<{ data: LeadProposal }> {
	const res = await api.post<{ success: boolean; data: LeadProposal }>(`/leads/${leadId}/proposals`, payload);
	return res.data;
}

export async function createLeadQuotation(leadId: number, payload: Record<string, unknown>): Promise<{ data: LeadQuotation }> {
	const res = await api.post<{ success: boolean; data: LeadQuotation }>(`/leads/${leadId}/quotations`, payload);
	return res.data;
}

export async function createLeadContract(leadId: number, payload: Record<string, unknown>): Promise<{ data: LeadContract }> {
	const res = await api.post<{ success: boolean; data: LeadContract }>(`/leads/${leadId}/contracts`, payload);
	return res.data;
}
