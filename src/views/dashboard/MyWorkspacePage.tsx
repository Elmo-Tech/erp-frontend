"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Activity, CalendarClock, ExternalLink, LogIn, LogOut, Star, Timer, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { MEETING_TYPE_LABELS, useGetTodayMeetings, type PolyMeeting } from "@/entities/meetings";
import { useAttendanceSummary, useCheckInMutation, useCheckOutMutation, useMyPoints, useTodayAttendance } from "@/features/hr/model/use-hr-actions";
import { PersonalTasksSummaryCard } from "@/features/personal-tasks/ui/PersonalTasksSummaryCard";
import { useMyActiveProjectTasks } from "@/features/projects/api/execution.api";
import { MyActiveProjectTasksCard } from "@/views/dashboard/MyActiveProjectTasksCard";
import { useDashboardOverview } from "@/widgets/dashboard-management/model/dashboard.api";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

function formatTime(value: string | null | undefined) {
	if (!value) return "--:--";
	return format(new Date(value), "hh:mm a");
}

function formatDate(value: string | null | undefined) {
	if (!value) return "No due date";
	return format(new Date(value), "dd MMM");
}

function meetingHref(meeting: PolyMeeting): string | null {
	if (!meeting.modelId) return null;
	if (meeting.modelType === "project") return `/dashboard/projects/${meeting.modelId}`;
	if (meeting.modelType === "client") return `/dashboard/clients/${meeting.modelId}/overview`;
	if (meeting.modelType === "lead") return `/dashboard/leads/${meeting.modelId}`;
	return null;
}

