"use client";

import { AlertCircle, CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { SheetFooter } from "@/shared/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TaskExecutionAction } from "../model/task-execution-rules";

interface TaskExecutionFooterProps {
	primaryAction: TaskExecutionAction | null;
	isDone: boolean;
	allDeliverablesDone: boolean;
	remainingDeliverables: number;
	isSaving: boolean;
	onPrimaryAction: () => void;
}

interface PrimaryActionFooterProps {
	action: TaskExecutionAction;
	allDeliverablesDone: boolean;
	remainingDeliverables: number;
	isSaving: boolean;
	onPrimaryAction: () => void;
}

function BlockedPrimaryAction({ action, remainingDeliverables }: { action: TaskExecutionAction; remainingDeliverables: number }) {
	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="w-full">
						<Button
							className="w-full"
							size="lg"
							disabled
							aria-disabled="true"
						>
							<AlertCircle className="size-4" />
							{action.label}
						</Button>
					</span>
				</TooltipTrigger>
				<TooltipContent side="top">
					Complete all {remainingDeliverables} remaining deliverable
					{remainingDeliverables !== 1 ? "s" : ""} first
				</TooltipContent>
			</Tooltip>
			<div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
				<Circle className="size-3" />
				<span>
					{remainingDeliverables} deliverable
					{remainingDeliverables !== 1 ? "s" : ""} still pending
				</span>
			</div>
		</>
	);
}

function PrimaryActionButton({ action, isSaving, onPrimaryAction }: { action: TaskExecutionAction; isSaving: boolean; onPrimaryAction: () => void }) {
	return (
		<Button
			className="w-full"
			size="lg"
			onClick={onPrimaryAction}
			disabled={isSaving}
		>
			<CheckCircle2 className="size-4" />
			{isSaving ? "Saving…" : action.label}
		</Button>
	);
}

function PrimaryActionFooter({ action, allDeliverablesDone, remainingDeliverables, isSaving, onPrimaryAction }: PrimaryActionFooterProps) {
	return (
		<SheetFooter className="border-t px-6 py-4 shrink-0">
			{action.requiresAllDeliverables && !allDeliverablesDone ? (
				<BlockedPrimaryAction
					action={action}
					remainingDeliverables={remainingDeliverables}
				/>
			) : (
				<PrimaryActionButton
					action={action}
					isSaving={isSaving}
					onPrimaryAction={onPrimaryAction}
				/>
			)}
		</SheetFooter>
	);
}

function CompletedTaskFooter() {
	return (
		<SheetFooter className="border-t px-6 py-4 shrink-0">
			<div className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
				<CheckCircle2 className="size-4" />
				Task completed
			</div>
		</SheetFooter>
	);
}

export function TaskExecutionFooter({ primaryAction, isDone, allDeliverablesDone, remainingDeliverables, isSaving, onPrimaryAction }: TaskExecutionFooterProps) {
	if (primaryAction) {
		return (
			<PrimaryActionFooter
				action={primaryAction}
				allDeliverablesDone={allDeliverablesDone}
				remainingDeliverables={remainingDeliverables}
				isSaving={isSaving}
				onPrimaryAction={onPrimaryAction}
			/>
		);
	}

	if (isDone) {
		return <CompletedTaskFooter />;
	}

	return null;
}
