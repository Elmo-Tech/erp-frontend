"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { TrackableType } from "@/entities/time-entry/model/types";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { formatSecondsClock, getElapsedSeconds, normalizeTrackableType } from "@/shared/lib/time";
import { useRealtimeTimer } from "../model/use-timer-realtime";
import { useStartTimer, useStopTimer } from "../model/use-time-entry-actions";

interface TimeTrackerToggleProps {
	trackableId: number;
	trackableType: TrackableType;
	trackableDisplayName?: string;
	size?: "sm" | "default" | "icon";
	className?: string;
	disabled?: boolean;
}

export function TimeTrackerToggle({ trackableId, trackableType, trackableDisplayName, size = "sm", className, disabled = false }: TimeTrackerToggleProps) {
	const { activeTimer } = useRealtimeTimer();
	const startTimer = useStartTimer();
	const stopTimer = useStopTimer();
	const [now, setNow] = useState(() => Date.now());

	const isTimerForThisTrackable = useMemo(() => {
		return Boolean(activeTimer && activeTimer.trackableId === trackableId && normalizeTrackableType(activeTimer.trackableType) === trackableType);
	}, [activeTimer, trackableId, trackableType]);

	const isTimerRunningElsewhere = Boolean(activeTimer && !isTimerForThisTrackable);
	const isPending = startTimer.isPending || stopTimer.isPending;
	const elapsedSeconds = activeTimer && isTimerForThisTrackable ? getElapsedSeconds(activeTimer.startTime, now) : 0;

	useEffect(() => {
		if (!activeTimer || !isTimerForThisTrackable) {
			return;
		}

		const interval = window.setInterval(() => setNow(Date.now()), 1000);

		return () => window.clearInterval(interval);
	}, [activeTimer, isTimerForThisTrackable]);

	const handleToggle = async () => {
		try {
			if (isTimerForThisTrackable) {
				await stopTimer.mutateAsync();
				toast.success("Timer stopped");
				return;
			}

			if (isTimerRunningElsewhere) {
				toast.error("Stop the current timer before starting another one");
				return;
			}

			await startTimer.mutateAsync({ trackableId, trackableType });
			toast.success("Timer started");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Timer action failed";
			toast.error(message);
		}
	};

	if (size === "icon") {
		return (
			<Button
				type="button"
				variant={isTimerForThisTrackable ? "destructive" : "outline"}
				size="icon-sm"
				onClick={handleToggle}
				disabled={disabled || isPending || isTimerRunningElsewhere}
				className={className}
				aria-label={isTimerForThisTrackable ? "Stop timer" : "Start timer"}
			>
				{isPending ? <Loader2 className="animate-spin" /> : isTimerForThisTrackable ? <Square /> : <Play />}
			</Button>
		);
	}

	return (
		<Button
			type="button"
			variant={isTimerForThisTrackable ? "destructive" : "outline"}
			size={size}
			onClick={handleToggle}
			disabled={disabled || isPending || isTimerRunningElsewhere}
			className={cn("tabular-nums", className)}
		>
			{isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : isTimerForThisTrackable ? <Square data-icon="inline-start" /> : <Play data-icon="inline-start" />}
			{isTimerForThisTrackable ? formatSecondsClock(elapsedSeconds) : trackableDisplayName ? "Start timer" : "Start"}
		</Button>
	);
}
