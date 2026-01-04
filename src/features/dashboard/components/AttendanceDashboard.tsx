/**
 * AttendanceDashboard Component
 * Widget for displaying today's attendance status and controls
 *
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, LogIn, LogOut, AlertCircle, CheckCircle2, Loader2, Coffee, Play } from "lucide-react";
import { useAttendanceStatus, useClockOut } from "../hooks/useAttendance";
import { useTimerStore } from "@/store/timerStore";
import { cn } from "@/lib/utils";

interface AttendanceDashboardProps {
	className?: string;
	compact?: boolean;
}

/**
 * AttendanceDashboard widget component
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */
export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ className = "", compact = false }) => {
	const { summary, isLoading, error, refetch, isClocked, isClockedOut, hasActiveTimer } = useAttendanceStatus();

	const clockOutMutation = useClockOut();
	const { activeTimer } = useTimerStore();
	const timerIsRunning = activeTimer?.isActive ?? false;

	// Handle manual clock out
	const handleClockOut = async () => {
		try {
			await clockOutMutation.mutateAsync();
		} catch (error) {
			console.error("Failed to clock out:", error);
		}
	};

	// Get status display info
	const getStatusInfo = () => {
		if (!isClocked) {
			return {
				icon: LogIn,
				color: "text-gray-500",
				bgColor: "bg-gray-100 dark:bg-gray-800",
				label: "Not Clocked In",
				description: "Start a timer to automatically clock in",
			};
		}

		if (isClockedOut) {
			return {
				icon: CheckCircle2,
				color: "text-green-600",
				bgColor: "bg-green-100 dark:bg-green-900",
				label: "Clocked Out",
				description: "Work day completed",
			};
		}

		if (hasActiveTimer || timerIsRunning) {
			return {
				icon: Play,
				color: "text-blue-600",
				bgColor: "bg-blue-100 dark:bg-blue-900",
				label: "Active Work",
				description: "Timer is running",
			};
		}

		return {
			icon: Coffee,
			color: "text-orange-500",
			bgColor: "bg-orange-100 dark:bg-orange-900",
			label: "On Break",
			description: "Clocked in but no active timer",
		};
	};

	// Format time for display
	const formatTime = (timeString: string | null): string => {
		if (!timeString) return "--:--";

		try {
			const date = new Date(timeString);
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			});
		} catch {
			return "--:--";
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<Card className={cn("w-full", className)}>
				<CardContent className="p-4">
					<div className="flex items-center justify-center">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span className="ml-2 text-sm text-muted-foreground">Loading attendance...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (error) {
		return (
			<Card className={cn("w-full border-destructive", className)}>
				<CardContent className="p-4">
					<div className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-4 w-4" />
						<span className="text-sm">Failed to load attendance</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => refetch()}
							className="ml-auto"
						>
							Retry
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	const statusInfo = getStatusInfo();
	const StatusIcon = statusInfo.icon;

	// Compact version for smaller spaces
	if (compact) {
		return (
			<div className={cn("flex items-center gap-3 p-3 bg-muted/50 rounded-lg", className)}>
				<div className={cn("p-2 rounded-full", statusInfo.bgColor)}>
					<StatusIcon className={cn("h-4 w-4", statusInfo.color)} />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">{statusInfo.label}</span>
						{(hasActiveTimer || timerIsRunning) && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
					</div>
					{isClocked && (
						<div className="text-xs text-muted-foreground">
							In: {formatTime(summary.clockInTime)}
							{summary.clockOutTime && ` • Out: ${formatTime(summary.clockOutTime)}`}
						</div>
					)}
				</div>
				{isClocked && !isClockedOut && (
					<Button
						variant="outline"
						size="sm"
						onClick={handleClockOut}
						disabled={clockOutMutation.isPending}
						className="shrink-0"
					>
						{clockOutMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
					</Button>
				)}
			</div>
		);
	}

	// Full widget version
	return (
		<Card className={cn("w-full", className)}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<Clock className="h-4 w-4 text-muted-foreground" />
					Today&apos;s Attendance
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Status Header */}
				<div className="flex items-center gap-3">
					<div className={cn("p-3 rounded-full", statusInfo.bgColor)}>
						<StatusIcon className={cn("h-5 w-5", statusInfo.color)} />
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<span className="font-medium">{statusInfo.label}</span>
							{(hasActiveTimer || timerIsRunning) && (
								<Badge
									variant="secondary"
									className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
								>
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
									Active
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground">{statusInfo.description}</p>
					</div>
				</div>

				{/* Time Information */}
				{isClocked ? (
					<div className="space-y-3">
						<Separator />

						{/* Clock Times */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<LogIn className="h-3 w-3 text-muted-foreground" />
									<span className="text-xs font-medium text-muted-foreground">Clock In</span>
								</div>
								<p className="text-sm font-mono">{formatTime(summary.clockInTime)}</p>
							</div>

							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<LogOut className="h-3 w-3 text-muted-foreground" />
									<span className="text-xs font-medium text-muted-foreground">Clock Out</span>
								</div>
								<p className="text-sm font-mono">{summary.clockOutTime ? formatTime(summary.clockOutTime) : "--:--"}</p>
							</div>
						</div>

						{/* Duration Information */}
						<div className="grid grid-cols-3 gap-3 text-center">
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground">Total</p>
								<p className="text-sm font-medium">{summary.totalDuration}</p>
							</div>
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground">Worked</p>
								<p className="text-sm font-medium text-green-600">{summary.workedDuration}</p>
							</div>
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground">Idle</p>
								<p className="text-sm font-medium text-orange-500">{summary.idleDuration}</p>
							</div>
						</div>

						{/* Clock Out Button */}
						{!isClockedOut && (
							<>
								<Separator />
								<Button
									variant="outline"
									onClick={handleClockOut}
									disabled={clockOutMutation.isPending}
									className="w-full"
								>
									{clockOutMutation.isPending ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											Clocking Out...
										</>
									) : (
										<>
											<LogOut className="h-4 w-4 mr-2" />
											Clock Out
										</>
									)}
								</Button>
							</>
						)}
					</div>
				) : (
					<div className="text-center py-4 space-y-2">
						<p className="text-sm text-muted-foreground">Not clocked in today</p>
						<p className="text-xs text-muted-foreground">Start any timer to automatically clock in</p>
					</div>
				)}

				{/* Error Messages */}
				{clockOutMutation.isError && <div className="text-xs text-destructive text-center">Failed to clock out. Please try again.</div>}
			</CardContent>
		</Card>
	);
};

// Compact version export for convenience
export const CompactAttendanceDashboard: React.FC<Omit<AttendanceDashboardProps, "compact">> = (props) => {
	return (
		<AttendanceDashboard
			{...props}
			compact={true}
		/>
	);
};

export default AttendanceDashboard;
