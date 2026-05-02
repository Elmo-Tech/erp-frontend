"use client";

/**
 * StageModal — Orchestrates per-stage modals.
 *
 * Meeting stage  → 2-tab layout: "Schedule Meeting" | "Skip"
 *                  Uses MeetingScheduleTab (replicates Client module form).
 *
 * All other stages → 3-tab layout: "Task" | "Direct Upload" | "Skip"
 *   • proposal  → ProposalDirectUploadTab  + proposalStageModalSchema
 *   • quotation → QuotationDirectUploadTab + quotationStageModalSchema
 *   • contract  → ContractDirectUploadTab  + contractStageModalSchema
 *   • (fallback)→ DirectUploadTab          + genericStageModalSchema
 *
 * Scroll fix: DialogContent uses flex-col + max-h. Tab content areas are
 * wrapped in ScrollArea so the footer buttons are always visible.
 */

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { STAGE_LABELS } from "../../model/pipelineConstants";
import type { ModalQueueItem, StageModalPayload } from "../../model/types";
import {
	genericStageModalSchema,
	meetingStageModalSchema,
	proposalStageModalSchema,
	quotationStageModalSchema,
	contractStageModalSchema,
	type GenericStageModalValues,
	type MeetingStageModalValues,
	type ProposalStageModalValues,
	type QuotationStageModalValues,
	type ContractStageModalValues,
} from "./stageModal.schema";
import { TaskTab } from "./TaskTab";
import { DirectUploadTab } from "./DirectUploadTab";
import { MeetingScheduleTab } from "./MeetingScheduleTab";
import { ProposalDirectUploadTab } from "./ProposalDirectUploadTab";
import { QuotationDirectUploadTab } from "./QuotationDirectUploadTab";
import { ContractDirectUploadTab } from "./ContractDirectUploadTab";
import { SkipTab } from "./SkipTab";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type AnyModalValues = GenericStageModalValues | MeetingStageModalValues | ProposalStageModalValues | QuotationStageModalValues | ContractStageModalValues;

type NonMeetingModalValues = GenericStageModalValues | ProposalStageModalValues | QuotationStageModalValues | ContractStageModalValues;

