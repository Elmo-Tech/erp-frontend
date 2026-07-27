"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApplyWorkflowTemplate, useCreateWorkflowTemplate, useUpdateProjectWorkflow, useWorkflowTemplates } from "../../hooks/useProjectPipeline";
import type { EditableWorkflowStage, ProjectWorkflowStage, WorkflowStageCategory } from "../../types/pipeline";

const categories: Array<{ value: WorkflowStageCategory; label: string }> = [
	{ value: "backlog", label: "Backlog" },
	{ value: "planned", label: "Planned" },
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused / Hold" },
	{ value: "review", label: "Review" },
	{ value: "done", label: "Done" },
	{ value: "cancelled", label: "Cancelled" },
];

interface WorkflowSettingsDialogProps {
	projectId: number;
	stages: ProjectWorkflowStage[];
	canManageTemplates: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function WorkflowSettingsDialog({ projectId, stages, canManageTemplates, open, onOpenChange }: WorkflowSettingsDialogProps) {
	const [draft, setDraft] = useState<EditableWorkflowStage[]>(() =>
		stages.map((stage) => ({
			stageId: stage.stageId,
			name: stage.name,
			slug: stage.slug,
			color: stage.color,
			category: stage.category,
			isTerminal: stage.isTerminal,
		}))
	);
	const [templateId, setTemplateId] = useState("");
	const [templateName, setTemplateName] = useState("");
	const updateWorkflow = useUpdateProjectWorkflow(projectId);
	const applyTemplate = useApplyWorkflowTemplate(projectId);
	const createTemplate = useCreateWorkflowTemplate();
	const templates = useWorkflowTemplates(open);

	const patchStage = (index: number, patch: Partial<EditableWorkflowStage>) => {
		setDraft((current) => current.map((stage, stageIndex) => stageIndex === index ? { ...stage, ...patch } : stage));
	};

	const move = (index: number, direction: -1 | 1) => {
		const target = index + direction;
		if (target < 0 || target >= draft.length) return;
		setDraft((current) => {
			const next = [...current];
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});
	};

	const addStage = () => {
		const suffix = Date.now().toString(36);
		setDraft((current) => [
			...current,
			{
				name: "New Stage",
				slug: `custom_${suffix}`,
				color: "#64748b",
				category: "planned",
				isTerminal: false,
			},
		]);
	};

	const save = async () => {
		try {
			await updateWorkflow.mutateAsync(draft);
			toast.success("Project workflow updated");
			onOpenChange(false);
		} catch {
			toast.error("Could not update the workflow. Stages containing tasks cannot be removed.");
		}
	};

	const apply = async () => {
		if (!templateId) return;
		try {
			await applyTemplate.mutateAsync(Number(templateId));
			toast.success("Workflow template applied");
			onOpenChange(false);
		} catch {
			toast.error("Templates can only replace a pipeline before tasks are created");
		}
	};

	const saveTemplate = async () => {
		if (!templateName.trim()) return;
		try {
			await createTemplate.mutateAsync({ name: templateName.trim(), stages: draft });
			toast.success("Reusable workflow template created");
			setTemplateName("");
		} catch {
			toast.error("Could not create the workflow template");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Project workflow</DialogTitle>
					<DialogDescription>These stages belong to this project. Templates copy stages into a project instead of linking all projects to one mutable list.</DialogDescription>
				</DialogHeader>

				<div className="space-y-3">
					{draft.map((stage, index) => (
						<div key={stage.stageId ?? stage.slug} className="grid gap-3 border-b pb-3 md:grid-cols-[48px_1fr_150px_90px_100px] md:items-end">
							<Input aria-label={`${stage.name} color`} type="color" className="h-10 p-1" value={stage.color} onChange={(event) => patchStage(index, { color: event.target.value })} />
							<div className="space-y-1">
								<Label htmlFor={`workflow-stage-${index}`}>Stage name</Label>
								<Input id={`workflow-stage-${index}`} value={stage.name} onChange={(event) => patchStage(index, { name: event.target.value })} />
							</div>
							<Select value={stage.category} onValueChange={(value) => patchStage(index, { category: value as WorkflowStageCategory })}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									{categories.map((category) => <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>)}
								</SelectContent>
							</Select>
							<label className="flex h-10 items-center gap-2 text-sm">
								<Checkbox checked={stage.isTerminal} onCheckedChange={(checked) => patchStage(index, { isTerminal: checked === true })} />
								Terminal
							</label>
							<div className="flex">
								<Button type="button" variant="ghost" size="icon" aria-label={`Move ${stage.name} up`} onClick={() => move(index, -1)} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
								<Button type="button" variant="ghost" size="icon" aria-label={`Move ${stage.name} down`} onClick={() => move(index, 1)} disabled={index === draft.length - 1}><ArrowDown className="h-4 w-4" /></Button>
								<Button type="button" variant="ghost" size="icon" aria-label={`Remove ${stage.name}`} onClick={() => setDraft((current) => current.filter((_, stageIndex) => stageIndex !== index))} disabled={draft.length <= 2}><Trash2 className="h-4 w-4" /></Button>
							</div>
						</div>
					))}
					<Button type="button" variant="outline" onClick={addStage}><Plus className="mr-2 h-4 w-4" />Add stage</Button>
				</div>

				<div className="grid gap-4 border-t pt-5 md:grid-cols-2">
					<div className="space-y-2">
						<Label>Apply an existing template</Label>
						<div className="flex gap-2">
							<Select value={templateId} onValueChange={setTemplateId}>
								<SelectTrigger><SelectValue placeholder="Choose template" /></SelectTrigger>
								<SelectContent>
									{templates.data?.map((template) => <SelectItem key={template.templateId} value={String(template.templateId)}>{template.name}</SelectItem>)}
								</SelectContent>
							</Select>
							<Button type="button" variant="outline" onClick={apply} disabled={!templateId || applyTemplate.isPending}>Apply</Button>
						</div>
					</div>

					{canManageTemplates && (
						<div className="space-y-2">
							<Label htmlFor="workflow-template-name">Save current stages as template</Label>
							<div className="flex gap-2">
								<Input id="workflow-template-name" value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="Template name" />
								<Button type="button" variant="outline" onClick={saveTemplate} disabled={!templateName.trim() || createTemplate.isPending}>Save</Button>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
					<Button type="button" onClick={save} disabled={draft.some((stage) => !stage.name.trim()) || updateWorkflow.isPending}>
						{updateWorkflow.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save workflow
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
