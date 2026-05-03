"use client";

/**
 * LeadDetailsView
 *
 * Full-page view for a single lead. Rendered by the `/leads/[id]` route.
 *
 * Layout:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  Header: Back button · Lead Title · Company · Stage     │
 *  │  Stage Stepper: New → Meeting → Proposal → … → Won     │
 *  ├─────────────────────────────────────────────────────────┤
 *  │  Tabs: Overview | Meetings | Proposals | Quotations |   │
 *  │        Contracts | Activity Log                         │
 *  └─────────────────────────────────────────────────────────┘
 *
 * Stage transitions from the stepper reuse the same drag-interceptor
 * engine (interceptDrag → modal queue → commitStageUpdate) so all
 * business logic stays in one place.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Mail, Phone, DollarSign, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Skeleton } from "@/shared/ui/skeleton";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/shared/lib/utils";
import { getLead, updateLeadStage, convertLeadToProject } from "@/features/leads/api/leads.api";
import { usePipelineStore } from "@/features/leads/model/usePipelineStore";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";
import type { Lead, StageModalPayload, StageModalResult } from "@/features/leads/model/types";
import { StageModal } from "@/features/leads/ui/PipelineModals/StageModal";
import { MeetingsList } from "@/entities/meetings/ui/MeetingsList";
import { PolyMeetingForm } from "@/features/meetings/ui/PolyMeetingForm";
import { LeadProposalsTab } from "@/views/leads/tabs/LeadProposalsTab";
import { LeadQuotationsTab } from "@/views/leads/tabs/LeadQuotationsTab";
import { LeadContractsTab } from "@/views/leads/tabs/LeadContractsTab";
import { LeadActivityTab } from "@/views/leads/tabs/LeadActivityTab";

// ─────────────────────────────────────────────────────────────────────────────
// Backend → frontend stage mapping
// ─────────────────────────────────────────────────────────────────────────────

const BACKEND_TO_FRONTEND_STAGE: Record<string, PipelineStage> = {
	new_lead: "new",
	meeting: "meeting",
	proposal: "proposal",
	quotation: "quotation",
	contract: "contract",
	won: "closed_won",
	new: "new",
	closed_won: "closed_won",
};

// ─────────────────────────────────────────────────────────────────────────────
// Stage colours
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_BADGE_CLASS: Record<PipelineStage, string> = {
	new: "bg-slate-100 text-slate-700 border-slate-200",
	meeting: "bg-blue-50 text-blue-700 border-blue-200",
	proposal: "bg-violet-50 text-violet-700 border-violet-200",
	quotation: "bg-amber-50 text-amber-700 border-amber-200",
	contract: "bg-orange-50 text-orange-700 border-orange-200",
	closed_won: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ─────────────────────────────────────────────────────────────────────────────
// Stage Stepper
// ─────────────────────────────────────────────────────────────────────────────

interface StageStepperProps {
	currentStage: PipelineStage;
	onAdvance: (toStage: PipelineStage) => void;
	isAdvancing: boolean;
}

function StageStepper({ currentStage, onAdvance, isAdvancing }: StageStepperProps) {
	const currentIdx = PIPELINE_STAGES.indexOf(currentStage);

	return (
		<div className="flex items-center gap-1 flex-wrap">
			{PIPELINE_STAGES.map((stage, idx) => {
				const isCompleted = idx < currentIdx;
				const isCurrent = idx === currentIdx;
				const isNext = idx === currentIdx + 1;
				const isLast = idx === PIPELINE_STAGES.length - 1;

				return (
					<div
						key={stage}
						className="flex items-center gap-1"
					>
						<button
							type="button"
							disabled={!isNext || isAdvancing}
							onClick={() => isNext && onAdvance(stage)}
							className={cn(
								"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
								isCompleted && "bg-emerald-100 text-emerald-700 cursor-default",
								isCurrent && "bg-primary text-primary-foreground shadow-sm cursor-default",
								isNext && !isAdvancing && "bg-muted hover:bg-primary/10 hover:text-primary border border-dashed border-primary/40 cursor-pointer",
								isNext && isAdvancing && "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
								!isCompleted && !isCurrent && !isNext && "bg-muted/50 text-muted-foreground/50 cursor-default",
							)}
							title={isNext ? `Advance to ${STAGE_LABELS[stage]}` : undefined}
						>
							{isCompleted && <CheckCircle2 className="size-3 shrink-0" />}
							{STAGE_LABELS[stage]}
						</button>
						{!isLast && <ChevronRight className="size-3.5 text-muted-foreground/40 shrink-0" />}
					</div>
				);
			})}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview tab
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ lead }: { lead: Lead }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
			{/* Contact card */}
			<div className="rounded-xl border bg-card p-5 space-y-4">
				<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h3>
				<div className="space-y-3">
					{lead.company && (
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center size-8 rounded-md bg-muted shrink-0">
								<Building2 className="size-4 text-muted-foreground" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Company</p>
								<p className="text-sm font-medium">{lead.company}</p>
							</div>
						</div>
					)}
					{lead.email && (
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center size-8 rounded-md bg-muted shrink-0">
								<Mail className="size-4 text-muted-foreground" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Email</p>
								<p className="text-sm font-medium">{lead.email}</p>
							</div>
						</div>
					)}
					{lead.phone && (
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center size-8 rounded-md bg-muted shrink-0">
								<Phone className="size-4 text-muted-foreground" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Phone</p>
								<p className="text-sm font-medium">{lead.phone}</p>
							</div>
						</div>
					)}
					{lead.expectedBudget != null && (
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center size-8 rounded-md bg-muted shrink-0">
								<DollarSign className="size-4 text-muted-foreground" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Expected Budget</p>
								<p className="text-sm font-medium">
									{lead.expectedBudget.toLocaleString(undefined, {
										style: "currency",
										currency: "USD",
										maximumFractionDigits: 0,
									})}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Pipeline card */}
			<div className="rounded-xl border bg-card p-5 space-y-4">
				<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pipeline Details</h3>
				<div className="space-y-3 text-sm">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Lead ID</span>
						<span className="font-medium">#{lead.id}</span>
					</div>
					<Separator />
					<div className="flex justify-between">
						<span className="text-muted-foreground">Current Stage</span>
						<Badge
							variant="outline"
							className={STAGE_BADGE_CLASS[lead.stage]}
						>
							{STAGE_LABELS[lead.stage]}
						</Badge>
					</div>
					<Separator />
					<div className="flex justify-between">
						<span className="text-muted-foreground">Assigned To</span>
						<span className="font-medium">{lead.assignedTo ? `User #${lead.assignedTo}` : "Unassigned"}</span>
					</div>
					<Separator />
					<div className="flex justify-between">
						<span className="text-muted-foreground">Created</span>
						<span className="font-medium">
							{new Date(lead.createdAt).toLocaleDateString(undefined, {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────────────────────

interface LeadDetailsViewProps {
	leadId: number;
}

export function LeadDetailsView({ leadId }: LeadDetailsViewProps) {
	const router = useRouter();
	const [lead, setLead] = useState<Lead | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAdvancing, setIsAdvancing] = useState(false);

	// Pipeline store — reuse the same interceptor engine
	const interceptDrag = usePipelineStore((s) => s.interceptDrag);
	const advanceQueue = usePipelineStore((s) => s.advanceQueue);
	const cancelDrag = usePipelineStore((s) => s.cancelDrag);
	const activeModal = usePipelineStore((s) => s.modalQueue[0] ?? null);
	const pendingDrag = usePipelineStore((s) => s.pendingDrag);

	// ── Fetch lead ────────────────────────────────────────────────────────────
	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);

		getLead(leadId)
			.then((res) => {
				if (cancelled) return;
				const stage = BACKEND_TO_FRONTEND_STAGE[res.data.stage] ?? "new";
				setLead({
					id: res.data.id,
					name: res.data.title,
					company: res.data.company ?? undefined,
					email: res.data.email ?? undefined,
					phone: res.data.phone ?? undefined,
					stage,
					assignedTo: res.data.assignedTo ?? undefined,
					expectedBudget: res.data.expected_budget ?? undefined,
					createdAt: res.data.createdAt,
					updatedAt: res.data.updatedAt,
				});
			})
			.catch((err) => {
				console.error("[LeadDetailsView] Failed to fetch lead:", err);
				toast.error("Failed to load lead details.");
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [leadId]);

	// ── Commit stage update ───────────────────────────────────────────────────
	const commitStageUpdate = useCallback(
		async (toStage: PipelineStage, results: StageModalResult[]) => {
			setIsAdvancing(true);
			try {
				await updateLeadStage(leadId, toStage, results);

				if (toStage === "closed_won") {
					try {
						const result = await convertLeadToProject(leadId);
						const { project_id, project_title, client_name } = result.data;
						toast.success(`🎉 Deal Won! "${project_title}" is now live.`, {
							description: `Client "${client_name}" created. Redirecting to the project…`,
							duration: 6000,
						});
						setTimeout(() => router.push(`/dashboard/projects/${project_id}`), 1200);
					} catch {
						toast.warning("Lead marked as won, but automatic conversion failed.", {
							description: "Please convert the lead manually.",
							duration: 8000,
						});
					}
				} else {
					toast.success("Lead stage updated successfully!");
					// Refresh lead data
					const res = await getLead(leadId);
					const stage = BACKEND_TO_FRONTEND_STAGE[res.data.stage] ?? "new";
					setLead((prev) => (prev ? { ...prev, stage, updatedAt: res.data.updatedAt } : prev));
				}
			} catch (err) {
				console.error("[LeadDetailsView] Stage update failed:", err);
				toast.error("Failed to update lead stage.");
				cancelDrag();
			} finally {
				setIsAdvancing(false);
			}
		},
		[leadId, router, cancelDrag],
	);

	// ── Stepper advance handler ───────────────────────────────────────────────
	const handleAdvance = useCallback(
		(toStage: PipelineStage) => {
			if (!lead) return;

			// Seed the pipeline store with this lead so interceptDrag can find it
			usePipelineStore.getState().setLeads([lead]);

			const intercepted = interceptDrag(lead.id, lead.stage, toStage);
			if (!intercepted) return;

			const queueAfterIntercept = usePipelineStore.getState().modalQueue;
			if (queueAfterIntercept.length === 0) {
				const drag = usePipelineStore.getState().pendingDrag;
				if (drag) {
					commitStageUpdate(drag.toStage, []).finally(() => {
						usePipelineStore.getState()._resetDragState();
					});
				}
			}
		},
		[lead, interceptDrag, commitStageUpdate],
	);

	// ── Modal submit ──────────────────────────────────────────────────────────
	const handleModalSubmit = useCallback(
		(payload: StageModalPayload) => {
			if (!activeModal) return;
			const result: StageModalResult = { stage: activeModal.stage, payload };
			advanceQueue(result, async (drag, results) => {
				await commitStageUpdate(drag.toStage, results);
			});
		},
		[activeModal, advanceQueue, commitStageUpdate],
	);

	// ── Loading skeleton ──────────────────────────────────────────────────────
	if (isLoading) {
		return (
			<div className="flex flex-col gap-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!lead) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4">
				<p className="text-muted-foreground">Lead not found.</p>
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/leads")}
				>
					<ArrowLeft className="mr-2 size-4" />
					Back to Pipeline
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{/* ── Header ───────────────────────────────────────────────────── */}
			<div className="flex flex-col gap-4">
				{/* Back + title row */}
				<div className="flex items-start gap-3">
					<Button
						variant="ghost"
						size="icon"
						className="shrink-0 mt-0.5"
						onClick={() => router.push("/dashboard/leads")}
					>
						<ArrowLeft className="size-4" />
					</Button>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 flex-wrap">
							<h1 className="text-2xl font-semibold tracking-tight truncate">{lead.name}</h1>
							<Badge
								variant="outline"
								className={STAGE_BADGE_CLASS[lead.stage]}
							>
								{STAGE_LABELS[lead.stage]}
							</Badge>
						</div>
						{lead.company && (
							<p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
								<Building2 className="size-3.5 shrink-0" />
								{lead.company}
							</p>
						)}
					</div>
				</div>

				{/* Stage stepper */}
				<div className="pl-11">
					<StageStepper
						currentStage={lead.stage}
						onAdvance={handleAdvance}
						isAdvancing={isAdvancing}
					/>
				</div>
			</div>

			<Separator />

			{/* ── Tabs ─────────────────────────────────────────────────────── */}
			<Tabs defaultValue="overview">
				<TabsList className="w-full justify-start overflow-x-auto">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="meetings">Meetings</TabsTrigger>
					<TabsTrigger value="proposals">Proposals</TabsTrigger>
					<TabsTrigger value="quotations">Quotations</TabsTrigger>
					<TabsTrigger value="contracts">Contracts</TabsTrigger>
					<TabsTrigger value="activity">Activity Log</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<OverviewTab lead={lead} />
				</TabsContent>

				<TabsContent value="meetings">
					<div className="pt-4 space-y-4">
						<PolyMeetingForm
							modelType="lead"
							modelId={lead.id}
						/>
						<MeetingsList
							modelType="lead"
							modelId={lead.id}
						/>
					</div>
				</TabsContent>

				<TabsContent value="proposals">
					<LeadProposalsTab leadId={lead.id} />
				</TabsContent>

				<TabsContent value="quotations">
					<LeadQuotationsTab leadId={lead.id} />
				</TabsContent>

				<TabsContent value="contracts">
					<LeadContractsTab leadId={lead.id} />
				</TabsContent>

				<TabsContent value="activity">
					<LeadActivityTab
						currentStage={lead.stage}
						leadId={lead.id}
						createdAt={lead.createdAt}
						updatedAt={lead.updatedAt}
					/>
				</TabsContent>
			</Tabs>

			{/* ── Stage modal (reuses pipeline engine) ─────────────────────── */}
			{activeModal && pendingDrag && (
				<StageModal
					item={activeModal}
					onSubmit={handleModalSubmit}
					onCancel={cancelDrag}
					isLoading={isAdvancing}
				/>
			)}
		</div>
	);
}
