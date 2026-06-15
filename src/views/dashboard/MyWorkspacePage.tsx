"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { CalendarClock, ExternalLink, LogIn, LogOut, Star, Timer, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { MEETING_TYPE_LABELS, useGetTodayMeetings, type PolyMeeting } from "@/entities/meetings";
import { useCheckInMutation, useCheckOutMutation, useMyPoints, useTodayAttendance } from "@/features/hr/model/use-hr-actions";
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
		<div className="grid gap-4 sm:grid-cols-2">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Star className="size-4 text-amber-500" />
						My Points
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-3xl font-semibold tabular-nums">{pointsQuery.isLoading ? "--" : points}</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Trophy className="size-4 text-emerald-500" />
						Completed Tasks
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-3xl font-semibold tabular-nums">{dashboardQuery.isLoading ? "--" : completed}</p>
					<p className="text-xs text-muted-foreground">Project + personal tasks</p>
				</CardContent>
			</Card>
		</div>
	);
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
				<DailySchedule />
				<PersonalTasksSummaryCard />
				<MyActiveProjectTasksCard />
			</div>
		</section>
	);
}
