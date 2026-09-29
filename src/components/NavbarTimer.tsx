"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bell, CirclePause, Clock, ExternalLink, Hand, Loader2, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { TimeEntryData, useTimerStore } from "@/store/timerStore";
import { getElapsedSeconds, formatDuration } from "@/lib/dateUtils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { projectPipelineKeys } from "@/features/projects/hooks/useProjectPipeline";
import { useActiveTimerTabBehavior } from "@/hooks/useActiveTimerTabBehavior";

export function NavbarTimer({ className }: { className?: string }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { activeTimer, resumableTimer, setActiveTimer, setResumableTimer, isLoading } = useTimerStore();
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [pendingAction, setPendingAction] = useState<"pause" | "hold" | "end" | "resume" | null>(null);
	const [holdDialogOpen, setHoldDialogOpen] = useState(false);
	const [holdReason, setHoldReason] = useState("");
	const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");
	const [mounted, setMounted] = useState(false);
	const lastReminderBucket = useRef(0);

	useActiveTimerTabBehavior(activeTimer, elapsedSeconds);

	useEffect(() => {
		setMounted(true);
		setNotificationPermission("Notification" in window ? Notification.permission : "unsupported");
	}, []);

	const handleNavigateToTask = useCallback(() => {
		if (activeTimer && activeTimer.trackableType.includes("Task")) {
			router.push(
				activeTimer.trackableProjectId
					? `/dashboard/projects/${activeTimer.trackableProjectId}`
					: `/dashboard/my-tasks?highlight=${activeTimer.trackableId}`
			);
		}
	}, [activeTimer, router]);

	// Update elapsed time every second
	useEffect(() => {
		if (!activeTimer) {
			setElapsedSeconds(0);
			return;
		}

		const updateElapsed = () => {
			const elapsed = getElapsedSeconds(activeTimer.startTime);
			setElapsedSeconds(elapsed);
		};

		updateElapsed();
		const interval = setInterval(updateElapsed, 1000);

		return () => clearInterval(interval);
	}, [activeTimer]);

	useEffect(() => {
		if (!activeTimer) {
			lastReminderBucket.current = 0;
		}
	}, [activeTimer]);

	useEffect(() => {
		if (
			!activeTimer
			|| notificationPermission !== "granted"
			|| document.visibilityState !== "hidden"
		) {
			return;
		}

		const reminderBucket = Math.floor(elapsedSeconds / (45 * 60));
		if (reminderBucket < 1 || reminderBucket <= lastReminderBucket.current) {
			return;
		}

		lastReminderBucket.current = reminderBucket;
		const notification = new Notification("A work timer is still running", {
			body: `${activeTimer.trackableDisplayName} · ${formatDuration(elapsedSeconds)}`,
			tag: `active-timer-${activeTimer.timeEntryId}`,
			requireInteraction: true,
		});

		notification.onclick = () => {
			window.focus();
			handleNavigateToTask();
			notification.close();
		};
	}, [activeTimer, elapsedSeconds, handleNavigateToTask, notificationPermission]);

	const handleTimerAction = async (action: "pause" | "hold" | "end") => {
		setPendingAction(action);
		try {
			const response = await api.post<{ data: TimeEntryData }>(
				`/time-entries/${action}`,
				action === "hold" ? { reason: holdReason.trim() } : undefined
			);
			setActiveTimer(null);
			setResumableTimer(action === "end" ? null : response.data.data);
			setHoldDialogOpen(false);
			setHoldReason("");
			await queryClient.invalidateQueries({ queryKey: projectPipelineKeys.all });
			toast.success(action === "pause" ? "Timer paused" : action === "hold" ? "Task placed on hold" : "Timer ended");
		} catch {
			toast.error(`Failed to ${action} timer`);
		} finally {
			setPendingAction(null);
		}
	};

	const handleResumeTimer = async () => {
		if (!resumableTimer) return;

		setPendingAction("resume");
		try {
			const response = await api.post<{ data: TimeEntryData }>(`/time-entries/${resumableTimer.timeEntryId}/resume`);
			setActiveTimer(response.data.data);
			setResumableTimer(null);
			await queryClient.invalidateQueries({ queryKey: projectPipelineKeys.all });
			toast.success("Timer resumed");
		} catch {
			toast.error("Failed to resume timer");
		} finally {
			setPendingAction(null);
		}
	};

	const enableNotifications = async () => {
		if (!("Notification" in window)) return;
		const permission = await Notification.requestPermission();
		setNotificationPermission(permission);
	};

	if (!mounted || isLoading) {
		return (
			<div className={cn("flex items-center gap-2 p-2 bg-muted/50 rounded-lg", className)}>
				<Loader2 className="h-3 w-3 animate-spin" />
			</div>
		);
	}

	return (
		<TooltipProvider>
			<div className={cn("flex items-center gap-2 p-2 bg-muted/50 rounded-lg", className)}>
				{activeTimer ? (
					<>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={handleNavigateToTask}
									className="flex items-center gap-2 hover:bg-muted rounded px-2 py-1 transition-colors cursor-pointer"
								>
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
									<span className="text-sm font-mono font-medium">{formatDuration(elapsedSeconds)}</span>
									<span className="text-xs text-muted-foreground max-w-[100px] truncate hidden sm:inline">{activeTimer.trackableDisplayName}</span>
									<ExternalLink className="h-3 w-3 text-muted-foreground" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p className="font-medium">{activeTimer.trackableDisplayName}</p>
								<p className="text-xs text-muted-foreground">Click to view task</p>
							</TooltipContent>
						</Tooltip>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => handleTimerAction("pause")}
							disabled={pendingAction !== null}
							className="h-7 w-7"
							aria-label="Pause timer"
						>
							{pendingAction === "pause" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CirclePause className="h-3 w-3 text-amber-500" />}
						</Button>
						{activeTimer.trackableType.includes("Task") && (
							<Button
								size="icon"
								variant="ghost"
								onClick={() => setHoldDialogOpen(true)}
								disabled={pendingAction !== null}
								className="h-7 w-7"
								aria-label="Put task on hold"
							>
								<Hand className="h-3 w-3 text-orange-500" />
							</Button>
						)}
						<Button
							size="icon"
							variant="ghost"
							onClick={() => handleTimerAction("end")}
							disabled={pendingAction !== null}
							className="h-7 w-7"
							aria-label="End timer"
						>
							{pendingAction === "end" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3 text-red-500" />}
						</Button>
						{notificationPermission === "default" && (
							<Button
								size="icon"
								variant="ghost"
								onClick={enableNotifications}
								className="h-7 w-7"
								aria-label="Enable timer notifications"
							>
								<Bell className="h-3 w-3" />
							</Button>
						)}
					</>
				) : resumableTimer ? (
					<Button
						size="sm"
						variant="outline"
						onClick={handleResumeTimer}
						disabled={pendingAction !== null}
						className="gap-2"
					>
						{pendingAction === "resume" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
						Resume {resumableTimer.trackableDisplayName}
					</Button>
				) : (
					<div className="flex items-center gap-1 text-muted-foreground">
						<Clock className="h-3 w-3" />
						<span className="text-sm">No timer</span>
					</div>
				)}
			</div>
			<Dialog
				open={holdDialogOpen}
				onOpenChange={setHoldDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Put task on hold</DialogTitle>
						<DialogDescription>The timer will stop. Add a reason so the team knows what is blocking the task.</DialogDescription>
					</DialogHeader>
					<Textarea
						value={holdReason}
						onChange={(event) => setHoldReason(event.target.value)}
						placeholder="Waiting for client feedback, blocked by another task..."
						maxLength={500}
					/>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setHoldDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={() => handleTimerAction("hold")}
							disabled={!holdReason.trim() || pendingAction !== null}
						>
							{pendingAction === "hold" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Put on hold
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</TooltipProvider>
	);
}
