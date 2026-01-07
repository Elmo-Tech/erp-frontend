"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, Square, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useTimerStore } from "@/store/timerStore";
import { getElapsedSeconds, formatDuration } from "@/lib/dateUtils";

export function NavbarTimer({ className }: { className?: string }) {
	const router = useRouter();
	const { activeTimer, setActiveTimer, isLoading } = useTimerStore();
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [isStopping, setIsStopping] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

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

	const handleStopTimer = async () => {
		setIsStopping(true);
		try {
			await api.post("/time-entries/stop");
			setActiveTimer(null);
			toast.success("Timer stopped");
		} catch {
			toast.error("Failed to stop timer");
		} finally {
			setIsStopping(false);
		}
	};

	const handleNavigateToTask = () => {
		if (activeTimer && activeTimer.trackableType.includes("Task")) {
			router.push(`/dashboard/tasks?highlight=${activeTimer.trackableId}`);
		}
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
							onClick={handleStopTimer}
							disabled={isStopping}
							className="h-7 w-7"
						>
							{isStopping ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3 text-red-500" />}
						</Button>
					</>
				) : (
					<div className="flex items-center gap-1 text-muted-foreground">
						<Clock className="h-3 w-3" />
						<span className="text-sm">No timer</span>
					</div>
				)}
			</div>
		</TooltipProvider>
	);
}
