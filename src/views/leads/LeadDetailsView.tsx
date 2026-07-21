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
import { ArrowLeft, Building2, Mail, Phone, DollarSign, Calendar, ChevronRight, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Skeleton } from "@/shared/ui/skeleton";
import { Separator } from "@/shared/ui/separator";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { cn } from "@/shared/lib/utils";
import { getLead, useConvertLeadToProject, useDeleteLead, useUpdateLeadStage } from "@/features/leads/api/leads.api";
import { usePipelineStore } from "@/features/leads/model/usePipelineStore";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import { getPipelineStageGateFailure } from "@/features/leads/model/pipelineGates";
import { getPipelinePermissionFailure } from "@/features/leads/model/pipeline-permission-gates";
import type { PipelineStage } from "@/features/leads/model/pipelineConstants";
import type { Lead, StageModalPayload, StageModalResult } from "@/features/leads/model/types";
import { StageModal } from "@/features/leads/ui/PipelineModals/StageModal";
import { STAGE_COLORS, InfoRow, PipelineProgress, ActivityTimeline } from "@/features/leads/ui/LeadInfoRow";
import { MeetingsList } from "@/entities/meetings/ui/MeetingsList";
import { PolyMeetingForm } from "@/features/meetings/ui/PolyMeetingForm";
import { LeadProposalsTab } from "@/views/leads/tabs/LeadProposalsTab";
import { LeadQuotationsTab } from "@/views/leads/tabs/LeadQuotationsTab";
import { LeadContractsTab } from "@/views/leads/tabs/LeadContractsTab";
import { useSalesPermissions } from "@/entities/user/model/permissions";

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
// Stage Stepper — advances the lead through the pipeline
// ─────────────────────────────────────────────────────────────────────────────

interface StageStepperProps {
	currentStage: PipelineStage;
	onAdvance: (toStage: PipelineStage) => void;
	isAdvancing: boolean;
	canAdvanceTo: (toStage: PipelineStage) => boolean;
}

