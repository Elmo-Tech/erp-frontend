"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, Square, Clock, Timer, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useTimerStore, EntityType } from "@/store/timerStore";
import { useStartTimer, useStopTimer, useActiveTimer } from "@/features/sales/hooks/useTimeEntries";
import { TrackableType } from "@/features/sales/types/timeEntry";
import { cn } from "@/lib/utils";

interface TimerWidgetProps {
	className?: string;
	compact?: boolean;
	showEntityInfo?: boolean;
}

/**
 * TimerWidget component for global time tracking across entities
 * Requirements: 11.3, 11.4, 11.5 - Display entity info, elapsed time, start/stop functionality
 */
export const TimerWidget: React.FC<TimerWidgetProps> = ({ className = "", compact = false, showEntityInfo = true }) => {
	const [mounted, setMounted] = useState(false);

	// Timer store state
	const { isRunning, entityType, entityId, entityName, elapsedSeconds, startTimer: startStoreTimer, stopTimer: stopStoreTimer, tick, reset } = useTimerStore();

	// API hooks
	const startTimerMutation = useStartTimer();
	const stopTimerMutation = useStopTimer();
	const { data: activeTimer, refetch: refetchActiveTimer } = useActiveTimer();

	// Handle hydration
	useEffect(() => {
		setMounted(true);
	}, []);

	// Sync with server state on mount
	useEffect(() => {
		if (mounted && !isRunning && activeTimer?.isActive && activeTimer.timeEntry) {
			// Server has active timer but store doesn't - sync them
			const trackableType = activeTimer.timeEntry.trackableType.toLowerCase() as EntityType;
			if (trackableType && activeTimer.timeEntry.trackableDisplayName) {
				startStoreTimer(trackableType, activeTimer.timeEntry.trackableId, activeTimer.timeEntry.trackableDisplayName);
			}
		}
	}, [mounted, isRunning, activeTimer, startStoreTimer]);

	// Timer tick effect
	useEffect(() => {
		if (!mounted || !isRunning) return;

		const interval = setInterval(() => {
			tick();
		}, 1000);

		return () => clearInterval(interval);
	}, [mounted, isRunning, tick]);

	// Format elapsed time
	const formatTime = (seconds: number): string => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
		}
		return `${minutes}:${secs.toString().padStart(2, "0")}`;
	};

	// Get entity type display info
	const getEntityTypeInfo = (type: EntityType | null) => {
		switch (type) {
			case "task":
				return { label: "Task", icon: CheckCircle2, color: "text-blue-600" };
			case "quotation":
				return { label: "Quotation", icon: Clock, color: "text-purple-600" };
			case "lead":
				return { label: "Lead", icon: Timer, color: "text-green-600" };
			default:
				return { label: "Unknown", icon: AlertCircle, color: "text-gray-600" };
		}
	};

	// Handle start timer
	const handleStart = async (type: EntityType, id: number, name: string) => {
		try {
			// Convert entity type to trackable type for API
			const trackableTypeMap: Record<EntityType, TrackableType> = {
				task: TrackableType.TASK,
				quotation: TrackableType.QUOTATION,
				lead: TrackableType.LEAD,
			};

			await startTimerMutation.mutateAsync({
				trackableId: id,
				trackableType: trackableTypeMap[type],
			});

			// Update store after successful API call
			startStoreTimer(type, id, name);
		} catch (error) {
			console.error("Failed to start timer:", error);
			// Error notification would go here
		}
	};

	// Handle stop timer
	const handleStop = async () => {
		try {
			await stopTimerMutation.mutateAsync();
			// Update store after successful API call
			stopStoreTimer();
		} catch (error) {
			console.error("Failed to stop timer:", error);
			// Error notification would go here
		}
	};

	// Handle reset (stop and clear)
	const handleReset = async () => {
		if (isRunning) {
			await handleStop();
		}
		reset();
	};

	// Don't render until mounted (avoid hydration mismatch)
	if (!mounted) {
		return (
			<Card className={cn("w-full", className)}>
				<CardContent className="p-4">
					<div className="flex items-center justify-center">
						<Loader2 className="h-4 w-4 animate-spin" />
					</div>
				</CardContent>
			</Card>
		);
	}

	const entityInfo = getEntityTypeInfo(entityType);
	const EntityIcon = entityInfo.icon;

	if (compact) {
		return (
			<div className={cn("flex items-center gap-2 p-2 bg-muted/50 rounded-lg", className)}>
				{isRunning ? (
					<>
						<div className="flex items-center gap-1">
							<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
							<span className="text-sm font-mono">{formatTime(elapsedSeconds)}</span>
						</div>
						<Button
							size="icon-sm"
							variant="ghost"
							onClick={handleStop}
							disabled={stopTimerMutation.isPending}
						>
							<Square className="h-3 w-3" />
						</Button>
					</>
				) : (
					<div className="flex items-center gap-1 text-muted-foreground">
						<Clock className="h-3 w-3" />
						<span className="text-sm">No timer</span>
					</div>
				)}
			</div>
		);
	}

	return (
		<Card className={cn("w-full", className)}>
			<CardContent className="p-4 space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Timer className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium text-sm">Time Tracker</span>
					</div>
					{isRunning && (
						<Badge
							variant="secondary"
							className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
						>
							<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
							Active
						</Badge>
					)}
				</div>

				{/* Timer Display */}
				<div className="text-center space-y-2">
					<div className="text-3xl font-mono font-bold">{formatTime(elapsedSeconds)}</div>

					{isRunning && showEntityInfo && entityType && entityName && (
						<>
							<Separator />
							<div className="space-y-1">
								<div className="flex items-center justify-center gap-2">
									<EntityIcon className={cn("h-4 w-4", entityInfo.color)} />
									<span className="text-sm font-medium">{entityInfo.label}</span>
								</div>
								<p
									className="text-sm text-muted-foreground truncate"
									title={entityName}
								>
									{entityName}
								</p>
							</div>
						</>
					)}
				</div>

				{/* Controls */}
				<div className="flex items-center justify-center gap-2">
					{!isRunning ? (
						<div className="text-center space-y-2">
							<p className="text-sm text-muted-foreground">No active timer</p>
							<p className="text-xs text-muted-foreground">Start a timer from a task, quotation, or lead</p>
						</div>
					) : (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={handleStop}
								disabled={stopTimerMutation.isPending}
								className="min-w-[80px]"
							>
								{stopTimerMutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<>
										<Square className="h-4 w-4 mr-1" />
										Stop
									</>
								)}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleReset}
								disabled={stopTimerMutation.isPending}
							>
								Reset
							</Button>
						</>
					)}
				</div>

				{/* Status Messages */}
				{startTimerMutation.isError && <div className="text-xs text-destructive text-center">Failed to start timer</div>}
				{stopTimerMutation.isError && <div className="text-xs text-destructive text-center">Failed to stop timer</div>}
			</CardContent>
		</Card>
	);
};

// Compact version for toolbars/headers
export const CompactTimerWidget: React.FC<Omit<TimerWidgetProps, "compact">> = (props) => {
	return (
		<TimerWidget
			{...props}
			compact={true}
		/>
	);
};
