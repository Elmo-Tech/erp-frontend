"use client";

import { Fragment, useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/shared/ui/breadcrumb";
import { getBreadcrumbs } from "@/widgets/layout/model/breadcrumbs";
import { Activity, ExternalLink, ListTodo, Loader2, LogIn, LogOut, Menu, Play, Search, Square, Timer, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useActiveTimeEntryStore } from "@/features/time-tracking/model/active-time-entry.store";
import { elapsedSecondsSince, formatElapsedTime } from "@/features/time-tracking/model/timer-format";
import { useActivePersonalTimeEntry, useEmployeePersonalTasks, usePersonalTasks, useStopPersonalTimeEntry, useTogglePersonalTaskTimer, useUpdatePersonalTask, type PersonalTask } from "@/features/personal-tasks/api/personal-tasks.api";
import { useActiveProjectTimeEntry, useMyActiveProjectTasks, useToggleTaskTimer } from "@/features/projects/api/execution.api";
import { useCheckInMutation, useCheckOutMutation, useTeamPulse, useTodayAttendance } from "@/features/hr/model/use-hr-actions";
import type { TeamPulseItem } from "@/entities/hr/model/types";
import { useSidebarStore } from "@/widgets/layout/model/sidebar.store";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { SystemNotificationsDropdown } from "@/widgets/system-notifications/ui/SystemNotificationsDropdown";
import { Can } from "@/shared/ui/Can";
import { cn } from "@/shared/lib/utils";
import { TaskPriorityColors, TaskPriorityLabels } from "@/shared/lib/statusHelpers";
import { ThemeToggle } from "./ThemeToggle";

export function DashboardNavbar() {
    const router = useRouter();
    const { user, role, logout } = useAuthStore();
    const { toggleMobileOpen } = useSidebarStore();
    const initials = user?.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
        : "U";

    const logoutMutation = useMutation({
        mutationFn: () => authApi.logout(),
        onSettled: () => {
            logout();
            router.push("/login");
            router.refresh();
        },
    });

    return (
		<header className="glass sticky top-0 z-30 flex h-(--topbar-height) items-center justify-between gap-3 border-b px-4 text-foreground sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
                <Button type="button" variant="ghost" size="icon-sm" onClick={toggleMobileOpen} className="-ml-1 lg:hidden" aria-label="Open navigation">
                    <Menu />
                </Button>
				<TopbarBreadcrumbs />
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
				<Button type="button" variant="outline" size="sm" className="hidden w-56 justify-start font-normal text-muted-foreground disabled:opacity-70 2xl:flex" disabled>
                    <Search data-icon="inline-start" />
                    Search
                </Button>
                <AttendanceStatusPill />
                <ActiveTimerPill />
				<div className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

                <Can permission="view_team_pulse">
                    <TeamPulsePopover />
                </Can>

				<ThemeToggle />

                <SystemNotificationsDropdown />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" className="h-9 gap-2.5 rounded-lg px-1.5 md:pr-2.5" aria-label="Account menu">
                            <Avatar className="size-7.5">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback className="bg-navy text-[0.6875rem] font-semibold text-white">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="hidden max-w-36 flex-col items-start text-left leading-tight md:flex">
                                <span className="w-full truncate text-[0.8125rem] font-medium">{user?.name || "User"}</span>
                                <span className="w-full truncate text-[0.6875rem] font-normal text-muted-foreground capitalize">{role || "guest"}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span>{user?.name}</span>
                                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile">
                                <User data-icon="inline-start" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
                            <LogOut data-icon="inline-start" />
                            {logoutMutation.isPending ? "Signing out..." : "Sign out"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

function TopbarBreadcrumbs() {
    const pathname = usePathname();
    const crumbs = getBreadcrumbs(pathname);
    const current = crumbs[crumbs.length - 1];

    return (
        <Breadcrumb className="min-w-0">
            {/* Compact: current page only. */}
            <p className="truncate text-sm font-semibold text-foreground sm:hidden">{current?.label}</p>
            <BreadcrumbList className="hidden flex-nowrap gap-1.5 text-[0.8125rem] sm:flex sm:gap-2">
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;
                    return (
                        <Fragment key={`${crumb.label}-${index}`}>
                            {index > 0 && <BreadcrumbSeparator className={cn("text-muted-foreground/60", index === 1 && crumbs.length > 2 && "hidden md:block")} />}
                            <BreadcrumbItem className={cn("min-w-0", !isLast && index === 0 && crumbs.length > 2 && "hidden md:inline-flex")}>
                                {isLast ? (
                                    <BreadcrumbPage className="truncate font-medium">{crumb.label}</BreadcrumbPage>
                                ) : crumb.href ? (
                                    <BreadcrumbLink asChild className="truncate">
                                        <Link href={crumb.href}>{crumb.label}</Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <span className="truncate">{crumb.label}</span>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

function ActiveTimerPill() {
    const activeQuery = useActiveProjectTimeEntry();
    const tasksQuery = useMyActiveProjectTasks();
    const activePersonalQuery = useActivePersonalTimeEntry();
    const personalTasksQuery = usePersonalTasks();
    const setActiveTimeEntry = useActiveTimeEntryStore((s) => s.setActiveTimeEntry);
    const activeTimeEntry = useActiveTimeEntryStore((s) => s.activeTimeEntry);
    const toggleTimer = useToggleTaskTimer();
    const togglePersonalTimer = useTogglePersonalTaskTimer();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        setActiveTimeEntry(activeQuery.data ?? null);
    }, [activeQuery.data, setActiveTimeEntry]);

    useEffect(() => {
        if (!activeTimeEntry?.startTime && !activePersonalQuery.data?.startTime) return;

        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [activeTimeEntry?.startTime, activePersonalQuery.data?.startTime]);

    const projectId = activeTimeEntry?.projectId ?? activeTimeEntry?.project?.projectId ?? activeTimeEntry?.task?.projectId;
    const taskId = activeTimeEntry?.taskId;
    const taskName = activeTimeEntry?.task?.title ?? "Active task";
    const projectName = activeTimeEntry?.project?.title ?? "Project";
    const projectElapsed = formatElapsedTime(elapsedSecondsSince(activeTimeEntry?.startTime, now));
    const activePersonalEntry = activePersonalQuery.data;
    const personalTaskName = activePersonalEntry?.task?.title ?? personalTasksQuery.data?.find((task) => task.taskId === activePersonalEntry?.personalTaskId)?.title ?? "Personal task";
    const personalElapsed = formatElapsedTime(elapsedSecondsSince(activePersonalEntry?.startTime, now));
    const hasActiveTimer = Boolean(activeTimeEntry || activePersonalEntry);
    const activeLabel = activeTimeEntry ? `${projectElapsed} - ${taskName}` : activePersonalEntry ? `${personalElapsed} - ${personalTaskName}` : "Tasks";
    const activeSubLabel = activeTimeEntry ? `${projectName} / ${taskName}` : activePersonalEntry ? `Personal / ${personalTaskName}` : "No timer is running";

    const stopTimer = (event?: MouseEvent) => {
        event?.stopPropagation();
        if (!projectId || !taskId) return;
        toggleTimer.mutate({ projectId, taskId });
    };

    const stopPersonalTimer = (event?: MouseEvent) => {
        event?.stopPropagation();
        if (!activePersonalEntry?.personalTaskId) return;
        togglePersonalTimer.mutate(activePersonalEntry.personalTaskId);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={hasActiveTimer ? "outline" : "ghost"}
                    size="sm"
                    className={hasActiveTimer ? "max-w-[46vw] border-success/25 bg-success-soft text-success hover:bg-success-soft hover:text-success sm:max-w-[420px]" : "hidden sm:inline-flex"}
                    aria-label="Open task timer"
                >
                    <Timer className={hasActiveTimer ? "size-4 animate-pulse" : "size-4"} />
                    <span className="min-w-0 truncate text-xs font-semibold tabular-nums">{activeLabel}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="z-50 w-96 max-w-[calc(100vw-2rem)] p-0">
                <div className="border-b px-4 py-3">
                    <p className="text-sm font-medium">Task Timer</p>
                    <p className="text-xs text-muted-foreground">{activeSubLabel}</p>
                </div>

                {activeTimeEntry && projectId && taskId && (
                    <div className="border-b p-3">
                        <div className="rounded-md border bg-success-soft p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{taskName}</p>
                                    <p className="truncate text-xs text-muted-foreground">{projectName}</p>
                                    <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-success">{projectElapsed}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <Button type="button" variant="ghost" size="icon-sm" asChild>
                                        <Link href={`/dashboard/projects/${projectId}?taskId=${taskId}`} aria-label="Open active task">
                                            <ExternalLink className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button type="button" variant="destructive" size="icon-sm" onClick={stopTimer} disabled={toggleTimer.isPending} aria-label="Stop active timer">
                                        {toggleTimer.isPending ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activePersonalEntry && (
                    <div className="border-b p-3">
                        <div className="rounded-md border bg-success-soft p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{personalTaskName}</p>
                                    <p className="truncate text-xs text-muted-foreground">Personal</p>
                                    <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-success">{personalElapsed}</p>
                                </div>
                                <Button type="button" variant="destructive" size="icon-sm" onClick={stopPersonalTimer} disabled={togglePersonalTimer.isPending} aria-label="Stop personal timer">
                                    {togglePersonalTimer.isPending ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-h-80 overflow-y-auto p-2">
                    <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
                        <ListTodo className="size-3.5" />
                        My project tasks
                    </div>
                    {tasksQuery.isLoading ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            Loading tasks
                        </div>
                    ) : tasksQuery.data?.length ? (
                        <div className="space-y-1">
                            {tasksQuery.data.map((task) => {
                                const running = activeTimeEntry?.taskId === task.taskId;
                                return (
                                    <div key={task.taskId} className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-muted/50">
                                        <Link href={`/dashboard/projects/${task.projectId}?taskId=${task.taskId}`} className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{task.title}</p>
                                            <p className="truncate text-xs text-muted-foreground">{task.project?.title ?? "Project"}</p>
                                        </Link>
                                        <Button
                                            type="button"
                                            variant={running ? "destructive" : "outline"}
                                            size="icon-sm"
                                            disabled={toggleTimer.isPending}
                                            onClick={() => toggleTimer.mutate({ projectId: task.projectId, taskId: task.taskId })}
                                            aria-label={running ? "Stop task timer" : "Start task timer"}
                                        >
                                            {running ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">No assigned tasks.</div>
                    )}

                    <div className="mb-2 mt-4 flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
                        <ListTodo className="size-3.5" />
                        Personal tasks
                    </div>
                    {personalTasksQuery.isLoading ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            Loading personal tasks
                        </div>
                    ) : personalTasksQuery.data?.filter((task) => task.status !== "done").length ? (
                        <div className="space-y-1">
                            {personalTasksQuery.data
                                .filter((task) => task.status !== "done")
                                .map((task) => {
                                    const running = activePersonalEntry?.personalTaskId === task.taskId;
                                    return (
                                        <div key={task.taskId} className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-muted/50">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{task.title}</p>
                                                <p className="truncate text-xs text-muted-foreground">Personal</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant={running ? "destructive" : "outline"}
                                                size="icon-sm"
                                                disabled={togglePersonalTimer.isPending}
                                                onClick={() => togglePersonalTimer.mutate(task.taskId)}
                                                aria-label={running ? "Stop personal timer" : "Start personal timer"}
                                            >
                                                {running ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
                                            </Button>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">No personal tasks.</div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function formatAttendanceTime(value: string | null | undefined) {
    if (!value) return "--:--";

    return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatLoggedMinutes(minutes: number) {
    if (minutes <= 0) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatTaskDueDate(value: string | null | undefined) {
    if (!value) return "No due date";
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function personalTaskStatusLabel(task: PersonalTask) {
    if (task.status === "done") return "Done";
    if (task.status === "in_progress") return "In Progress";
    return "To Do";
}

function AttendanceStatusPill() {
    const todayQuery = useTodayAttendance();
    const checkIn = useCheckInMutation();
    const checkOut = useCheckOutMutation();
    const checkedInAt = todayQuery.data?.clockIn;

    if (todayQuery.isLoading) {
        return null;
    }

    if (checkedInAt && todayQuery.data?.isClockedIn) {
        return (
            <div className="hidden items-center gap-1 sm:flex">
                <Button type="button" variant="outline" size="sm" className="border-success/25 bg-success-soft text-xs text-success hover:bg-success-soft hover:text-success" asChild>
                    <Link href="/dashboard/hr/attendance">In {formatAttendanceTime(checkedInAt)}</Link>
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => checkOut.mutate()} disabled={checkOut.isPending}>
                    {checkOut.isPending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                    Check Out
                </Button>
            </div>
        );
    }

    return (
        <Button type="button" size="sm" className="hidden gap-2 sm:inline-flex" onClick={() => checkIn.mutate()} disabled={checkIn.isPending}>
            {checkIn.isPending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            Check-In
        </Button>
    );
}

function TeamPulsePopover() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="Team pulse">
                    <Activity />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="z-50 w-96 max-w-[calc(100vw-2rem)] p-0">
                <TeamPulseContent />
            </PopoverContent>
        </Popover>
    );
}

function TeamPulseContent() {
    const pulseQuery = useTeamPulse();
    const canViewEmployeePersonalTasks = useAuthStore((s) => s.hasPermission("manage_employees"));
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const pulse = useMemo(() => pulseQuery.data ?? [], [pulseQuery.data]);
    const selectedItem = useMemo(() => pulse.find((item) => item.user?.id === selectedUserId) ?? null, [pulse, selectedUserId]);
    const selectedEmployeeTasks = useEmployeePersonalTasks(selectedItem?.user?.id ?? 0, Boolean(selectedItem?.user?.id && canViewEmployeePersonalTasks));
    const stopPersonalTimeEntry = useStopPersonalTimeEntry();
    const updatePersonalTask = useUpdatePersonalTask();
    const clockedInCount = pulse.filter((item) => item.status === "clocked_in").length;

    const handleStopPersonalTimer = (entryId: number) => {
        stopPersonalTimeEntry.mutate(entryId, {
            onSuccess: () => toast.success("Personal timer stopped."),
            onError: () => toast.error("Failed to stop personal timer."),
        });
    };

    const handleTaskStatus = (task: PersonalTask, status: PersonalTask["status"]) => {
        updatePersonalTask.mutate(
            { taskId: task.taskId, payload: { status } },
            {
                onSuccess: () => toast.success("Personal task updated."),
                onError: () => toast.error("Failed to update personal task."),
            },
        );
    };

    return (
        <div>
            <div className="border-b px-4 py-3">
                <p className="text-sm font-medium">Team Pulse</p>
                <p className="text-xs text-muted-foreground">
                    {clockedInCount} clocked in / {pulse.length} team members
                </p>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
                {pulseQuery.isLoading ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading pulse
                    </div>
                ) : pulse.length ? (
                    <div className="space-y-1">
                        {pulse.map((item) => (
                            <TeamPulseRow
                                key={item.user?.id ?? item.attendanceId}
                                item={item}
                                now={now}
                                selected={item.user?.id === selectedUserId}
                                onSelect={() => setSelectedUserId((current) => (current === item.user?.id ? null : item.user?.id ?? null))}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">No team members found.</div>
                )}
            </div>
            {selectedItem?.user && (
                <div className="border-t p-3">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{selectedItem.user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{selectedItem.activeTaskTitle ? `Active: ${selectedItem.activeTaskTitle}` : "No active task"}</p>
                        </div>
                        {selectedItem.activeTaskSource === "personal" && selectedItem.activeTimeEntryId && (
                            <Can permission="manage_team_timers">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="shrink-0 gap-2"
                                    disabled={stopPersonalTimeEntry.isPending}
                                    onClick={() => handleStopPersonalTimer(selectedItem.activeTimeEntryId!)}
                                >
                                    {stopPersonalTimeEntry.isPending ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4" />}
                                    Stop
                                </Button>
                            </Can>
                        )}
                    </div>

                    {!canViewEmployeePersonalTasks ? (
                        <div className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">You need employee management permission to view personal tasks.</div>
                    ) : selectedEmployeeTasks.isLoading ? (
                        <div className="flex items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            Loading personal tasks
                        </div>
                    ) : selectedEmployeeTasks.data?.length ? (
                        <div className="max-h-64 space-y-2 overflow-y-auto">
                            {selectedEmployeeTasks.data.map((task) => (
                                <TeamPersonalTaskRow
                                    key={task.taskId}
                                    task={task}
                                    disabled={updatePersonalTask.isPending}
                                    onStatusChange={handleTaskStatus}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">No personal tasks for this team member.</div>
                    )}
                </div>
            )}
        </div>
    );
}

function TeamPulseRow({ item, now, selected, onSelect }: { item: TeamPulseItem; now: number; selected: boolean; onSelect: () => void }) {
    const name = item.user?.name ?? "Someone";
    const elapsed = useMemo(() => formatElapsedTime(elapsedSecondsSince(item.timerStartedAt, now)), [item.timerStartedAt, now]);
    const message = item.activeTaskTitle ? `${name} is working on ${item.activeTaskTitle} (${elapsed})` : item.status === "clocked_in" ? `${name} is clocked in but idle` : `${name} is idle`;

    return (
        <button type="button" className={cn("w-full rounded-md px-3 py-2 text-left hover:bg-muted/50", selected && "bg-muted")} onClick={onSelect}>
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-5">{message}</p>
				<span className={item.status === "clocked_in" ? "mt-1 size-2 rounded-full bg-success" : "mt-1 size-2 rounded-full bg-muted-foreground/40"} />
            </div>
            {item.activeProjectTitle && <p className="mt-0.5 text-xs text-muted-foreground">{item.activeProjectTitle}</p>}
        </button>
    );
}

function TeamPersonalTaskRow({ task, disabled, onStatusChange }: { task: PersonalTask; disabled: boolean; onStatusChange: (task: PersonalTask, status: PersonalTask["status"]) => void }) {
    const isDone = task.status === "done";

    return (
        <div className="rounded-md border px-3 py-2">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant={isDone ? "secondary" : "outline"} className="text-[10px]">
                            {personalTaskStatusLabel(task)}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", TaskPriorityColors[task.priority])}>
                            {TaskPriorityLabels[task.priority]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatTaskDueDate(task.dueDate)}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">{formatLoggedMinutes(task.totalLoggedMinutes)}</span>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {!isDone && (
                        <Can permission="manage_employees">
                            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onStatusChange(task, task.status === "todo" ? "in_progress" : "done")}>
                                {task.status === "todo" ? "In Progress" : "Done"}
                            </Button>
                        </Can>
                    )}
                </div>
            </div>
        </div>
    );
}
