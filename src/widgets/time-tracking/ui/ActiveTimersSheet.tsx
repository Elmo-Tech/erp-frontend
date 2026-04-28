"use client";

import { ReactNode } from "react";
import { Clock, Loader2, Square, Timer, User } from "lucide-react";
import { toast } from "sonner";
import type { ActiveTimer } from "@/entities/time-entry/model/types";
import { useActiveTimers, useStopTimerAdmin } from "@/features/time-entries/model/use-time-entry-actions";
import { formatMinutesCompact, getTrackableTypeLabel } from "@/shared/lib/time";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { Separator } from "@/shared/ui/separator";

interface ActiveTimersSheetProps {
	children: ReactNode;
}

export function ActiveTimersSheet({ children }: ActiveTimersSheetProps) {
	const activeTimersQuery = useActiveTimers();
	const stopTimer = useStopTimerAdmin();
	const activeTimers = activeTimersQuery.data ?? [];

	const handleStopTimer = async (timer: ActiveTimer) => {
		try {
			await stopTimer.mutateAsync(timer.timeEntryId);
			toast.success(`Stopped timer for ${timer.userName}`);
		} catch {
			toast.error("Failed to stop timer");
		}
	};

	return (
		<Sheet>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent className="w-[420px]!">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<Timer className="size-4" />
						Active timers
						{activeTimers.length > 0 && <Badge variant="secondary">{activeTimers.length}</Badge>}
					</SheetTitle>
					<SheetDescription>Running timers across the team.</SheetDescription>
				</SheetHeader>
				<Separator />
				<ScrollArea className="min-h-0 flex-1 px-4">
					{activeTimersQuery.isLoading ? (
						<div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							Loading active timers
						</div>
					) : activeTimers.length === 0 ? (
						<div className="py-8 text-sm text-muted-foreground">No active timers.</div>
					) : (
						<div className="space-y-2 py-3">
							{activeTimers.map((timer) => (
								<div
									key={timer.timeEntryId}
									className="rounded-md border p-3"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="flex items-center gap-2 text-sm font-medium">
												<User className="size-3.5 text-muted-foreground" />
												<span className="truncate">{timer.userName}</span>
											</div>
											<p className="mt-1 truncate text-xs text-muted-foreground">{timer.trackableDisplayName}</p>
										</div>
										<Badge variant="outline">{getTrackableTypeLabel(timer.trackableType)}</Badge>
									</div>
									<div className="mt-3 flex items-center justify-between gap-3">
										<div className="flex items-center gap-1 font-mono text-sm tabular-nums">
											<Clock className="size-3.5 text-muted-foreground" />
											{formatMinutesCompact(timer.elapsedMinutes)}
										</div>
										<Button
											type="button"
											variant="destructive"
											size="sm"
											onClick={() => handleStopTimer(timer)}
											disabled={stopTimer.isPending}
										>
											<Square data-icon="inline-start" />
											Stop
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}

