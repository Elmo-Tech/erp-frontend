"use client";

/**
 * TaskExecutionSheet — Task Control Center
 *
 * Wide tabbed sheet with 2 tabs:
 *   Tab 1 — Execution & Details: description, deliverables (subtasks removed)
 *   Tab 2 — Time Logs: time entries list + manual log dialog
 *
 * Header: title · status select · timer button
 */

import { useState, useCallback, useMemo, useRef } from "react";
import { Clock, CheckCircle2, Circle, AlertCircle, Play, Square, Plus, Timer, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/shared/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import { Separator } from "@/shared/ui/separator";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { cn } from "@/shared/lib/utils";

import {
	useToggleDeliverable,
	useCompleteTask,
	useToggleTaskTimer,
	useCreateDeliverable,
	useUpdateDeliverable,
	useDeleteDeliverable,
	useUpdateTaskStatus,
	useLogManualTime,
	useUpdateTimeEntry,
	useDeleteTimeEntry,
	useProjectMembers,
	ExecutionTaskStatus,
	ExecutionTaskStatusLabels,
	ExecutionTaskStatusColors,
} from "../api/execution.api";
import type { ProjectTask, TaskDeliverable, ProjectTimeEntry } from "../api/execution.api";
import { formatTaskMinutes } from "../model/task-execution-formatters";
import { getAllowedTaskStatusOptions, getPrimaryTaskAction } from "../model/task-execution-rules";
import { TaskTimeLogsPanel } from "./TaskTimeLogsPanel";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useTaskPermissions } from "@/entities/user/model/permissions";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskExecutionSheetProps {
	task: ProjectTask | null;
	projectId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const TIME_ENTRY_WRITE_PERMISSIONS = ["start_timer", "log_time", "manage_time_entries"];
const TIME_ENTRY_MANAGE_PERMISSIONS = ["manage_time_entries", "manage_all_projects"];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
	return ExecutionTaskStatusColors[status as keyof typeof ExecutionTaskStatusColors] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

function getStatusLabel(status: string): string {
	return ExecutionTaskStatusLabels[status as keyof typeof ExecutionTaskStatusLabels] ?? status;
}

// ─────────────────────────────────────────────────────────────────────────────
// Deliverable row
// ─────────────────────────────────────────────────────────────────────────────

interface DeliverableRowProps {
	deliverable: TaskDeliverable;
	projectId: number;
	taskId: number;
	disabled: boolean;
	canManage: boolean;
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

// ─────────────────────────────────────────────────────────────────────────────
// Quick-add inline form
// ─────────────────────────────────────────────────────────────────────────────

interface QuickAddFormProps {
	placeholder: string;
	onSubmit: (value: string, onSuccess: () => void) => void;
	isPending: boolean;
	disabled?: boolean;
}

function QuickAddForm({ placeholder, onSubmit, isPending, disabled }: QuickAddFormProps) {
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = value.trim();
		if (!trimmed) return;
		onSubmit(trimmed, () => {
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
				onChange={(e) => setValue(e.target.value)}
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
			</Button>
		</form>
	);
}

const manualTimeSchema = z
	.object({
		date: z.string().min(1, "Date is required"),
		startTime: z.string().min(1, "Start time is required"),
		endTime: z.string().min(1, "End time is required"),
		note: z.string().optional(),
	})
	.refine(
		(d) => {
			const start = new Date(`${d.date}T${d.startTime}`);
			const end = new Date(`${d.date}T${d.endTime}`);
			return end > start;
		},
		{ message: "End time must be after start time", path: ["endTime"] },
	);

type ManualTimeFormData = z.infer<typeof manualTimeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function TaskExecutionSheet({ task, projectId, open, onOpenChange }: TaskExecutionSheetProps) {
	const [manualTimeOpen, setManualTimeOpen] = useState(false);
	const [editingTimeEntry, setEditingTimeEntry] = useState<ProjectTimeEntry | null>(null);

	// ── Reopen interceptor state ──────────────────────────────────────────────
	const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
	const [pendingStatus, setPendingStatus] = useState<string | null>(null);
	const [reopenReason, setReopenReason] = useState("");

	// ── Mutations ─────────────────────────────────────────────────────────────
	const completeTask = useCompleteTask();
	const toggleTimer = useToggleTaskTimer();
	const createDeliverable = useCreateDeliverable();
	const updateStatus = useUpdateTaskStatus();
	const logManualTime = useLogManualTime();
	const updateTimeEntry = useUpdateTimeEntry();
	const deleteTimeEntry = useDeleteTimeEntry();

	// ── PBAC: Permission flags from the auth store ────────────────────────────
	// Every access decision is driven by granular permissions.
	const currentUserId = useAuthStore((s) => s.user?.userId);
	const membersQuery = useProjectMembers(projectId);

	const { canManageTasks, canEditTasks, canWorkOnTasks, canManageDeliverables } = useTaskPermissions();

	// manage_all_projects replaces the old isGlobalAdmin bypass.
	// Users with this permission skip project-membership workflow ceilings.
	const canManageAllProjects = useAuthStore((s) => s.hasPermission("manage_all_projects"));
	const canWriteTimeEntries = useAuthStore((s) => s.hasAnyPermission(TIME_ENTRY_WRITE_PERMISSIONS));
	const canManageTimeEntries = useAuthStore((s) => s.hasAnyPermission(TIME_ENTRY_MANAGE_PERMISSIONS));

	// projectRole is the user's MEMBERSHIP role within this specific project
	// (manager, tech_lead, developer, qa, designer).
	const projectRole = canManageAllProjects
		? null // bypass: no workflow ceiling applies
		: (membersQuery.data?.find((m) => m.userId === currentUserId)?.role ?? null);

	const taskExecutionAccess = useMemo(
		() => ({
			canManageAllProjects,
			canManageTasks,
			canEditTasks,
			canWorkOnTasks,
			canManageDeliverables,
			projectRole,
			currentUserId,
		}),
		[canManageAllProjects, canManageTasks, canEditTasks, canWorkOnTasks, canManageDeliverables, projectRole, currentUserId],
	);

	// ── ABAC: Assignee check ──────────────────────────────────────────────────
	// isAssignee is true when the current user is the task's explicit assignee.
	const isAssignee = task ? task.assigneeId === currentUserId : false;
	const isManagerLevel = canManageAllProjects || canManageTasks || canEditTasks || projectRole === "manager" || projectRole === "tech_lead";
	// Deliverables can be toggled by the assignee or a manager-level user
	const canToggleDeliverables = isAssignee || isManagerLevel;
	const canManageDeliverableRecords = isManagerLevel || canManageDeliverables;

	const allowedStatusOptions = useMemo(() => getAllowedTaskStatusOptions(taskExecutionAccess), [taskExecutionAccess]);

	// ── Manual time form ──────────────────────────────────────────────────────
	const manualTimeForm = useForm<ManualTimeFormData>({
		resolver: zodResolver(manualTimeSchema),
		defaultValues: {
			date: new Date().toISOString().slice(0, 10),
			startTime: "09:00",
			endTime: "10:00",
			note: "",
		},
	});

	// ── Stable callbacks — all declared before any conditional return ─────────
	const handleTimerToggle = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (!task || !canWriteTimeEntries) return;
			toggleTimer.mutate({ projectId, taskId: task.taskId }, { onError: () => toast.error("Failed to toggle timer.") });
		},
		[toggleTimer, projectId, task, canWriteTimeEntries],
	);

	const handleStatusChange = useCallback(
		(newStatus: string) => {
			if (!task) return;
			// Statuses that require a reopen reason
			const lockedStatuses = [ExecutionTaskStatus.QA, ExecutionTaskStatus.DONE];
			const reopenTargets = [ExecutionTaskStatus.TO_DO, ExecutionTaskStatus.IN_PROGRESS, ExecutionTaskStatus.BACKLOG];
			const requiresReason = lockedStatuses.includes(task.status as (typeof lockedStatuses)[number]) && reopenTargets.includes(newStatus as (typeof reopenTargets)[number]);

			if (requiresReason) {
				setPendingStatus(newStatus);
				setReopenReason("");
				setIsReopenDialogOpen(true);
				return;
			}

			// Direct update — no reason needed
			updateStatus.mutate(
				{ projectId, taskId: task.taskId, status: newStatus },
				{
					onSuccess: () => toast.success(`Status updated to ${getStatusLabel(newStatus)}.`),
					onError: () => toast.error("Failed to update status."),
				},
			);
		},
		[updateStatus, projectId, task],
	);

	const handleReopenConfirm = useCallback(() => {
		if (!task || !pendingStatus) return;
		if (!reopenReason.trim()) {
			toast.error("Please provide a reason for reopening this task.");
			return;
		}
		updateStatus.mutate(
			{ projectId, taskId: task.taskId, status: pendingStatus, reason: reopenReason.trim() },
			{
				onSuccess: () => {
					toast.success(`Task reopened — status set to ${getStatusLabel(pendingStatus)}.`);
					setIsReopenDialogOpen(false);
					setPendingStatus(null);
					setReopenReason("");
				},
				onError: () => toast.error("Failed to reopen task."),
			},
		);
	}, [updateStatus, projectId, task, pendingStatus, reopenReason]);

	const handleAddDeliverable = useCallback(
		(title: string, onSuccess: () => void) => {
			if (!task) return;
			createDeliverable.mutate(
				{ projectId, taskId: task.taskId, title },
				{
					onSuccess: () => {
						toast.success("Deliverable added.");
						onSuccess();
					},
					onError: () => toast.error("Failed to add deliverable."),
				},
			);
		},
		[createDeliverable, projectId, task],
	);

	const handleManualTimeSubmit = manualTimeForm.handleSubmit(async (data) => {
		if (!task) return;
		try {
			const payload = {
				startTime: `${data.date}T${data.startTime}:00`,
				endTime: `${data.date}T${data.endTime}:00`,
				note: data.note?.trim() || undefined,
			};

			if (editingTimeEntry) {
				await updateTimeEntry.mutateAsync({
					projectId,
					taskId: task.taskId,
					entryId: editingTimeEntry.entryId,
					payload,
				});
			} else {
				await logManualTime.mutateAsync({
					projectId,
					taskId: task.taskId,
					payload,
				});
			}
			toast.success(editingTimeEntry ? "Time entry updated." : "Time logged.");
			setManualTimeOpen(false);
			setEditingTimeEntry(null);
			manualTimeForm.reset();
		} catch {
			toast.error(editingTimeEntry ? "Failed to update time entry." : "Failed to log time.");
		}
	});

	const handleEditTimeEntry = useCallback(
		(entry: ProjectTimeEntry) => {
			const start = entry.startTime ? new Date(entry.startTime) : new Date();
			const end = entry.endTime ? new Date(entry.endTime) : start;

			manualTimeForm.reset({
				date: start.toISOString().slice(0, 10),
				startTime: start.toTimeString().slice(0, 5),
				endTime: end.toTimeString().slice(0, 5),
				note: entry.note ?? "",
			});
			setEditingTimeEntry(entry);
			setManualTimeOpen(true);
		},
		[manualTimeForm],
	);

	const handleDeleteTimeEntry = useCallback(
		(entry: ProjectTimeEntry) => {
			if (!task) return;
			deleteTimeEntry.mutate(
				{ projectId, taskId: task.taskId, entryId: entry.entryId },
				{
					onSuccess: () => toast.success("Time entry deleted."),
					onError: () => toast.error("Failed to delete time entry."),
				},
			);
		},
		[deleteTimeEntry, projectId, task],
	);

	const handleOpenManualTimeDialog = useCallback(() => {
		manualTimeForm.reset({
			date: new Date().toISOString().slice(0, 10),
			startTime: "09:00",
			endTime: "10:00",
			note: "",
		});
		setEditingTimeEntry(null);
		setManualTimeOpen(true);
	}, [manualTimeForm]);

	// ── Derived state ─────────────────────────────────────────────────────────
	const deliverables = task?.deliverables ?? [];
	const timeEntries = task?.timeEntries ?? [];
	const totalDeliverables = deliverables.length;
	const completedDeliverables = deliverables.filter((d) => d.isCompleted).length;
	const allDeliverablesDone = totalDeliverables === 0 || completedDeliverables === totalDeliverables;

	const isDone = task?.status === ExecutionTaskStatus.DONE;
	const runningEntry = timeEntries.find((e) => e.isRunning) ?? null;
	const isTimerRunning = runningEntry !== null;

	const currentStatusColor = getStatusColor(task?.status ?? "");
	const totalLogged = formatTaskMinutes(task?.totalLoggedMinutes ?? 0);
	const canManageTimeEntry = useCallback(
		(entry: ProjectTimeEntry) => entry.userId === currentUserId || canManageTimeEntries || isManagerLevel,
		[currentUserId, canManageTimeEntries, isManagerLevel],
	);

	const primaryAction = useMemo(
		() =>
			task
				? getPrimaryTaskAction({
						...taskExecutionAccess,
						taskStatus: task.status,
						taskAssigneeId: task.assigneeId,
					})
				: null,
		[task, taskExecutionAccess],
	);

	// ── Primary action handler ────────────────────────────────────────────────
	const handlePrimaryAction = useCallback(() => {
		if (!task || !primaryAction) return;

		if (primaryAction.useCompleteEndpoint) {
			// "Mark as Done" — uses the /complete endpoint which enforces
			// deliverable checks and milestone progress on the backend.
			completeTask.mutate(
				{ projectId, taskId: task.taskId },
				{
					onSuccess: () => {
						toast.success("Task marked as done.");
						onOpenChange(false);
					},
					onError: () => toast.error("Failed to complete task."),
				},
			);
		} else {
			// "Submit for Review" — transitions to in_review via the PATCH endpoint.
			updateStatus.mutate(
				{ projectId, taskId: task.taskId, status: primaryAction.targetStatus },
				{
					onSuccess: () => toast.success("Task submitted for review."),
					onError: () => toast.error("Failed to submit task for review."),
				},
			);
		}
	}, [primaryAction, completeTask, updateStatus, projectId, task, onOpenChange]);

	// ── Early return after all hooks ──────────────────────────────────────────
	if (!task) {
		return null;
	}

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
		>
			<SheetContent
				side="right"
				className="flex w-[90vw] flex-col gap-0 p-0 sm:max-w-2xl lg:max-w-3xl overflow-hidden"
			>
				{/* ── Header ────────────────────────────────────────────────────── */}
				<SheetHeader className="border-b px-6 py-4 shrink-0">
					{/* Row 1: title + controls */}
					<div className="flex items-start justify-between gap-3 pr-8">
						<SheetTitle className="text-base font-semibold leading-snug">{task.title}</SheetTitle>

						<div className="flex shrink-0 items-center gap-2">
							{/* Status selector — options filtered by project role */}
							<Select
								value={task.status}
								onValueChange={handleStatusChange}
								disabled={updateStatus.isPending || allowedStatusOptions.length === 0}
							>
								<SelectTrigger
									size="sm"
									className={cn("h-7 gap-1.5 rounded-sm border px-2 py-0 font-mono text-[10px] uppercase tracking-wide w-auto", currentStatusColor)}
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{allowedStatusOptions.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}
										>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{!isDone && canWriteTimeEntries && (
								<Button
									type="button"
									size="sm"
									variant={isTimerRunning ? "destructive" : "outline"}
									className={cn("h-7 gap-1.5 px-2.5 text-xs font-medium", isTimerRunning && "animate-pulse")}
									disabled={toggleTimer.isPending}
									onClick={handleTimerToggle}
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
							)}
						</div>
					</div>

					{/* Row 2: meta */}
					<SheetDescription asChild>
						<div className="flex flex-wrap items-center gap-4 pt-1">
							<div className="flex items-center gap-1.5 text-xs">
								<Clock className="size-3 text-muted-foreground" />
								<span className="text-muted-foreground">Logged:</span>
								<span className="font-medium tabular-nums">{totalLogged}</span>
							</div>
							{task.estimatedHours != null && (
								<>
									<span className="text-muted-foreground/40">·</span>
									<div className="flex items-center gap-1.5 text-xs">
										<span className="text-muted-foreground">Estimated:</span>
										<span className="font-medium tabular-nums">{task.estimatedHours}h</span>
									</div>
								</>
							)}
							{task.assignee && (
								<>
									<span className="text-muted-foreground/40">·</span>
									<span className="text-xs text-muted-foreground">
										Assigned to <span className="font-medium text-foreground">{task.assignee.name}</span>
									</span>
								</>
							)}
						</div>
					</SheetDescription>
				</SheetHeader>

				{/* ── Tabbed body ───────────────────────────────────────────────── */}
				<Tabs
					defaultValue="execution"
					className="flex flex-1 flex-col overflow-hidden"
				>
					<TabsList className="mx-6 mt-3 mb-0 w-fit shrink-0">
						<TabsTrigger value="execution">
							<CheckCircle2 className="size-3.5" />
							Execution
						</TabsTrigger>
						<TabsTrigger value="timelogs">
							<Timer className="size-3.5" />
							Time Logs
						</TabsTrigger>
					</TabsList>

					{/* ── TAB 1: Execution & Details ─────────────────────────────── */}
					<TabsContent
						value="execution"
						className="flex-1 overflow-hidden"
					>
						<ScrollArea className="h-full">
							<div className="flex flex-col gap-5 px-6 py-4">
								{/* Description */}
								{task.description && (
									<div>
										<h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h4>
										<p className="text-sm leading-relaxed text-muted-foreground">{task.description}</p>
									</div>
								)}

								{task.description && <Separator />}

								{/* Deliverables */}
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
											{deliverables.map((d) => (
												<DeliverableRow
													key={d.deliverableId}
													deliverable={d}
													projectId={projectId}
													taskId={task.taskId}
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
							</div>
						</ScrollArea>
					</TabsContent>

					{/* ── TAB 2: Time Logs ───────────────────────────────────────── */}
					<TabsContent
						value="timelogs"
						className="flex-1 overflow-hidden"
					>
						<TaskTimeLogsPanel
							timeEntries={timeEntries}
							totalLogged={totalLogged}
							isDone={isDone}
							canWriteTimeEntries={canWriteTimeEntries}
							canManageTimeEntry={canManageTimeEntry}
							onLogTime={handleOpenManualTimeDialog}
							onEditTimeEntry={handleEditTimeEntry}
							onDeleteTimeEntry={handleDeleteTimeEntry}
						/>
					</TabsContent>

				</Tabs>

				{/* ── Footer ────────────────────────────────────────────────────── */}
				{primaryAction && (
					<SheetFooter className="border-t px-6 py-4 shrink-0">
						{/* Deliverable gate: only applies when requiresAllDeliverables is true (Mark as Done) */}
						{primaryAction.requiresAllDeliverables && !allDeliverablesDone ? (
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
												{primaryAction.label}
											</Button>
										</span>
									</TooltipTrigger>
									<TooltipContent side="top">
										Complete all {totalDeliverables - completedDeliverables} remaining deliverable
										{totalDeliverables - completedDeliverables !== 1 ? "s" : ""} first
									</TooltipContent>
								</Tooltip>
								<div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
									<Circle className="size-3" />
									<span>
										{totalDeliverables - completedDeliverables} deliverable
										{totalDeliverables - completedDeliverables !== 1 ? "s" : ""} still pending
									</span>
								</div>
							</>
						) : (
							<Button
								className="w-full"
								size="lg"
								onClick={handlePrimaryAction}
								disabled={completeTask.isPending || updateStatus.isPending}
							>
								<CheckCircle2 className="size-4" />
								{completeTask.isPending || updateStatus.isPending ? "Saving…" : primaryAction.label}
							</Button>
						)}
					</SheetFooter>
				)}

				{isDone && (
					<SheetFooter className="border-t px-6 py-4 shrink-0">
						<div className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
							<CheckCircle2 className="size-4" />
							Task completed
						</div>
					</SheetFooter>
				)}
			</SheetContent>

			{/* ── Reopen reason dialog ──────────────────────────────────────── */}
			<Dialog
				open={isReopenDialogOpen}
				onOpenChange={(o) => {
					if (!o) {
						setIsReopenDialogOpen(false);
						setPendingStatus(null);
						setReopenReason("");
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Reason for Reopening</DialogTitle>
						<DialogDescription>
							This task is currently in <strong>{task ? getStatusLabel(task.status) : ""}</strong>. Please provide a reason before moving it to <strong>{pendingStatus ? getStatusLabel(pendingStatus) : ""}</strong>.
						</DialogDescription>
					</DialogHeader>
					<div className="py-2">
						<Textarea
							value={reopenReason}
							onChange={(e) => setReopenReason(e.target.value)}
							placeholder="e.g. QA found a regression in the login flow…"
							className="min-h-24 resize-none text-sm"
							autoFocus
						/>
					</div>
					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setIsReopenDialogOpen(false);
								setPendingStatus(null);
								setReopenReason("");
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleReopenConfirm}
							disabled={!reopenReason.trim() || updateStatus.isPending}
						>
							{updateStatus.isPending ? "Saving…" : "Confirm Reopen"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ── Manual time log dialog ─────────────────────────────────────── */}
			<FormDialog
				open={manualTimeOpen}
				onOpenChange={(nextOpen) => {
					setManualTimeOpen(nextOpen);
					if (!nextOpen) {
						setEditingTimeEntry(null);
					}
				}}
				title={editingTimeEntry ? "Edit Time Entry" : "Log Time Manually"}
				description={editingTimeEntry ? "Update the recorded work time for this task." : "Record past work time for this task."}
				submitLabel={editingTimeEntry ? "Save Time" : "Log Time"}
				isLoading={logManualTime.isPending || updateTimeEntry.isPending}
				onSubmit={handleManualTimeSubmit}
				size="sm"
			>
				<Form {...manualTimeForm}>
					<div className="flex flex-col gap-4">
						<FormInput
							control={manualTimeForm.control}
							name="date"
							label="Date"
							type="date"
						/>
						<div className="grid grid-cols-2 gap-3">
							<FormInput
								control={manualTimeForm.control}
								name="startTime"
								label="Start time"
								type="time"
							/>
							<FormInput
								control={manualTimeForm.control}
								name="endTime"
								label="End time"
								type="time"
							/>
						</div>
						<FormTextarea
							control={manualTimeForm.control}
							name="note"
							label="Note (optional)"
							placeholder="What did you work on?"
							rows={2}
						/>
					</div>
				</Form>
			</FormDialog>
		</Sheet>
	);
}
