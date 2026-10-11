"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock3, Loader2, OctagonPause, Pause, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeTimer, useStartTimer } from "@/features/sales/hooks";
import { timeEntriesApi } from "@/features/sales/api/timeEntries";
import { TrackableType } from "@/features/sales/types";
import { handleApiError } from "@/lib/errorHandling";
import { cn } from "@/lib/utils";
import { useTimerStore } from "@/store/timerStore";
import { useAuthStore } from "@/store/authStore";

interface TaskWorkControlsProps {
	taskId: number;
	title: string;
	canWork: boolean;
	disabledReason?: string;
	activeWorkTimers?: { userId: number; name: string; startTime: string }[];
}

export function formatWorkDuration(seconds: number) {
	const value = Math.max(0, Math.floor(seconds));
	return [Math.floor(value / 3600), Math.floor(value / 60) % 60, value % 60].map((part) => String(part).padStart(2, "0")).join(":");
}

export function TaskWorkControls({ taskId, title, canWork, disabledReason, activeWorkTimers = [] }: TaskWorkControlsProps) {
	const currentUserId = useAuthStore((state) => state.user?.userId);
	const activeTimer = useTimerStore((state) => state.activeTimer);
	const resumableTimer = useTimerStore((state) => state.resumableTimer);
	const isChecking = useTimerStore((state) => state.isLoading);
	const [now, setNow] = useState(() => Date.now());
	const [holdOpen, setHoldOpen] = useState(false);
	const [holdReason, setHoldReason] = useState("");
	const queryClient = useQueryClient();
	const startTimer = useStartTimer();
	const resumeTimer = useResumeTimer();
	const isRunning = !!activeTimer && activeTimer.trackableType.toLowerCase().includes("task") && Number(activeTimer.trackableId) === taskId;
	const isResumable = !!resumableTimer && resumableTimer.trackableType.toLowerCase().includes("task") && Number(resumableTimer.trackableId) === taskId;
	const isBlocked = (!!activeTimer && !isRunning) || (!!resumableTimer && !isResumable);
	const hasLiveTimer = isRunning || activeWorkTimers.length > 0;

	useEffect(() => {
		if (!hasLiveTimer) return;
		const interval = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(interval);
	}, [hasLiveTimer]);

	const refresh = () => Promise.all([
		queryClient.invalidateQueries({ queryKey: ["project-pipeline"] }),
		queryClient.invalidateQueries({ queryKey: ["tasks"] }),
		queryClient.invalidateQueries({ queryKey: ["timeEntries"] }),
	]);
	const controlTimer = useMutation({
		mutationFn: (action: "pause" | "hold" | "end") => action === "hold" ? timeEntriesApi.hold(holdReason.trim()) : action === "pause" ? timeEntriesApi.pause() : timeEntriesApi.end(),
		onSuccess: async (entry, action) => {
			useTimerStore.getState().setActiveTimer(null);
			useTimerStore.getState().setResumableTimer(action === "end" ? null : { ...entry, isActive: false });
			setHoldOpen(false);
			setHoldReason("");
			await refresh();
			// Success toast comes from the backend message via the axios interceptor.
		},
		onError: (error) => toast.error(handleApiError(error)),
	});
	const pending = startTimer.isPending || resumeTimer.isPending || controlTimer.isPending;
	const handleStart = async () => {
		try {
			if (isResumable && resumableTimer) await resumeTimer.mutateAsync(resumableTimer.timeEntryId);
			else await startTimer.mutateAsync({ trackableType: TrackableType.TASK, trackableId: taskId });
			await refresh();
			// Success toast comes from the backend message via the axios interceptor.
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};
	const elapsed = (start: string) => formatWorkDuration((now - new Date(start).getTime()) / 1000);

	return (
		<div className="space-y-2 border-t pt-3">
			<div className="flex items-center justify-between gap-2 text-xs">
				<span className={cn("flex items-center gap-1.5 font-medium", isRunning && "text-emerald-600")}>
					<Clock3 className="h-3.5 w-3.5" />{isRunning ? "Your work timer" : isResumable ? (resumableTimer?.stopReason === "hold" ? "On hold" : "Paused") : "Work timer"}
				</span>
				{isRunning && activeTimer && <span className="font-mono text-sm font-semibold tabular-nums text-emerald-600">{elapsed(activeTimer.startTime)}</span>}
			</div>
			{activeWorkTimers.filter((timer) => !isRunning || timer.userId !== currentUserId).map((timer) => (
				<p key={timer.userId} className="flex justify-between gap-2 text-xs text-emerald-600"><span className="truncate">Working: {timer.name}</span><span className="font-mono tabular-nums">{elapsed(timer.startTime)}</span></p>
			))}
			<div className="flex flex-wrap gap-1.5">
				{isRunning ? (
					<>
						<Button size="sm" variant="outline" disabled={pending} onClick={() => controlTimer.mutate("pause")} aria-label={`Pause work on ${title}`}><Pause className="h-3.5 w-3.5" />Pause</Button>
						<Button size="sm" variant="outline" disabled={pending} onClick={() => setHoldOpen(true)} aria-label={`Hold work on ${title}`}><OctagonPause className="h-3.5 w-3.5" />Hold</Button>
						<Button size="sm" variant="outline" disabled={pending} onClick={() => controlTimer.mutate("end")} aria-label={`End work on ${title}`}><Square className="h-3.5 w-3.5" />End</Button>
					</>
				) : (
					<Button size="sm" variant={isResumable ? "default" : "outline"} disabled={pending || isChecking || isBlocked || !canWork} onClick={handleStart} aria-label={`${isResumable ? "Resume" : "Start"} work on ${title}`}>
						{pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}{isResumable ? "Resume" : "Start"}
					</Button>
				)}
			</div>
			{!isRunning && (isBlocked || !canWork) && <p className="text-xs text-muted-foreground">{isBlocked ? "Finish or resume your current timer first." : disabledReason ?? "Work controls are available to assigned employees."}</p>}
			<Dialog open={holdOpen} onOpenChange={setHoldOpen}>
				<DialogContent>
					<DialogHeader><DialogTitle>Put task on hold</DialogTitle><DialogDescription>Pause work on “{title}” and record what is blocking it.</DialogDescription></DialogHeader>
					<Label htmlFor={`hold-reason-${taskId}`}>Hold reason</Label>
					<Textarea id={`hold-reason-${taskId}`} value={holdReason} onChange={(event) => setHoldReason(event.target.value)} placeholder="Waiting for feedback, dependency, or another blocker…" maxLength={2000} />
					<DialogFooter><Button variant="outline" onClick={() => setHoldOpen(false)}>Cancel</Button><Button disabled={!holdReason.trim() || pending || !isRunning} onClick={() => controlTimer.mutate("hold")}>Put on hold</Button></DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
