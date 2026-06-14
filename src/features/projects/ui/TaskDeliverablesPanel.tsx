"use client";

import { useCallback, useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import type { TaskDeliverable } from "../api/execution.api";
import { useCreateDeliverable, useDeleteDeliverable, useToggleDeliverable, useUpdateDeliverable } from "../api/execution.api";

interface TaskDeliverablesPanelProps {
	deliverables: TaskDeliverable[];
	projectId: number;
	taskId: number;
	isDone: boolean;
	canToggleDeliverables: boolean;
	canManageDeliverableRecords: boolean;
}

interface DeliverableRowProps {
	deliverable: TaskDeliverable;
	projectId: number;
	taskId: number;
	disabled: boolean;
	canManage: boolean;
}

interface QuickAddFormProps {
	placeholder: string;
	onSubmit: (value: string, onSuccess: () => void) => void;
	isPending: boolean;
	disabled?: boolean;
}

function DeliverableRow({ deliverable, projectId, taskId, disabled, canManage }: DeliverableRowProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(deliverable.title);
	const toggleDeliverable = useToggleDeliverable();
	const updateDeliverable = useUpdateDeliverable();
	const deleteDeliverable = useDeleteDeliverable();

	const handleToggle = useCallback(() => {
		toggleDeliverable.mutate({ projectId, taskId, deliverableId: deliverable.deliverableId }, { onError: () => toast.error("Failed to update deliverable.") });
	}, [toggleDeliverable, projectId, taskId, deliverable.deliverableId]);

	const handleSave = useCallback(() => {
		const trimmedTitle = title.trim();
		if (!trimmedTitle) return;

		updateDeliverable.mutate(
			{ projectId, taskId, deliverableId: deliverable.deliverableId, title: trimmedTitle },
			{
				onSuccess: () => {
					toast.success("Deliverable updated.");
					setIsEditing(false);
				},
				onError: () => toast.error("Failed to update deliverable."),
			},
		);
	}, [deliverable.deliverableId, projectId, taskId, title, updateDeliverable]);

	const handleDelete = useCallback(() => {
		deleteDeliverable.mutate(
			{ projectId, taskId, deliverableId: deliverable.deliverableId },
			{
				onSuccess: () => toast.success("Deliverable deleted."),
				onError: () => toast.error("Failed to delete deliverable."),
			},
		);
	}, [deleteDeliverable, projectId, taskId, deliverable.deliverableId]);

	return (
		<div className={cn("flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50", deliverable.isCompleted && "opacity-60")}>
			<Checkbox
				id={`del-${deliverable.deliverableId}`}
				checked={deliverable.isCompleted}
				onCheckedChange={handleToggle}
				disabled={disabled || toggleDeliverable.isPending}
				className="mt-0.5 shrink-0"
			/>
			{isEditing ? (
				<form
					className="flex min-w-0 flex-1 items-center gap-2"
					onSubmit={(event) => {
						event.preventDefault();
						handleSave();
					}}
				>
					<Input
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						className="h-8 text-sm"
						disabled={updateDeliverable.isPending}
					/>
					<Button
						type="submit"
						size="sm"
						variant="outline"
						className="h-8"
						disabled={!title.trim() || updateDeliverable.isPending}
					>
						Save
					</Button>
				</form>
			) : (
				<label
					htmlFor={`del-${deliverable.deliverableId}`}
					className={cn("min-w-0 flex-1 cursor-pointer text-sm leading-snug", deliverable.isCompleted ? "text-muted-foreground line-through" : "text-foreground")}
				>
					{deliverable.title}
				</label>
			)}
			{canManage && !disabled && !isEditing && (
				<div className="ml-auto flex shrink-0 items-center gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => {
							setTitle(deliverable.title);
							setIsEditing(true);
						}}
					>
						<Pencil className="size-3.5" />
						<span className="sr-only">Edit deliverable</span>
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-7 w-7 text-destructive hover:text-destructive"
						disabled={deleteDeliverable.isPending}
						onClick={handleDelete}
					>
						<Trash2 className="size-3.5" />
						<span className="sr-only">Delete deliverable</span>
					</Button>
				</div>
			)}
		</div>
	);
}

function QuickAddForm({ placeholder, onSubmit, isPending, disabled }: QuickAddFormProps) {
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const trimmedValue = value.trim();
		if (!trimmedValue) return;
		onSubmit(trimmedValue, () => {
			setValue("");
			inputRef.current?.focus();
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex items-center gap-2 pt-2"
		>
			<Input
				ref={inputRef}
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder={placeholder}
				disabled={isPending || disabled}
				className="h-8 text-sm"
			/>
			<Button
				type="submit"
				size="sm"
				variant="outline"
				className="h-8 shrink-0 px-3"
				disabled={isPending || !value.trim() || disabled}
			>
				{isPending ? <span className="text-xs">Adding…</span> : <Plus className="size-3.5" />}
				<span className="sr-only">Add deliverable</span>
			</Button>
		</form>
	);
}

export function TaskDeliverablesPanel({ deliverables, projectId, taskId, isDone, canToggleDeliverables, canManageDeliverableRecords }: TaskDeliverablesPanelProps) {
	const createDeliverable = useCreateDeliverable();
	const totalDeliverables = deliverables.length;
	const completedDeliverables = deliverables.filter((deliverable) => deliverable.isCompleted).length;
	const allDeliverablesDone = totalDeliverables === 0 || completedDeliverables === totalDeliverables;

	const handleAddDeliverable = useCallback(
		(title: string, onSuccess: () => void) => {
			createDeliverable.mutate(
				{ projectId, taskId, title },
				{
					onSuccess: () => {
						toast.success("Deliverable added.");
						onSuccess();
					},
					onError: () => toast.error("Failed to add deliverable."),
				},
			);
		},
		[createDeliverable, projectId, taskId],
	);

	return (
		<div>
			<div className="mb-3 flex items-center justify-between">
				<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deliverables</h4>
				{totalDeliverables > 0 && (
					<span className={cn("text-xs tabular-nums", allDeliverablesDone ? "text-emerald-600" : "text-muted-foreground")}>
						{completedDeliverables}/{totalDeliverables} done
					</span>
				)}
			</div>

			{totalDeliverables > 0 ? (
				<div className="flex flex-col divide-y rounded-md border">
					{deliverables.map((deliverable) => (
						<DeliverableRow
							key={deliverable.deliverableId}
							deliverable={deliverable}
							projectId={projectId}
							taskId={taskId}
							disabled={isDone || !canToggleDeliverables}
							canManage={canManageDeliverableRecords}
						/>
					))}
				</div>
			) : (
				<div className="flex min-h-14 items-center justify-center rounded-md border border-dashed">
					<p className="text-xs text-muted-foreground">No deliverables yet.</p>
				</div>
			)}

			{!isDone && canManageDeliverableRecords && (
				<QuickAddForm
					placeholder="Add a deliverable…"
					onSubmit={handleAddDeliverable}
					isPending={createDeliverable.isPending}
				/>
			)}
		</div>
	);
}
