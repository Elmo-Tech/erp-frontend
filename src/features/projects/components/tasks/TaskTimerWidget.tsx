"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@/features/dashboard/types/task";
import { Play, Pause, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useTimerStore } from "@/store/timerStore";

interface TaskTimerWidgetProps {
	task: Task;
}

export function TaskTimerWidget({ task }: TaskTimerWidgetProps) {
	const { activeTimer, setActiveTimer, isLoading: isChecking } = useTimerStore();
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	// Update elapsed time every second when timer is active
	useEffect(() => {
		if (!activeTimer) {
			setElapsedSeconds(0);
			return;
		}

		const startTime = new Date(activeTimer.startTime).getTime();

		const updateElapsed = () => {
			const now = Date.now();
			const elapsed = Math.floor((now - startTime) / 1000);
			setElapsedSeconds(elapsed);
		};

		updateElapsed();
		const interval = setInterval(updateElapsed, 1000);

		return () => clearInterval(interval);
	}, [activeTimer]);

	const formatTime = useCallback((seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}, []);

	// Check if this task's timer is active (ensure both are numbers for comparison)
	const isThisTaskTimer = activeTimer && Number(activeTimer.trackableId) === Number(task.taskId);
	const isOtherTaskTimer = activeTimer && Number(activeTimer.trackableId) !== Number(task.taskId);

	const handleStartTimer = async () => {
		setIsLoading(true);
		try {
			const response = await api.post<{ data: { timeEntryId: number; sessionId: string; startTime: string } }>("/time-entries/start", {
				trackableType: "task",
				trackableId: task.taskId,
			});

			// Update global store immediately
			setActiveTimer({
				timeEntryId: response.data.data.timeEntryId,
				sessionId: response.data.data.sessionId,
				startTime: response.data.data.startTime,
				trackableType: "App\\Models\\Task",
				trackableId: task.taskId,
				trackableDisplayName: task.title,
				trackableProjectId: task.projectId,
				isActive: true,
			});
			toast.success("Timer started");
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } };
			toast.error(err.response?.data?.message || "Failed to start timer");
		} finally {
			setIsLoading(false);
		}
	};

	const handleStopTimer = async () => {
		setIsLoading(true);
		try {
			await api.post("/time-entries/stop");
			// Update global store immediately
			setActiveTimer(null);
			toast.success("Timer stopped");
		} catch {
			toast.error("Failed to stop timer");
		} finally {
			setIsLoading(false);
		}
	};

	if (isChecking) {
		return (
			<div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
				<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
			</div>
		);
	}

	// Show different UI if another task's timer is running
	if (isOtherTaskTimer) {
		return (
			<div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-800">
						<Clock className="h-5 w-5 text-yellow-600" />
					</div>
					<div>
						<p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Another timer is running</p>
						<p className="text-xs text-yellow-600 dark:text-yellow-500">{activeTimer?.trackableDisplayName}</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleStopTimer}
					disabled={isLoading}
				>
					Stop & Switch
				</Button>
			</div>
		);
	}

	return (
		<div className={cn("flex items-center justify-between p-4 rounded-lg transition-colors", isThisTaskTimer ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-muted/50")}>
			<div className="flex items-center gap-3">
				<div className={cn("p-2 rounded-full", isThisTaskTimer ? "bg-green-100 dark:bg-green-800" : "bg-muted")}>
					<Clock className={cn("h-5 w-5", isThisTaskTimer ? "text-green-600" : "text-muted-foreground")} />
				</div>
				<div>
					<p className="text-sm font-medium">{isThisTaskTimer ? "Timer Running" : "Start Timer"}</p>
					<p className={cn("text-2xl font-mono font-bold", isThisTaskTimer ? "text-green-600" : "text-muted-foreground")}>{formatTime(elapsedSeconds)}</p>
				</div>
			</div>

			<Button
				variant={isThisTaskTimer ? "destructive" : "default"}
				size="lg"
				onClick={isThisTaskTimer ? handleStopTimer : handleStartTimer}
				disabled={isLoading}
				className="gap-2"
			>
				{isLoading ? (
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
				) : isThisTaskTimer ? (
					<>
						<Pause className="h-4 w-4" />
						Stop
					</>
				) : (
					<>
						<Play className="h-4 w-4" />
						Start
					</>
				)}
			</Button>
		</div>
	);
}
