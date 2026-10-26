"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, Play, Square, AlertCircle, Timer } from "lucide-react";
import { useActiveTimers, useStopTimerAdmin } from "@/features/sales/hooks";
import { ActiveTimer } from "@/features/sales/types";
import { notifyApiError } from "@/lib/errorHandling";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface ActiveTimersSheetProps {
	children: React.ReactNode;
}

export function ActiveTimersSheet({ children }: ActiveTimersSheetProps) {
	const canStopTimers = useAuthStore((state) => state.hasPermission("edit_time_entries"));
	const [open, setOpen] = useState(false);
	const { data: activeTimers = [], isLoading, error } = useActiveTimers();
	const stopTimerMutation = useStopTimerAdmin();

	const handleStopTimer = async (timer: ActiveTimer) => {
		try {
			await stopTimerMutation.mutateAsync(timer.timeEntryId);
		} catch (error) {
			notifyApiError(error);
		}
	};

	const formatElapsedTime = (minutes: number): string => {
		const roundedMinutes = Math.round(minutes);
		const hours = Math.floor(roundedMinutes / 60);
		const remainingMinutes = roundedMinutes % 60;

		if (hours === 0) {
			return `${remainingMinutes}m`;
		}

		return `${hours}h ${remainingMinutes}m`;
	};

	const getTrackableTypeLabel = (type: string): string => {
		if (type.includes("Task")) return "Task";
		if (type.includes("Lead")) return "Lead";
		if (type.includes("Quotation")) return "Quotation";
		return "Unknown";
	};

	const getTrackableTypeColor = (type: string): string => {
		if (type.includes("Task")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
		if (type.includes("Lead")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		if (type.includes("Quotation")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
		return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	};

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}
		>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent
				side="right"
				className="w-[400px]!"
			>
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<Timer className="h-5 w-5" />
						Active Timers
						{activeTimers.length > 0 && (
							<Badge
								variant="secondary"
								className="ml-2"
							>
								{activeTimers.length}
							</Badge>
						)}
					</SheetTitle>
					<SheetDescription>Monitor and manage all currently running timers across the system.</SheetDescription>
				</SheetHeader>

				<Separator className="my-4" />

				<ScrollArea className="h-[calc(100vh-250px)] p-2">
					{isLoading ? (
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<Card
									key={i}
									className="animate-pulse"
								>
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<div className="h-4 bg-gray-200 rounded w-32"></div>
											<div className="h-6 bg-gray-200 rounded w-16"></div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<div className="h-3 bg-gray-200 rounded w-full"></div>
											<div className="h-3 bg-gray-200 rounded w-3/4"></div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : error ? (
						<Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
							<CardContent className="pt-6">
								<div className="flex items-center gap-2 text-red-600 dark:text-red-400">
									<AlertCircle className="h-4 w-4" />
									<span>Failed to load active timers</span>
								</div>
							</CardContent>
						</Card>
					) : activeTimers.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center text-muted-foreground">
									<Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p className="text-lg font-medium mb-2">No Active Timers</p>
									<p className="text-sm">All team members are currently offline or have stopped their timers.</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{activeTimers.map((timer) => (
								<Card
									key={timer.timeEntryId}
									className="relative"
								>
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<CardTitle className="text-base flex items-center gap-2">
												<User className="h-4 w-4" />
												{timer.userName}
											</CardTitle>
											<div className="flex items-center gap-2">
												<Badge className={cn("text-xs", getTrackableTypeColor(timer.trackableType))}>{getTrackableTypeLabel(timer.trackableType)}</Badge>
												<Badge
													variant="outline"
													className="text-xs font-mono"
												>
													{formatElapsedTime(timer.elapsedMinutes)}
												</Badge>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											<div>
												<p className="font-medium text-sm mb-1">Working on:</p>
												<p className="text-sm text-muted-foreground">{timer.trackableDisplayName}</p>
												{timer.targetMessage && <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">{timer.targetMessage}</p>}
											</div>

											<div className="flex items-center justify-between text-xs text-muted-foreground">
												<div className="flex items-center gap-1">
													<Play className="h-3 w-3" />
													Started: {new Date(timer.startTime).toLocaleTimeString()}
												</div>
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{Math.round(timer.elapsedMinutes)} minutes
												</div>
											</div>

											<Separator />

											{canStopTimers && <div className="flex justify-end">
												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleStopTimer(timer)}
													disabled={stopTimerMutation.isPending}
													className="gap-2"
												>
													<Square className="h-3 w-3" />
													{stopTimerMutation.isPending ? "Stopping..." : "Stop Timer"}
												</Button>
											</div>}
										</div>
									</CardContent>

									{/* Running indicator */}
									<div className="absolute top-2 right-2">
										<div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
									</div>
								</Card>
							))}
						</div>
					)}
				</ScrollArea>

				{activeTimers.length > 0 && (
					<div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
									<User className="h-4 w-4 text-primary" />
								</div>
								<div>
									<p className="text-sm font-medium">{activeTimers.length} Active</p>
									<p className="text-xs text-muted-foreground">Team members working</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
									<Clock className="h-4 w-4 text-green-600" />
								</div>
								<div className="text-right">
									<p className="text-sm font-medium">{formatElapsedTime(activeTimers.reduce((acc, t) => acc + t.elapsedMinutes, 0))}</p>
									<p className="text-xs text-muted-foreground">Total time today</p>
								</div>
							</div>
						</div>
						<Separator />
						<div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
							<div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
							<span>Live • Auto-refreshes every 30s</span>
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
