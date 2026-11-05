"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bell, CirclePause, Clock, ExternalLink, Hand, Loader2, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { notifyApiError } from "@/lib/errorHandling";
import { TimeEntryData, useTimerStore } from "@/store/timerStore";
import { getElapsedSeconds, formatDuration } from "@/lib/dateUtils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { projectPipelineKeys } from "@/features/projects/hooks/useProjectPipeline";
import { useActiveTimerTabBehavior } from "@/hooks/useActiveTimerTabBehavior";
import { DesktopNotificationSettings, useNotificationPreferences } from "./DesktopNotificationSettings";
import { useRealtimeTimer } from "@/hooks/useTimerSocket";

export function NavbarTimer({ className }: { className?: string }) {
	const { refetch: refreshTimer } = useRealtimeTimer();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { activeTimer, resumableTimer, setActiveTimer, setResumableTimer, isLoading } = useTimerStore();
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [pendingAction, setPendingAction] = useState<"pause" | "hold" | "end" | "resume" | null>(null);
	const [holdDialogOpen, setHoldDialogOpen] = useState(false);
	const [holdReason, setHoldReason] = useState("");
	const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
	const { data: notificationPreferences } = useNotificationPreferences();
	const [mounted, setMounted] = useState(false);
	const lastReminderBucket = useRef(0);

	useActiveTimerTabBehavior(activeTimer, elapsedSeconds, notificationPreferences?.reminderMinutes ?? 15);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleNavigateToTask = useCallback(() => {
		if (activeTimer?.targetStatus && activeTimer.targetStatus !== "available") return;
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
		if (!activeTimer) {
			return;
		}

		const reminderBucket = Math.floor(elapsedSeconds / ((notificationPreferences?.reminderMinutes ?? 15) * 60));
		if (reminderBucket < 1 || reminderBucket <= lastReminderBucket.current) {
			return;
		}

		lastReminderBucket.current = reminderBucket;
		window.dispatchEvent(new CustomEvent("timer-reminder", { detail: { timer_id: activeTimer.timeEntryId, body: activeTimer.trackableDisplayName, reminderMinutes: notificationPreferences?.reminderMinutes ?? 15 } }));
	}, [activeTimer, elapsedSeconds, notificationPreferences?.reminderMinutes]);

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
			// Success toast comes from the backend message via the axios interceptor.
		} catch (error) {
			notifyApiError(error);
			if ((error as { response?: { status?: number } }).response?.status === 409) await refreshTimer();
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
			// Success toast comes from the backend message via the axios interceptor.
		} catch (error) {
			notifyApiError(error);
			if ([409, 422].includes((error as { response?: { status?: number } }).response?.status ?? 0)) await refreshTimer();
		} finally {
			setPendingAction(null);
		}
	};

	const enableNotifications = async () => {
		setNotificationSettingsOpen(true);
	};

	if (!mounted || isLoading) {
		return (
			<div className={cn("flex flex-wrap items-center gap-1 p-2 bg-muted/50 rounded-lg sm:flex-nowrap sm:gap-2", className)}>
				<Loader2 className="h-3 w-3 animate-spin" />
			</div>
		);
	}

	return (
		<TooltipProvider>
			<Dialog open={notificationSettingsOpen} onOpenChange={setNotificationSettingsOpen}><DialogContent><DialogHeader><DialogTitle>Notification preferences</DialogTitle></DialogHeader><DesktopNotificationSettings /></DialogContent></Dialog>
			<div className={cn("flex flex-wrap items-center gap-1 p-2 bg-muted/50 rounded-lg sm:flex-nowrap sm:gap-2", className)}>
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
								<p className="max-w-72 text-xs text-muted-foreground">{activeTimer.targetMessage || "Click to view task"}</p>
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
						{activeTimer.trackableType.includes("Task") && (!activeTimer.targetStatus || activeTimer.targetStatus === "available") && (
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
							title={activeTimer.targetMessage ? "Stop the timer and save recorded work time" : "End timer and complete task"}
							disabled={pendingAction !== null}
							className="h-7 w-7"
							aria-label="End timer"
						>
							{pendingAction === "end" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3 text-red-500" />}
						</Button>
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
						{resumableTimer.stopReason === "after_hours_timeout" ? `Automatically paused${resumableTimer.endTime ? ` at ${new Date(resumableTimer.endTime).toLocaleString()}` : ""} — Resume ` : "Resume "}{resumableTimer.trackableDisplayName}
					</Button>
				) : (
					<div className="flex items-center gap-1 text-muted-foreground">
						<Clock className="h-3 w-3" />
						<span className="text-sm">No timer</span>
					</div>
				)}
				<Button size="icon" variant="ghost" onClick={enableNotifications} className="h-7 w-7" aria-label="Notification preferences"><Bell className="h-3 w-3" /></Button>
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