function StageStepper({ currentStage, onAdvance, isAdvancing, canAdvanceTo }: StageStepperProps) {
	const currentIdx = PIPELINE_STAGES.indexOf(currentStage);

	return (
		<div className="flex items-center gap-1 flex-wrap">
			{PIPELINE_STAGES.map((stage, idx) => {
				const isCompleted = idx < currentIdx;
				const isCurrent = idx === currentIdx;
				const isNext = idx === currentIdx + 1;
				const canAdvance = isNext && canAdvanceTo(stage);
				const isLast = idx === PIPELINE_STAGES.length - 1;

				return (
					<div
						key={stage}
						className="flex items-center gap-1"
					>
						<button
							type="button"
							disabled={!canAdvance || isAdvancing}
							onClick={() => canAdvance && onAdvance(stage)}
							className={cn(
								"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
								isCompleted && "bg-emerald-100 text-emerald-700 cursor-default",
								isCurrent && "bg-primary text-primary-foreground shadow-sm cursor-default",
								canAdvance && !isAdvancing && "bg-muted hover:bg-primary/10 hover:text-primary border border-dashed border-primary/40 cursor-pointer",
								isNext && (!canAdvance || isAdvancing) && "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
								!isCompleted && !isCurrent && !isNext && "bg-muted/50 text-muted-foreground/50 cursor-default",
							)}
							title={canAdvance ? `Advance to ${STAGE_LABELS[stage]}` : undefined}
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
// Overview tab — matches the Kanban sheet layout exactly
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ lead }: { lead: Lead }) {
	return (
		<div className="pt-4 space-y-6">
			{/* Contact info — same InfoRow pattern as the sheet */}
			<div className="rounded-xl border bg-card p-5 space-y-4">
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
						icon={DollarSign}
						label="Expected Budget"
						value={
							lead.expectedBudget != null
								? lead.expectedBudget.toLocaleString(undefined, {
										style: "currency",
										currency: "USD",
										maximumFractionDigits: 0,
									})
								: null
						}
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

			{/* Pipeline progress — same dots + lines as the sheet */}
			<PipelineProgress currentStage={lead.stage} />

			<Separator />

			{/* Activity timeline — same circles + connectors as the sheet */}
			<div className="space-y-3">
				<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stage History</p>
				<ActivityTimeline currentStage={lead.stage} />
			</div>

			<div className="pt-2">
				<p className="text-xs text-muted-foreground/60">Lead #{lead.id}</p>
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
	const {
		canEditLeads,
		canDeleteLeads,
		canConvertLeads,
		canViewQuotations,
		canCreateQuotations,
		canEditQuotations,
		canDeleteQuotations,
		canCalculateQuotations,
		canViewContracts,
		canCreateContracts,
		canEditContracts,
		canDeleteContracts,
		canSignContracts,
	} = useSalesPermissions();
	const canAccessQuotations = canViewQuotations || canCreateQuotations || canEditQuotations || canDeleteQuotations || canCalculateQuotations;
	const canAccessContracts = canViewContracts || canCreateContracts || canEditContracts || canDeleteContracts || canSignContracts;
	const router = useRouter();
	const updateLeadStageMutation = useUpdateLeadStage();
	const convertLeadToProjectMutation = useConvertLeadToProject();
	const deleteLeadMutation = useDeleteLead();
	const [lead, setLead] = useState<Lead | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAdvancing, setIsAdvancing] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	// Pipeline store — reuse the same interceptor engine
	const startDrag = usePipelineStore((s) => s.startDrag);
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
					hasCompletedMeeting: res.data.hasCompletedMeeting ?? false,
					hasAcceptedProposalOrQuotation: res.data.hasAcceptedProposalOrQuotation ?? false,
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
			const permissionFailure = getPipelinePermissionFailure(lead?.stage ?? toStage, toStage, {
				canEditLeads,
				canConvertLeads,
				canCreateQuotations,
				canCreateContracts,
			});
			if (permissionFailure) {
				toast.error(permissionFailure);
				cancelDrag();
				return;
			}

			setIsAdvancing(true);
			try {
				await updateLeadStageMutation.mutateAsync({ leadId, newStage: toStage, stageResults: results });

				if (toStage === "closed_won") {
					try {
						const result = await convertLeadToProjectMutation.mutateAsync(leadId);
						const { project_title, client_name } = result.data;
						toast.success(`🎉 Deal Won! "${project_title}" is now live.`, {
							description: `Client "${client_name}" created.`,
							duration: 6000,
						});
						window.location.href = "/dashboard/clients";
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
					setLead((prev) =>
						prev
							? {
									...prev,
									stage,
									hasCompletedMeeting: res.data.hasCompletedMeeting ?? false,
									hasAcceptedProposalOrQuotation: res.data.hasAcceptedProposalOrQuotation ?? false,
									updatedAt: res.data.updatedAt,
								}
							: prev,
					);
				}
			} catch (err) {
				console.error("[LeadDetailsView] Stage update failed:", err);
				toast.error("Failed to update lead stage.");
				cancelDrag();
			} finally {
				setIsAdvancing(false);
			}
		},
		[canConvertLeads, canCreateContracts, canCreateQuotations, canEditLeads, lead, leadId, cancelDrag, convertLeadToProjectMutation, updateLeadStageMutation],
	);

	// ── Stepper advance handler ───────────────────────────────────────────────
	const handleAdvance = useCallback(
		(toStage: PipelineStage) => {
			if (!lead) return;
			const permissionFailure = getPipelinePermissionFailure(lead.stage, toStage, {
				canEditLeads,
				canConvertLeads,
				canCreateQuotations,
				canCreateContracts,
			});
			if (permissionFailure) {
				toast.error(permissionFailure);
				return;
			}

			const gateFailure = getPipelineStageGateFailure(lead, toStage);
			if (gateFailure) {
				toast.error(gateFailure);
				return;
			}

			const intercepted = startDrag(lead.id, lead.stage, toStage);
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
		[canConvertLeads, canCreateContracts, canCreateQuotations, canEditLeads, lead, startDrag, commitStageUpdate],
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

	const handleDelete = async () => {
		if (!canDeleteLeads) return;
		try {
			await deleteLeadMutation.mutateAsync(leadId);
			toast.success("Lead deleted");
			router.push("/dashboard/leads");
		} catch {
			toast.error("Failed to delete lead");
		}
	};

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
								className={cn("shrink-0 border", STAGE_COLORS[lead.stage])}
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
					{canDeleteLeads && (
						<Button
							variant="ghost"
							size="icon"
							className="shrink-0 text-destructive hover:text-destructive"
							onClick={() => setDeleteDialogOpen(true)}
						>
							<Trash2 className="size-4" />
							<span className="sr-only">Delete lead</span>
						</Button>
					)}
				</div>

				{/* Stage stepper */}
				<div className="pl-11">
					<StageStepper
						currentStage={lead.stage}
						onAdvance={handleAdvance}
						isAdvancing={isAdvancing}
						canAdvanceTo={(stage) =>
							getPipelinePermissionFailure(lead.stage, stage, {
								canEditLeads,
								canConvertLeads,
								canCreateQuotations,
								canCreateContracts,
							}) === null
						}
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
					{canAccessQuotations && <TabsTrigger value="quotations">Quotations</TabsTrigger>}
					{canAccessContracts && <TabsTrigger value="contracts">Contracts</TabsTrigger>}
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

				{canAccessQuotations && (
					<TabsContent value="quotations">
						<LeadQuotationsTab leadId={lead.id} />
					</TabsContent>
				)}

				{canAccessContracts && (
					<TabsContent value="contracts">
						<LeadContractsTab leadId={lead.id} />
					</TabsContent>
				)}
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

			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Lead"
				description="Delete this lead? This action cannot be undone."
				confirmLabel="Delete"
				variant="destructive"
				isLoading={deleteLeadMutation.isPending}
				onConfirm={handleDelete}
			/>
		</div>
	);
}
