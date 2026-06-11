"use client";

/**
 * TaskExecutionSheet — Task Control Center
 *
 * Wide tabbed sheet with 3 tabs:
 *   Tab 1 — Execution & Details: description, deliverables (subtasks removed)
 *   Tab 2 — Time Logs: time entries list + manual log dialog
 *   Tab 3 — Notes & Files: placeholder UI
 *
 * Header: title · status select · timer button
 */

import { useState, useCallback, useRef } from "react";
import { Clock, CheckCircle2, Circle, AlertCircle, Play, Square, Plus, Timer, FileText, StickyNote, Upload, Paperclip, X, MessageSquarePlus, Pencil, Trash2 } from "lucide-react";
// REMOVED: GitBranch - subtasks are no longer supported
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/shared/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
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
import { formatDateTimeDisplay } from "@/shared/lib/dateUtils";

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
	EXECUTION_TASK_STATUS_OPTIONS,
} from "../api/execution.api";
import type { ProjectTask, TaskDeliverable, ProjectTimeEntry } from "../api/execution.api";
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatMinutes(totalMinutes: number): string {
	if (totalMinutes === 0) return "0m";
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	if (h === 0) return `${m}m`;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Time entry row
// ─────────────────────────────────────────────────────────────────────────────

function TimeEntryRow({ entry, canManage, onEdit, onDelete }: { entry: ProjectTimeEntry; canManage: boolean; onEdit: (entry: ProjectTimeEntry) => void; onDelete: (entry: ProjectTimeEntry) => void }) {
	const userName = entry.user?.name ?? `User #${entry.userId}`;
	const duration = entry.durationMinutes != null ? formatMinutes(entry.durationMinutes) : entry.isRunning ? "Running…" : "—";

	return (
		<div className="grid grid-cols-[1fr_auto] items-start gap-3 border-b px-4 py-3 last:border-b-0 text-sm">
			<div className="min-w-0">
				<p className="font-medium truncate">{userName}</p>
				<p className="text-xs text-muted-foreground mt-0.5">
					{entry.startTime ? formatDateTimeDisplay(entry.startTime) : "—"}
					{entry.endTime ? ` → ${formatDateTimeDisplay(entry.endTime)}` : ""}
				</p>
				{entry.note && <p className="text-xs text-muted-foreground/70 mt-0.5 italic">&quot;{entry.note}&quot;</p>}
			</div>
			<div className="flex items-center gap-2 shrink-0">
				{entry.isManual && (
					<Badge
						variant="outline"
						className="text-[10px] px-1.5 py-0 rounded-sm border-dashed"
					>
						Manual
					</Badge>
				)}
				{entry.isRunning && (
					<Badge
						variant="outline"
						className="text-[10px] px-1.5 py-0 rounded-sm bg-rose-50 text-rose-600 border-rose-200 animate-pulse"
					>
						Live
					</Badge>
				)}
				<span className="tabular-nums text-xs font-medium">{duration}</span>
				{canManage && !entry.isRunning && (
					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={() => onEdit(entry)}
						>
							<Pencil className="size-3.5" />
							<span className="sr-only">Edit time entry</span>
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-7 w-7 text-destructive hover:text-destructive"
							onClick={() => onDelete(entry)}
						>
							<Trash2 className="size-3.5" />
							<span className="sr-only">Delete time entry</span>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Manual time log schema
// ─────────────────────────────────────────────────────────────────────────────

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

	// ── Local notes state (optimistic, pre-API) ───────────────────────────────
	const [notes, setNotes] = useState<string[]>([]);
	const [noteInput, setNoteInput] = useState("");

	// ── Local files state (pre-API) ───────────────────────────────────────────
	const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// ── Mutations ─────────────────────────────────────────────────────────────
	const completeTask = useCompleteTask();
	const toggleTimer = useToggleTaskTimer();
	const createDeliverable = useCreateDeliverable();
	// REMOVED: createSubtask - subtasks are no longer supported
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
	const canManageTimeEntries = useAuthStore((s) => s.hasAnyPermission(["manage_time_entries", "manage_all_projects"]));

	// projectRole is the user's MEMBERSHIP role within this specific project
	// (manager, tech_lead, developer, qa, designer).
	const projectRole = canManageAllProjects
		? null // bypass: no workflow ceiling applies
		: (membersQuery.data?.find((m) => m.userId === currentUserId)?.role ?? null);

	// ── ABAC: Assignee check ──────────────────────────────────────────────────
	// isAssignee is true when the current user is the task's explicit assignee.
	const isAssignee = task ? task.assigneeId === currentUserId : false;
	const isManagerLevel = canManageAllProjects || canManageTasks || canEditTasks || projectRole === "manager" || projectRole === "tech_lead";
	// Deliverables can be toggled by the assignee or a manager-level user
	const canToggleDeliverables = isAssignee || isManagerLevel;
	const canManageDeliverableRecords = isManagerLevel || canManageDeliverables;

	// ── CRITICAL: "COMPLETED" STATUS GUARD ────────────────────────────────────
	// ONLY users with these permissions can mark tasks as "done":
	//   1. manage_all_projects (global admin)
	//   2. manage_deliverables (deliverable managers)
	//   3. manage_tasks (task managers)
	//   4. Project manager or tech_lead role
	//
	// Regular assignees (developers, QA without special permissions) CANNOT
	// select "done" from the status dropdown. Their ceiling is "in_review".
	const canMarkAsCompleted = canManageAllProjects || canManageDeliverables || canManageTasks || projectRole === "manager" || projectRole === "tech_lead";

	// ── Status options filtered by permissions ────────────────────────────────
	// Filter out "done" status if the user cannot mark tasks as completed.
	const allowedStatusOptions = (() => {
		// Start with all status options
		let options = [...EXECUTION_TASK_STATUS_OPTIONS];

		// If user cannot mark as completed, remove "done" from the list
		if (!canMarkAsCompleted) {
			options = options.filter((o) => o.value !== ExecutionTaskStatus.DONE);
		}

		// If user has no update permissions at all, return empty (read-only)
		if (!canManageAllProjects && !canManageTasks && !canEditTasks && !canWorkOnTasks) {
			return [];
		}

		return options;
	})();

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
	// NOTE: handleCompleteTask removed — replaced by role-aware handlePrimaryAction
	// which is defined after derived state (below). The footer renders based on
	// primaryAction, so no direct completeTask call lives here.

	const handleTimerToggle = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (!task) return;
			toggleTimer.mutate({ projectId, taskId: task.taskId }, { onError: () => toast.error("Failed to toggle timer.") });
		},
		[toggleTimer, projectId, task],
	);

	// REMOVED: handleSubtaskTimerToggle - subtasks are no longer supported

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

	// REMOVED: handleAddSubtask - subtasks are no longer supported
	// REMOVED: handleSubtaskTimerToggle - subtasks are no longer supported

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

	// ── Derived state ─────────────────────────────────────────────────────────
	const deliverables = task?.deliverables ?? [];
	// REMOVED: subtasks - subtasks are no longer supported
	const timeEntries = task?.timeEntries ?? [];
	const totalDeliverables = deliverables.length;
	const completedDeliverables = deliverables.filter((d) => d.isCompleted).length;
	const allDeliverablesDone = totalDeliverables === 0 || completedDeliverables === totalDeliverables;

	const isDone = task?.status === ExecutionTaskStatus.DONE;
	const runningEntry = timeEntries.find((e) => e.isRunning) ?? null;
	const isTimerRunning = runningEntry !== null;

	const currentStatusColor = getStatusColor(task?.status ?? "");
	const totalLogged = formatMinutes(task?.totalLoggedMinutes ?? 0);
	const canManageTimeEntry = useCallback(
		(entry: ProjectTimeEntry) => entry.userId === currentUserId || canManageTimeEntries || isManagerLevel,
		[currentUserId, canManageTimeEntries, isManagerLevel],
	);

	// ── PBAC: Primary footer action ──────────────────────────────────────────
	// Derives the footer CTA based on permissions, not global roles.
	//
	// Logic:
	//   - edit_tasks permission (managers, tech leads, QA)
	//     → "Mark as Done" via the /complete endpoint.
	//   - work_on_tasks permission without edit_tasks (developers)
	//     → "Submit for Review" which transitions to in_review.
	//   - Neither permission → no footer action (read-only observer).
	//
	// The project-membership role (developer) is still used as a secondary
	// signal to hide the button once the developer has already submitted
	// (in_review / qa / done), since there is nothing left for them to do.
	const primaryAction = (() => {
		if (!task || isDone) return null; // footer shows "Task completed" banner instead

		if (canEditTasks || canManageAllProjects || canManageTasks) {
			// Full completion access — "Mark as Done"
			return {
				label: "Mark as Done",
				targetStatus: ExecutionTaskStatus.DONE,
				useCompleteEndpoint: true,
				requiresAllDeliverables: true,
			} as const;
		}

		if (canWorkOnTasks) {
			// Work-only access — ceiling is in_review.
			// Hide the button once the task is already submitted.
			// SECURITY: Also hide if the current user is NOT the assignee.
			// Only the explicitly assigned user may submit their own task.
			const isAssignee = task.assigneeId === currentUserId;
			if (!isAssignee) return null; // not the assignee — read-only

			const alreadySubmitted = [ExecutionTaskStatus.IN_REVIEW, ExecutionTaskStatus.QA, ExecutionTaskStatus.DONE].includes(task.status as typeof ExecutionTaskStatus.IN_REVIEW | typeof ExecutionTaskStatus.QA | typeof ExecutionTaskStatus.DONE);

			if (alreadySubmitted) return null; // awaiting QA — nothing to do

			return {
				label: "Submit for Review",
				targetStatus: ExecutionTaskStatus.IN_REVIEW,
				useCompleteEndpoint: false,
				requiresAllDeliverables: false,
			} as const;
		}

		return null; // read-only observer
	})();

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

							{/* Timer button — hidden when done */}
							{!isDone && (
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
						<TabsTrigger value="notes">
							<StickyNote className="size-3.5" />
							Notes &amp; Files
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

								{/* REMOVED: Subtasks section - subtasks are no longer supported */}
							</div>
						</ScrollArea>
					</TabsContent>

					{/* ── TAB 2: Time Logs ───────────────────────────────────────── */}
					<TabsContent
						value="timelogs"
						className="flex-1 overflow-hidden"
					>
						<ScrollArea className="h-full">
							<div className="px-6 py-4">
								<div className="mb-4 flex items-center justify-between">
									<div>
										<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time Entries</h4>
										<p className="mt-0.5 text-xs text-muted-foreground">
											Total logged: <span className="font-medium text-foreground">{totalLogged}</span>
										</p>
									</div>
									{!isDone && (
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												manualTimeForm.reset({
													date: new Date().toISOString().slice(0, 10),
													startTime: "09:00",
												endTime: "10:00",
												note: "",
											});
											setEditingTimeEntry(null);
											setManualTimeOpen(true);
										}}
										>
											<Plus className="size-3.5" />
											Log Time
										</Button>
									)}
								</div>

								{timeEntries.length > 0 ? (
									<div className="overflow-hidden rounded-md border bg-background">
										{timeEntries.map((entry) => (
											<TimeEntryRow
												key={entry.entryId}
												entry={entry}
												canManage={canManageTimeEntry(entry)}
												onEdit={handleEditTimeEntry}
												onDelete={handleDeleteTimeEntry}
											/>
										))}
									</div>
								) : (
									<div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center">
										<Timer className="size-6 text-muted-foreground/40" />
										<p className="text-sm font-medium text-muted-foreground">No time logged yet</p>
										<p className="text-xs text-muted-foreground/70">Start the timer or log time manually.</p>
									</div>
								)}
							</div>
						</ScrollArea>
					</TabsContent>

					{/* ── TAB 3: Notes & Files ───────────────────────────────────── */}
					<TabsContent
						value="notes"
						className="flex-1 overflow-hidden"
					>
						<ScrollArea className="h-full">
							<div className="flex flex-col gap-5 px-6 py-4">
								{/* ── Notes ──────────────────────────────────────────────── */}
								<div>
									<h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</h4>

									{/* Existing notes list */}
									{notes.length > 0 && (
										<div className="mb-3 flex flex-col gap-2">
											{notes.map((note, idx) => (
												<div
													key={idx}
													className="group relative rounded-md border bg-muted/30 px-3 py-2.5 text-sm leading-relaxed"
												>
													<p className="whitespace-pre-wrap text-foreground">{note}</p>
													<button
														type="button"
														onClick={() => setNotes((prev) => prev.filter((_, i) => i !== idx))}
														className="absolute right-2 top-2 hidden rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:flex"
														aria-label="Remove note"
													>
														<X className="size-3" />
													</button>
												</div>
											))}
										</div>
									)}

									{/* Add note form */}
									<div className="flex flex-col gap-2">
										<Textarea
											value={noteInput}
											onChange={(e) => setNoteInput(e.target.value)}
											placeholder="Add a note about this task…"
											className="min-h-24 resize-none text-sm"
											onKeyDown={(e) => {
												// Ctrl/Cmd + Enter to submit
												if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
													e.preventDefault();
													const trimmed = noteInput.trim();
													if (trimmed) {
														setNotes((prev) => [...prev, trimmed]);
														setNoteInput("");
													}
												}
											}}
										/>
										<div className="flex items-center justify-between">
											<p className="text-xs text-muted-foreground/60">
												<kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">⌘ Enter</kbd> to save
											</p>
											<Button
												size="sm"
												variant="outline"
												disabled={!noteInput.trim()}
												onClick={() => {
													const trimmed = noteInput.trim();
													if (!trimmed) return;
													setNotes((prev) => [...prev, trimmed]);
													setNoteInput("");
												}}
											>
												<MessageSquarePlus className="size-3.5" />
												Add Note
											</Button>
										</div>
									</div>
								</div>

								<Separator />

								{/* ── Files ──────────────────────────────────────────────── */}
								<div>
									<div className="mb-3 flex items-center justify-between">
										<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Files</h4>
										<Button
											size="sm"
											variant="outline"
											onClick={() => fileInputRef.current?.click()}
										>
											<Upload className="size-3.5" />
											Upload
										</Button>
									</div>

									{/* Hidden file input */}
									<input
										ref={fileInputRef}
										type="file"
										multiple
										className="hidden"
										onChange={(e) => {
											const selected = Array.from(e.target.files ?? []);
											if (selected.length === 0) return;
											setAttachedFiles((prev) => {
												// Deduplicate by name+size
												const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
												const fresh = selected.filter((f) => !existing.has(`${f.name}-${f.size}`));
												return [...prev, ...fresh];
											});
											// Reset input so the same file can be re-selected
											e.target.value = "";
										}}
									/>

									{attachedFiles.length > 0 ? (
										<div className="flex flex-col divide-y rounded-md border">
											{attachedFiles.map((file, idx) => (
												<div
													key={`${file.name}-${idx}`}
													className="flex items-center justify-between gap-3 px-3 py-2.5"
												>
													<div className="flex min-w-0 items-center gap-2">
														<Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
														<span className="truncate text-sm">{file.name}</span>
														<span className="shrink-0 text-xs text-muted-foreground/60">{file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}</span>
													</div>
													<button
														type="button"
														onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
														className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
														aria-label={`Remove ${file.name}`}
													>
														<X className="size-3.5" />
													</button>
												</div>
											))}
										</div>
									) : (
										<div
											className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center transition-colors hover:bg-muted/30"
											onClick={() => fileInputRef.current?.click()}
											role="button"
											tabIndex={0}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
											}}
											aria-label="Click to upload files"
										>
											<FileText className="size-6 text-muted-foreground/40" />
											<p className="text-sm font-medium text-muted-foreground">Click to attach files</p>
											<p className="text-xs text-muted-foreground/70">Any file type supported</p>
										</div>
									)}
								</div>
							</div>
						</ScrollArea>
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