function AttendanceControl() {
	const todayQuery = useTodayAttendance();
	const checkIn = useCheckInMutation();
	const checkOut = useCheckOutMutation();
	const today = todayQuery.data;
	const checkedInAt = today?.clockIn;

	const handleCheckIn = () => {
		checkIn.mutate(undefined, {
			onSuccess: () => toast.success("Checked in successfully."),
			onError: () => toast.error("Check-in failed."),
		});
	};

	const handleCheckOut = () => {
		checkOut.mutate(undefined, {
			onSuccess: () => toast.success("Checked out successfully."),
			onError: () => toast.error("Check-out failed."),
		});
	};

	return (
		<Card className="border-primary/20 bg-primary/4">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<Timer className="size-4 text-primary" />
					Attendance Control
				</CardTitle>
			</CardHeader>
			<CardContent>
				{todayQuery.isLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-11 w-36" />
					</div>
				) : (
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="space-y-2">
							<p className="text-3xl font-semibold tracking-tight tabular-nums">{checkedInAt ? formatTime(checkedInAt) : "Ready"}</p>
							{checkedInAt ? (
								<div className="flex flex-wrap items-center gap-2">
									<Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Checked in at {formatTime(checkedInAt)}</Badge>
									{today?.clockOut ? <span className="text-sm text-muted-foreground">Checked out at {formatTime(today.clockOut)}</span> : null}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">Not checked in</p>
							)}
						</div>

						{today?.isClockedIn ? (
							<Button
								type="button"
								size="lg"
								variant="destructive"
								className="gap-2"
								onClick={handleCheckOut}
								disabled={checkOut.isPending}
							>
								<LogOut className="size-4" />
								{checkOut.isPending ? "Checking Out" : "Check Out"}
							</Button>
						) : !checkedInAt ? (
							<Button
								type="button"
								size="lg"
								className="gap-2"
								onClick={handleCheckIn}
								disabled={checkIn.isPending || Boolean(today?.clockOut)}
							>
								<LogIn className="size-4" />
								{checkIn.isPending ? "Checking In" : "Check In"}
							</Button>
						) : null}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function DailySchedule() {
	const router = useRouter();
	const meetingsQuery = useGetTodayMeetings();
	const meetings = meetingsQuery.data ?? [];
	const currentUserId = useAuthStore((s) => s.user?.userId);
	const tasksQuery = useMyActiveProjectTasks();
	const now = new Date();
	const soon = new Date();
	soon.setDate(now.getDate() + 2);
	const urgentTasks = (tasksQuery.data ?? [])
		.filter((task) => task.assigneeId === currentUserId)
		.filter((task) => task.dueDate && new Date(`${task.dueDate}T23:59:59`) <= soon)
		.slice(0, 5);

	return (
		<Card className="lg:col-span-2">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<CalendarClock className="size-4 text-muted-foreground" />
					Daily Brief
				</CardTitle>
			</CardHeader>
			<CardContent>
				{meetingsQuery.isLoading || tasksQuery.isLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				) : meetings.length || urgentTasks.length ? (
					<div className="grid gap-3 lg:grid-cols-2">
						<div className="space-y-2">
							<p className="text-xs font-semibold uppercase text-muted-foreground">Meetings</p>
							{meetings.length ? meetings.map((meeting) => {
								const href = meetingHref(meeting);
								const detail = meeting.locationDetails || meeting.description;

								return (
									<div
										key={meeting.id}
										className="flex min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2"
									>
										<div className="min-w-0">
											<p className="truncate text-sm font-medium">{meeting.title}</p>
											<p className="truncate text-xs text-muted-foreground">
												{MEETING_TYPE_LABELS[meeting.meetingType] ?? meeting.meetingType} / {meeting.subjectName ?? meeting.modelType}
											</p>
											{detail ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{detail}</p> : null}
										</div>
										<div className="flex shrink-0 items-center gap-2">
											<span className="text-xs tabular-nums text-muted-foreground">{formatTime(meeting.scheduledAt)}</span>
											{href ? (
												<Button
													type="button"
													size="icon"
													variant="ghost"
													className="size-7"
													onClick={() => router.push(href)}
													aria-label={`Open ${meeting.modelType}`}
												>
													<ExternalLink className="size-3.5" />
												</Button>
											) : null}
										</div>
									</div>
								);
							}) : <div className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">No meetings today.</div>}
						</div>
						<div className="space-y-2">
							<p className="text-xs font-semibold uppercase text-muted-foreground">Urgent Tasks</p>
							{urgentTasks.length ? urgentTasks.map((task) => (
								<div
									key={task.taskId}
									className="flex min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2"
								>
									<div className="min-w-0">
										<p className="truncate text-sm font-medium">{task.title}</p>
										<p className="truncate text-xs text-muted-foreground">{task.project?.title ?? "Project"}</p>
									</div>
									<span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatDate(task.dueDate)}</span>
								</div>
							)) : <div className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">No urgent tasks.</div>}
						</div>
					</div>
				) : (
					<div className="flex min-h-28 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">No meetings or urgent tasks today.</div>
				)}
			</CardContent>
		</Card>
	);
}

function QuickStats() {
	const pointsQuery = useMyPoints();
	const dashboardQuery = useDashboardOverview();
	const points = pointsQuery.data?.data?.reduce((sum, entry) => sum + entry.points, 0) ?? 0;
	const completed = dashboardQuery.data?.personal_tasks?.summary.completed ?? 0;

	return (
		<div className="grid overflow-hidden rounded-lg border bg-card sm:grid-cols-2 sm:divide-x">
			<div className="p-4">
				<div className="flex items-center justify-between gap-2">
					<p className="text-sm font-medium">
						My Points
					</p>
						<Star className="size-4 text-amber-500" />
				</div>
				<div className="mt-3">
					<p className="text-3xl font-semibold tabular-nums">{pointsQuery.isLoading ? "--" : points}</p>
					<p className="text-xs text-muted-foreground">Net across recent transactions</p>
				</div>
			</div>
			<div className="border-t p-4 sm:border-t-0">
				<div className="flex items-center justify-between gap-2">
					<p className="text-sm font-medium">
						Completed Tasks
					</p>
						<Trophy className="size-4 text-emerald-500" />
				</div>
				<div className="mt-3">
					<p className="text-3xl font-semibold tabular-nums">{dashboardQuery.isLoading ? "--" : completed}</p>
					<p className="text-xs text-muted-foreground">Project + personal tasks</p>
				</div>
			</div>
		</div>
	);
}

function WeeklyWorkRhythm() {
	const summaryQuery = useAttendanceSummary("week");
	const summary = summaryQuery.data;
	const daily = summary?.daily ?? [];
	const coverage = summary?.expectedMinutes ? Math.min(100, Math.round((summary.actualWorkedMinutes / summary.expectedMinutes) * 100)) : 0;

	return (
		<div className="overflow-hidden rounded-lg border bg-card lg:col-span-2">
			<div className="flex items-start justify-between gap-3 border-b px-5 py-4">
				<div><h2 className="text-sm font-semibold">Weekly work rhythm</h2><p className="mt-1 text-xs text-muted-foreground">Logged time compared with expected hours on recorded days</p></div>
				<Activity className="size-4 text-primary" />
			</div>
			{summaryQuery.isLoading ? (
				<div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_260px]"><Skeleton className="h-36" /><Skeleton className="h-36" /></div>
			) : (
				<div className="grid md:grid-cols-[minmax(0,1fr)_280px]">
					<div className="min-w-0 p-5">
						{daily.length ? <WorkloadBars days={daily} /> : <div className="flex h-36 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">No attendance recorded this week.</div>}
					</div>
					<div className="grid grid-cols-3 border-t md:grid-cols-1 md:border-l md:border-t-0 md:divide-y">
						<WorkMetric label="Coverage" value={`${coverage}%`} detail="of expected time" />
						<WorkMetric label="Late" value={`${summary?.lateMinutes ?? 0}m`} detail="this week" />
						<WorkMetric label="Stopped" value={formatDuration(summary?.stoppedMinutes ?? 0)} detail="without logged work" />
					</div>
				</div>
			)}
		</div>
	);
}

function WorkloadBars({ days }: { days: Array<{ date: string; expectedMinutes: number; actualWorkedMinutes: number }> }) {
	return (
		<div className="flex h-36 items-end justify-around gap-3 border-b px-2">
			{days.map((day) => {
				const ratio = day.expectedMinutes ? day.actualWorkedMinutes / day.expectedMinutes : 0;
				return (
					<div key={day.date} className="flex h-full min-w-8 flex-1 flex-col items-center justify-end gap-2">
						<div className="relative h-24 w-full max-w-8 overflow-hidden rounded-t-sm bg-muted" title={`${formatDuration(day.actualWorkedMinutes)} logged / ${formatDuration(day.expectedMinutes)} expected`}>
							<div className="absolute inset-x-0 bottom-0 bg-primary transition-[height] duration-200 motion-reduce:transition-none" style={{ height: `${Math.min(100, Math.round(ratio * 100))}%` }} />
						</div>
						<span className="text-[11px] text-muted-foreground">{format(new Date(`${day.date}T00:00:00`), "EEE")}</span>
					</div>
				);
			})}
		</div>
	);
}

function WorkMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
	return <div className="px-4 py-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p><p className="text-[11px] text-muted-foreground">{detail}</p></div>;
}

function formatDuration(minutes: number) {
	return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function MyWorkspacePage() {
	return (
		<section className="space-y-5">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">My Workspace</h1>
				<p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, dd MMM yyyy")}</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<AttendanceControl />
				<QuickStats />
				<WeeklyWorkRhythm />
				<DailySchedule />
				<PersonalTasksSummaryCard />
				<MyActiveProjectTasksCard />
			</div>
		</section>
	);
}
