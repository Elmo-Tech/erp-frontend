"use client";

import type { MouseEvent } from "react";
import { Clock, Play, Square } from "lucide-react";

import { SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";

interface TaskStatusOption {
	value: string;
	label: string;
}

interface TaskExecutionHeaderProps {
	taskTitle: string;
	taskStatus: string;
	totalLogged: string;
	estimatedHours: number | null;
	assigneeName?: string | null;
	currentStatusColor: string;
	allowedStatusOptions: TaskStatusOption[];
	isDone: boolean;
	isTimerRunning: boolean;
	canWriteTimeEntries: boolean;
	isStatusPending: boolean;
	isTimerPending: boolean;
	onStatusChange: (status: string) => void;
	onTimerToggle: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface TaskStatusControlsProps {
	taskStatus: string;
	currentStatusColor: string;
	allowedStatusOptions: TaskStatusOption[];
	isDone: boolean;
	isTimerRunning: boolean;
	canWriteTimeEntries: boolean;
	isStatusPending: boolean;
	isTimerPending: boolean;
	onStatusChange: (status: string) => void;
	onTimerToggle: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface TaskTimerButtonProps {
	isDone: boolean;
	isTimerRunning: boolean;
	canWriteTimeEntries: boolean;
	isTimerPending: boolean;
	onTimerToggle: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface TaskMetaProps {
	totalLogged: string;
	estimatedHours: number | null;
	assigneeName?: string | null;
}

function TaskTimerButton({ isDone, isTimerRunning, canWriteTimeEntries, isTimerPending, onTimerToggle }: TaskTimerButtonProps) {
	if (isDone || !canWriteTimeEntries) {
		return null;
	}

	return (
		<Button
			type="button"
			size="sm"
			variant={isTimerRunning ? "destructive" : "outline"}
			className={cn("h-7 gap-1.5 px-2.5 text-xs font-medium", isTimerRunning && "animate-pulse")}
			disabled={isTimerPending}
			onClick={onTimerToggle}
			aria-label={isTimerRunning ? "Stop timer" : "Start timer"}
		>
			{isTimerRunning ? (
				<>
					<Square className="size-3 fill-current" />
					Stop
				</>
			) : (
				<>
					<Play className="size-3 fill-current" />
					Start
				</>
			)}
		</Button>
	);
}

function TaskStatusControls({
	taskStatus,
	currentStatusColor,
	allowedStatusOptions,
	isDone,
	isTimerRunning,
	canWriteTimeEntries,
	isStatusPending,
	isTimerPending,
	onStatusChange,
	onTimerToggle,
}: TaskStatusControlsProps) {
	return (
		<div className="flex shrink-0 items-center gap-2">
			<Select
				value={taskStatus}
				onValueChange={onStatusChange}
				disabled={isStatusPending || allowedStatusOptions.length === 0}
			>
				<SelectTrigger
					size="sm"
					className={cn("h-7 gap-1.5 rounded-sm border px-2 py-0 font-mono text-[10px] uppercase tracking-wide w-auto", currentStatusColor)}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{allowedStatusOptions.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
						>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<TaskTimerButton
				isDone={isDone}
				isTimerRunning={isTimerRunning}
				canWriteTimeEntries={canWriteTimeEntries}
				isTimerPending={isTimerPending}
				onTimerToggle={onTimerToggle}
			/>
		</div>
	);
}

function TaskMeta({ totalLogged, estimatedHours, assigneeName }: TaskMetaProps) {
	return (
		<SheetDescription asChild>
			<div className="flex flex-wrap items-center gap-4 pt-1">
				<div className="flex items-center gap-1.5 text-xs">
					<Clock className="size-3 text-muted-foreground" />
					<span className="text-muted-foreground">Logged:</span>
					<span className="font-medium tabular-nums">{totalLogged}</span>
				</div>
				{estimatedHours != null && (
					<>
						<span className="text-muted-foreground/40">·</span>
						<div className="flex items-center gap-1.5 text-xs">
							<span className="text-muted-foreground">Estimated:</span>
							<span className="font-medium tabular-nums">{estimatedHours}h</span>
						</div>
					</>
				)}
				{assigneeName && (
					<>
						<span className="text-muted-foreground/40">·</span>
						<span className="text-xs text-muted-foreground">
							Assigned to <span className="font-medium text-foreground">{assigneeName}</span>
						</span>
					</>
				)}
			</div>
		</SheetDescription>
	);
}

export function TaskExecutionHeader({
	taskTitle,
	taskStatus,
	totalLogged,
	estimatedHours,
	assigneeName,
	currentStatusColor,
	allowedStatusOptions,
	isDone,
	isTimerRunning,
	canWriteTimeEntries,
	isStatusPending,
	isTimerPending,
	onStatusChange,
	onTimerToggle,
}: TaskExecutionHeaderProps) {
	return (
		<SheetHeader className="border-b px-6 py-4 shrink-0">
			<div className="flex items-start justify-between gap-3 pr-8">
				<SheetTitle className="text-base font-semibold leading-snug">{taskTitle}</SheetTitle>

				<TaskStatusControls
					taskStatus={taskStatus}
					currentStatusColor={currentStatusColor}
					allowedStatusOptions={allowedStatusOptions}
					isDone={isDone}
					isTimerRunning={isTimerRunning}
					canWriteTimeEntries={canWriteTimeEntries}
					isStatusPending={isStatusPending}
					isTimerPending={isTimerPending}
					onStatusChange={onStatusChange}
					onTimerToggle={onTimerToggle}
				/>
			</div>

			<TaskMeta
				totalLogged={totalLogged}
				estimatedHours={estimatedHours}
				assigneeName={assigneeName}
			/>
		</SheetHeader>
	);
}