interface StageModalProps {
	item: ModalQueueItem;
	onSubmit: (payload: StageModalPayload) => void;
	onCancel: () => void;
	isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function schemaForStage(stage: ModalQueueItem["stage"]) {
	if (stage === "meeting") return meetingStageModalSchema;
	if (stage === "proposal") return proposalStageModalSchema;
	if (stage === "quotation") return quotationStageModalSchema;
	if (stage === "contract") return contractStageModalSchema;
	return genericStageModalSchema;
}

function defaultValuesForStage(stage: ModalQueueItem["stage"], isSkipOnly: boolean): Record<string, unknown> {
	// Meeting uses "schedule" as its primary mode (not "task")
	if (stage === "meeting") {
		return {
			mode: isSkipOnly ? "skip" : "schedule",
			meeting_type: "discovery",
			date: "",
			time: "10:00",
			location_type: "online",
			location_details: "",
			internal_attendees: [],
			external_attendees: [],
		};
	}

	const mode = isSkipOnly ? "skip" : "task";

	if (stage === "proposal") {
		return { mode, proposal_source: "upload_new", validity_date: "" };
	}

	if (stage === "quotation") {
		return { mode, payment_stages: [] };
	}

	if (stage === "contract") {
		return {
			mode,
			contract_model: "standard",
			source_code_handover: false,
			apply_promo: false,
			payment_stages: [],
			addons: [],
		};
	}

	return { mode };
}

// ─────────────────────────────────────────────────────────────────────────────
// Meeting modal — isolated 2-tab render
// ─────────────────────────────────────────────────────────────────────────────

interface MeetingStageModalProps {
	item: ModalQueueItem;
	onSubmit: (payload: StageModalPayload) => void;
	onCancel: () => void;
	isLoading?: boolean;
}

function MeetingStageModal({ item, onSubmit, onCancel, isLoading = false }: MeetingStageModalProps) {
	const isSkipOnly = item.isIntermediateSkip;

	const form = useForm<MeetingStageModalValues>({
		defaultValues: defaultValuesForStage("meeting", isSkipOnly) as MeetingStageModalValues,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(meetingStageModalSchema as any),
	});

	const currentMode = (form.watch("mode") ?? (isSkipOnly ? "skip" : "schedule")) as "schedule" | "skip";

	useEffect(() => {
		form.reset(defaultValuesForStage("meeting", isSkipOnly) as MeetingStageModalValues);
	}, [isSkipOnly]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleTabChange = (value: string) => {
		form.reset({
			...defaultValuesForStage("meeting", isSkipOnly),
			mode: value,
		} as MeetingStageModalValues);
	};

	const handleSubmit = form.handleSubmit((rawData) => {
		const data = rawData as Record<string, unknown> & { mode: string };

		if (data.mode === "skip") {
			onSubmit({
				mode: "skip",
				skipReason: data.skipReason as GenericStageModalValues extends { mode: "skip" } ? GenericStageModalValues["skipReason"] : never,
				notes: data.skipNotes as string | undefined,
			});
			return;
		}

		// schedule mode — pass all meeting fields through
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onSubmit(data as any);
	});

	const submitLabel = currentMode === "skip" ? "Skip Stage" : "Schedule Meeting";

	return (
		<Dialog
			open
			onOpenChange={(open) => !open && onCancel()}
		>
			<DialogContent className="flex flex-col max-h-[90vh] max-w-2xl! w-full">
				<DialogHeader className="shrink-0">
					<DialogTitle>{isSkipOnly ? "Skip: Meeting" : "Schedule Meeting"}</DialogTitle>
					<DialogDescription>{isSkipOnly ? 'This stage was skipped. Please provide a reason for skipping "Meeting".' : "Schedule a meeting with the lead or skip this stage with a reason."}</DialogDescription>
				</DialogHeader>

				<FormProvider {...form}>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col flex-1 min-h-0"
					>
						<Tabs
							value={currentMode}
							onValueChange={handleTabChange}
							className="flex flex-col flex-1 min-h-0 w-full"
						>
							{/* Tab triggers */}
							<TabsList className="w-full shrink-0">
								{!isSkipOnly && (
									<TabsTrigger
										value="schedule"
										className="flex-1"
									>
										Schedule Meeting
									</TabsTrigger>
								)}
								<TabsTrigger
									value="skip"
									className="flex-1"
								>
									Skip
								</TabsTrigger>
							</TabsList>

							{/* Schedule tab */}
							{!isSkipOnly && (
								<TabsContent
									value="schedule"
									className="mt-4 flex-1 overflow-hidden"
								>
									<ScrollArea className="h-full max-h-[55vh] pr-3">
										<MeetingScheduleTab />
									</ScrollArea>
								</TabsContent>
							)}

							{/* Skip tab */}
							<TabsContent
								value="skip"
								className="mt-4 flex-1 overflow-hidden"
							>
								<ScrollArea className="h-full max-h-[55vh] pr-3">
									<SkipTab />
								</ScrollArea>
							</TabsContent>
						</Tabs>

						{/* Fixed footer */}
						<DialogFooter className="shrink-0 gap-2 pt-4 mt-2 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
							>
								{isLoading ? "Saving…" : submitLabel}
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic 3-tab modal (proposal / quotation / contract / fallback)
// ─────────────────────────────────────────────────────────────────────────────

function GenericStageModal({ item, onSubmit, onCancel, isLoading = false }: StageModalProps) {
	const stageLabel = STAGE_LABELS[item.stage];
	const isSkipOnly = item.isIntermediateSkip;
	const isComplexStage = item.stage === "proposal" || item.stage === "quotation" || item.stage === "contract";

	const form = useForm<NonMeetingModalValues>({
		defaultValues: defaultValuesForStage(item.stage, isSkipOnly) as NonMeetingModalValues,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(schemaForStage(item.stage) as any),
	});

	const currentMode = (form.watch("mode") ?? (isSkipOnly ? "skip" : "task")) as "task" | "direct_upload" | "skip";

	useEffect(() => {
		form.reset(defaultValuesForStage(item.stage, isSkipOnly) as NonMeetingModalValues);
	}, [item.stage, isSkipOnly]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleTabChange = (value: string) => {
		form.reset({
			...defaultValuesForStage(item.stage, isSkipOnly),
			mode: value,
		} as NonMeetingModalValues);
	};

	const handleSubmit = form.handleSubmit((rawData) => {
		const data = rawData as Record<string, unknown> & { mode: string };

		if (data.mode === "task") {
			onSubmit({
				mode: "task",
				assignedTo: data.assignedTo as number,
				deadline: data.deadline as string,
				notes: data.taskNotes as string | undefined,
			});
			return;
		}

		if (data.mode === "skip") {
			onSubmit({
				mode: "skip",
				skipReason: data.skipReason as GenericStageModalValues extends { mode: "skip" } ? GenericStageModalValues["skipReason"] : never,
				notes: data.skipNotes as string | undefined,
			});
			return;
		}

		// direct_upload — shape depends on stage
		if (item.stage === "proposal") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onSubmit(data as any);
			return;
		}

		if (item.stage === "quotation") {
			onSubmit({
				mode: "direct_upload",
				upload_file: data.upload_file as File,
				base_price: data.base_price as number,
				commission_type: data.commission_type as QuotationStageModalValues extends {
					mode: "direct_upload";
				}
					? QuotationStageModalValues["commission_type"]
					: never,
				currency: data.currency as QuotationStageModalValues extends {
					mode: "direct_upload";
				}
					? QuotationStageModalValues["currency"]
					: never,
				final_total: data.final_total as number,
				payment_stages: data.payment_stages as QuotationStageModalValues extends {
					mode: "direct_upload";
				}
					? QuotationStageModalValues["payment_stages"]
					: never,
				notes: data.notes as string | undefined,
			});
			return;
		}

		if (item.stage === "contract") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onSubmit(data as any);
			return;
		}

		// Generic fallback
		onSubmit({
			mode: "direct_upload",
			upload_file: data.upload_file as File,
			notes: data.notes as string | undefined,
		});
	});

	const submitLabel = currentMode === "skip" ? "Skip Stage" : currentMode === "direct_upload" ? "Upload & Continue" : "Create Task & Continue";

	const DirectUploadContent = item.stage === "proposal" ? <ProposalDirectUploadTab /> : item.stage === "quotation" ? <QuotationDirectUploadTab /> : item.stage === "contract" ? <ContractDirectUploadTab /> : <DirectUploadTab />;

	return (
		<Dialog
			open
			onOpenChange={(open) => !open && onCancel()}
		>
			<DialogContent className={`flex flex-col max-h-[90vh] ${isComplexStage ? "max-w-2xl w-full" : "max-w-lg w-full"}`}>
				<DialogHeader className="shrink-0">
					<DialogTitle>{isSkipOnly ? `Skip: ${stageLabel}` : stageLabel}</DialogTitle>
					<DialogDescription>
						{isSkipOnly ? `This stage was skipped. Please provide a reason for skipping "${stageLabel}".` : `Complete the "${stageLabel}" stage by creating a task, uploading a document, or skipping with a reason.`}
					</DialogDescription>
				</DialogHeader>

				<FormProvider {...form}>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col flex-1 min-h-0"
					>
						<Tabs
							value={currentMode}
							onValueChange={handleTabChange}
							className="flex flex-col flex-1 min-h-0 w-full"
						>
							{/* Tab triggers */}
							<TabsList className="w-full shrink-0">
								{!isSkipOnly && (
									<>
										<TabsTrigger
											value="task"
											className="flex-1"
										>
											Task
										</TabsTrigger>
										<TabsTrigger
											value="direct_upload"
											className="flex-1"
										>
											Direct Upload
										</TabsTrigger>
									</>
								)}
								<TabsTrigger
									value="skip"
									className="flex-1"
								>
									Skip
								</TabsTrigger>
							</TabsList>

							{!isSkipOnly && (
								<>
									<TabsContent
										value="task"
										className="mt-4 flex-1 overflow-hidden"
									>
										<ScrollArea className="h-full max-h-[55vh] pr-3">
											<TaskTab />
										</ScrollArea>
									</TabsContent>

									<TabsContent
										value="direct_upload"
										className="mt-4 flex-1 overflow-hidden"
									>
										<ScrollArea className="h-full max-h-[55vh] overflow-scroll pr-3">{DirectUploadContent}</ScrollArea>
									</TabsContent>
								</>
							)}

							<TabsContent
								value="skip"
								className="mt-4 flex-1 overflow-hidden"
							>
								<ScrollArea className="h-full max-h-[55vh] pr-3">
									<SkipTab />
								</ScrollArea>
							</TabsContent>
						</Tabs>

						{/* Fixed footer */}
						<DialogFooter className="shrink-0 gap-2 pt-4 mt-2 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
							>
								{isLoading ? "Saving…" : submitLabel}
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public entry point — routes to the correct modal variant
// ─────────────────────────────────────────────────────────────────────────────

export function StageModal(props: StageModalProps) {
	if (props.item.stage === "meeting") {
		return <MeetingStageModal {...props} />;
	}
	return <GenericStageModal {...props} />;
}
