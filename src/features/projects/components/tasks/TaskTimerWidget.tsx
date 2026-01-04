"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@/features/dashboard/types/task";
import { Play, Pause, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";

interface TaskTimerWidgetProps {
	task: Task;
}

interface ActiveTimer {
	timeEntryId: number;
	startTime: string;
	trackableType: string;
	trackableId: number;
}

export function TaskTimerWidget({ task }: TaskTimerWidgetProps) {
	const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isChecking, setIsChecking] = useState(true);

	// Check for active timer on mount
	useEffect(() => {
		const checkActiveTimer = async () => {
			try {
				const response = await api.get<{ data: ActiveTimer | null }>("/time-entries/active");
				const timer = response.data.data;
				if (timer && timer.trackableType === "App\\Models\\Task" && timer.trackableId === task.taskId) {
					setActiveTimer(timer);
				} else {
					setActiveTimer(null);
				}
			} catch {
				// No active timer
				setActiveTimer(null);
			} finally {
				setIsChecking(false);
			}
		};

		checkActiveTimer();
	}, [task.taskId]);

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

	const handleStartTimer = async () => {
		setIsLoading(true);
		try {
			const response = await api.post<{ data: { timeEntryId: number; startTime: string } }>("/time-entries/start", {
				trackableType: "task",
				trackableId: task.taskId,
			});
			setActiveTimer({
				timeEntryId: response.data.data.timeEntryId,
				startTime: response.data.data.startTime,
				trackableType: "App\\Models\\Task",
				trackableId: task.taskId,
			});
			toast.success("Timer started");
		} catch {
			toast.error("Failed to start timer");
		} finally {
			setIsLoading(false);
		}
	};

	const handleStopTimer = async () => {
		if (!activeTimer) return;

		setIsLoading(true);
		try {
			await api.post("/time-entries/stop", {
				timeEntryId: activeTimer.timeEntryId,
			});
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

	const isTimerActive = !!activeTimer;

	return (
		<div className={cn("flex items-center justify-between p-4 rounded-lg transition-colors", isTimerActive ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-muted/50")}>
			<div className="flex items-center gap-3">
				<div className={cn("p-2 rounded-full", isTimerActive ? "bg-green-100 dark:bg-green-800" : "bg-muted")}>
					<Clock className={cn("h-5 w-5", isTimerActive ? "text-green-600" : "text-muted-foreground")} />
				</div>
				<div>
					<p className="text-sm font-medium">{isTimerActive ? "Timer Running" : "Start Timer"}</p>
					<p className={cn("text-2xl font-mono font-bold", isTimerActive ? "text-green-600" : "text-muted-foreground")}>{formatTime(elapsedSeconds)}</p>
				</div>
			</div>

			<Button
				variant={isTimerActive ? "destructive" : "default"}
				size="lg"
				onClick={isTimerActive ? handleStopTimer : handleStartTimer}
				disabled={isLoading}
				className="gap-2"
			>
				{isLoading ? (
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
				) : isTimerActive ? (
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
