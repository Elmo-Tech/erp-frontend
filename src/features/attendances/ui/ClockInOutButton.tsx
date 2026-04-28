"use client";

import { LogOut, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useRealtimeTimer } from "@/features/time-entries/model/use-timer-realtime";
import { useAttendanceStatus, useClockOut } from "../model/use-attendance-actions";

interface ClockInOutButtonProps {
	className?: string;
}

export function ClockInOutButton({ className }: ClockInOutButtonProps) {
	const { isClocked, isClockedOut, hasActiveTimer } = useAttendanceStatus();
	const { activeTimer } = useRealtimeTimer();
	const clockOut = useClockOut();
	const timerRunning = Boolean(activeTimer) || hasActiveTimer;

	const handleClockOut = async () => {
		if (timerRunning) {
			toast.error("Stop the active timer before clocking out");
			return;
		}

		try {
			await clockOut.mutateAsync();
			toast.success("Clocked out");
		} catch {
			toast.error("Failed to clock out");
		}
	};

	if (!isClocked) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className={className}
						disabled
					>
						<Play data-icon="inline-start" />
						Start a timer
					</Button>
				</TooltipTrigger>
				<TooltipContent>Starting a timer clocks you in automatically.</TooltipContent>
			</Tooltip>
		);
	}

	if (isClockedOut) {
		return (
			<Button
				type="button"
				variant="outline"
				size="sm"
				className={className}
				disabled
			>
				Clocked out
			</Button>
		);
	}

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			onClick={handleClockOut}
			disabled={clockOut.isPending}
			className={className}
		>
			{clockOut.isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <LogOut data-icon="inline-start" />}
			Clock out
		</Button>
	);
}

