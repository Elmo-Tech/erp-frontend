"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
	EXECUTION_TASK_STATUS_OPTIONS,
	useApplyWorkflowTemplate,
	useCreateWorkflowTemplate,
	useUpdateProjectWorkflow,
	useWorkflowTemplates,
	type ExecutionTaskStatusValue,
	type ProjectWorkflowStage,
	type WorkflowStagePayload,
} from "@/features/projects/api/execution.api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";

interface ProjectWorkflowSettingsDialogProps {
	projectId: number;
	stages: ProjectWorkflowStage[];
	canManage: boolean;
	canManageTemplates: boolean;
}

type StageDraft = WorkflowStagePayload & {
	taskCount: number;
};

export function ProjectWorkflowSettingsDialog({
	projectId,
	stages,
	canManage,
	canManageTemplates,
}: ProjectWorkflowSettingsDialogProps) {
	const [open, setOpen] = useState(false);
	const [drafts, setDrafts] = useState<StageDraft[]>(() => toDrafts(stages));
	const [templateId, setTemplateId] = useState("");
	const [templateName, setTemplateName] = useState("");
	const templatesQuery = useWorkflowTemplates(open && canManage);
	const updateWorkflow = useUpdateProjectWorkflow();
	const applyTemplate = useApplyWorkflowTemplate();
	const createTemplate = useCreateWorkflowTemplate();

	if (!canManage) return null;

	const save = async () => {
		try {
			await updateWorkflow.mutateAsync({
				projectId,
				stages: drafts.map(({ id, name, status, color, isTerminal }) => ({
					id,
					name,
					status,
					color,
					isTerminal,
				})),
			});
			toast.success("Project workflow updated.");
			setOpen(false);
		} catch {
			toast.error("Workflow could not be saved. Keep every required state and empty stages before deleting them.");
		}
	};

	const applySelectedTemplate = async () => {
		if (!templateId) return;
		try {
			await applyTemplate.mutateAsync({ projectId, templateId: Number(templateId) });
			toast.success("Workflow template applied.");
			setOpen(false);
		} catch {
			toast.error("Workflow template could not be applied.");
		}
	};

	const saveTemplate = async () => {
		if (!templateName.trim()) return;
		try {
			await createTemplate.mutateAsync({
				name: templateName.trim(),
				stages: drafts.map(({ name, status, color, isTerminal }) => ({
					name,
					status,
					color,
					isTerminal,
				})),
			});
			toast.success("Reusable workflow template created.");
			setTemplateName("");
		} catch {
			toast.error("Workflow template could not be created.");
		}
	};

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => {
					setDrafts(toDrafts(stages));
					setOpen(true);
				}}
			>
				<Settings2 className="size-4" />
				Workflow settings
			</Button>
			<FormDialog
				open={open}
				onOpenChange={setOpen}
				title="Project workflow"
				description="Rename, reorder, and colour the pipeline while keeping system states connected to timers, QA, and reports."
				size="xxxl"
				submitLabel="Save workflow"
				isLoading={updateWorkflow.isPending}
				onSubmit={save}
			>
				<div className="rounded-2xl border bg-muted/20 p-4">
					<Label className="mb-2 block">Apply a reusable template</Label>
					<div className="flex gap-2">
						<Select
							value={templateId}
							onValueChange={setTemplateId}
						>
							<SelectTrigger className="min-w-72 flex-1">
								<SelectValue placeholder={templatesQuery.isLoading ? "Loading templates…" : "Select template"} />
							</SelectTrigger>
							<SelectContent>
								{(templatesQuery.data ?? []).map((template) => (
									<SelectItem
										key={template.templateId}
										value={String(template.templateId)}
									>
										{template.name}
										{template.isDefault ? " · Default" : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							type="button"
							variant="secondary"
							disabled={!templateId || applyTemplate.isPending}
							onClick={applySelectedTemplate}
						>
							Apply
						</Button>
					</div>
					{canManageTemplates && (
						<div className="mt-3 flex gap-2 border-t pt-3">
							<Input
								value={templateName}
								placeholder="New template name"
								onChange={(event) => setTemplateName(event.target.value)}
							/>
							<Button
								type="button"
								variant="outline"
								disabled={!templateName.trim() || createTemplate.isPending}
								onClick={saveTemplate}
							>
								Save current workflow as template
							</Button>
						</div>
					)}
				</div>

				<div className="space-y-3">
					{drafts.map((stage, index) => (
						<div
							key={stage.id ?? `new-${index}`}
							className="grid grid-cols-[52px_minmax(0,1fr)_180px_110px_96px] items-end gap-3 rounded-2xl border p-3"
						>
							<div>
								<Label className="text-xs">Colour</Label>
								<Input
									type="color"
									value={stage.color}
									className="mt-1 h-10 p-1"
									onChange={(event) => updateDraft(setDrafts, index, { color: event.target.value })}
								/>
							</div>
							<div>
								<Label className="text-xs">Stage name</Label>
								<Input
									value={stage.name}
									className="mt-1"
									onChange={(event) => updateDraft(setDrafts, index, { name: event.target.value })}
								/>
							</div>
							<div>
								<Label className="text-xs">System state</Label>
								<Select
									value={stage.status}
									onValueChange={(status: ExecutionTaskStatusValue) => updateDraft(setDrafts, index, { status })}
								>
									<SelectTrigger className="mt-1 w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{EXECUTION_TASK_STATUS_OPTIONS.map((status) => (
											<SelectItem
												key={status.value}
												value={status.value}
											>
												{status.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<label className="flex h-10 items-center gap-2 rounded-xl border px-3 text-sm">
								<input
									type="checkbox"
									checked={stage.isTerminal}
									onChange={(event) => updateDraft(setDrafts, index, { isTerminal: event.target.checked })}
								/>
								Terminal
							</label>
							<div className="flex justify-end gap-1">
								<IconButton
									label="Move stage up"
									disabled={index === 0}
									onClick={() => moveDraft(setDrafts, index, index - 1)}
								>
									<ArrowUp />
								</IconButton>
								<IconButton
									label="Move stage down"
									disabled={index === drafts.length - 1}
									onClick={() => moveDraft(setDrafts, index, index + 1)}
								>
									<ArrowDown />
								</IconButton>
								<IconButton
									label="Delete stage"
									disabled={stage.taskCount > 0}
									onClick={() => setDrafts((current) => current.filter((_, stageIndex) => stageIndex !== index))}
								>
									<Trash2 />
								</IconButton>
							</div>
						</div>
					))}
				</div>

				<Button
					type="button"
					variant="outline"
					onClick={() =>
						setDrafts((current) => [
							...current,
							{
								name: "New stage",
								status: "to_do",
								color: "#64748b",
								isTerminal: false,
								taskCount: 0,
							},
						])
					}
				>
					<Plus className="size-4" />
					Add stage
				</Button>
			</FormDialog>
		</>
	);
}

function toDrafts(stages: ProjectWorkflowStage[]): StageDraft[] {
	return stages.map((stage) => ({
		id: stage.stageId,
		name: stage.name,
		status: stage.status,
		color: stage.color,
		isTerminal: stage.isTerminal,
		taskCount: stage.taskCount ?? 0,
	}));
}

function updateDraft(
	setDrafts: React.Dispatch<React.SetStateAction<StageDraft[]>>,
	index: number,
	patch: Partial<StageDraft>,
) {
	setDrafts((current) => current.map((stage, stageIndex) => (stageIndex === index ? { ...stage, ...patch } : stage)));
}

function moveDraft(
	setDrafts: React.Dispatch<React.SetStateAction<StageDraft[]>>,
	from: number,
	to: number,
) {
	setDrafts((current) => {
		const next = [...current];
		const [stage] = next.splice(from, 1);
		next.splice(to, 0, stage);
		return next;
	});
}

function IconButton({
	label,
	disabled,
	onClick,
	children,
}: {
	label: string;
	disabled: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</Button>
	);
}
