"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Activity, ExternalLink, ListTodo, Loader2, LogIn, LogOut, Menu, Moon, Play, Search, Settings, Square, Sun, Timer, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useActiveTimeEntryStore } from "@/features/time-tracking/model/active-time-entry.store";
import { elapsedSecondsSince, formatElapsedTime } from "@/features/time-tracking/model/timer-format";
import { useActivePersonalTimeEntry, usePersonalTasks, useTogglePersonalTaskTimer } from "@/features/personal-tasks/api/personal-tasks.api";
import { useActiveProjectTimeEntry, useMyActiveProjectTasks, useToggleTaskTimer } from "@/features/projects/api/execution.api";
import { useCheckInMutation, useCheckOutMutation, useTeamPulse, useTodayAttendance } from "@/features/hr/model/use-hr-actions";
import type { TeamPulseItem } from "@/entities/hr/model/types";
import { useSidebarStore } from "@/widgets/layout/model/sidebar.store";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { SystemNotificationsDropdown } from "@/widgets/system-notifications/ui/SystemNotificationsDropdown";
import { Can } from "@/shared/ui/Can";

export function DashboardNavbar() {
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-background/70 px-4 backdrop-blur-lg lg:px-6">
            <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" size="icon" onClick={toggleMobileOpen} className="lg:hidden" aria-label="Toggle menu">
                    <Menu />
                </Button>
                <Button type="button" variant="outline" size="sm" className="hidden w-64 justify-start text-muted-foreground md:flex" disabled>
                    <Search data-icon="inline-start" />
                    Search
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <AttendanceStatusPill />
                <ActiveTimerPill />
                <Can permission={["manage_all_projects", "manage_users"]}>
                    <TeamPulsePopover />
                </Can>

                <Button type="button" variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
                    {resolvedTheme === "dark" ? <Sun /> : <Moon />}
                </Button>

                <SystemNotificationsDropdown />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" className="gap-2 px-2">
                            <Avatar className="size-8">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="hidden flex-col items-start text-left md:flex">
                                <span className="text-sm font-medium">{user?.name || "User"}</span>
                                <span className="text-xs text-muted-foreground">{role || "guest"}</span>
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
                    className={hasActiveTimer ? "max-w-[46vw] border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 sm:max-w-[420px]" : "hidden sm:inline-flex"}
                    aria-label="Open task timer"
                >
                    <Timer className={hasActiveTimer ? "size-4 animate-pulse" : "size-4"} />
                    <span className="min-w-0 truncate text-xs font-semibold tabular-nums">{activeLabel}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="z-50 w-96 border bg-popover p-0 text-popover-foreground shadow-xl">
                <div className="border-b px-4 py-3">
                    <p className="text-sm font-medium">Task Timer</p>
                    <p className="text-xs text-muted-foreground">{activeSubLabel}</p>
                </div>

                {activeTimeEntry && projectId && taskId && (
                    <div className="border-b p-3">
                        <div className="rounded-md border bg-emerald-500/5 p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{taskName}</p>
                                    <p className="truncate text-xs text-muted-foreground">{projectName}</p>
                                    <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{projectElapsed}</p>
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
                        <div className="rounded-md border bg-emerald-500/5 p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{personalTaskName}</p>
                                    <p className="truncate text-xs text-muted-foreground">Personal</p>
                                    <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{personalElapsed}</p>
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
                <Button type="button" variant="outline" size="sm" className="border-emerald-400/40 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300" asChild>
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
            <PopoverContent align="end" className="z-50 w-96 border bg-popover p-0 text-popover-foreground shadow-xl">
                <TeamPulseContent />
            </PopoverContent>
        </Popover>
    );
}

function TeamPulseContent() {
    const pulseQuery = useTeamPulse();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const pulse = pulseQuery.data ?? [];
    const clockedInCount = pulse.filter((item) => item.status === "clocked_in").length;

    return (
        <div>
            <div className="border-b px-4 py-3">
                <p className="text-sm font-medium">Team Pulse</p>
                <p className="text-xs text-muted-foreground">
                    {clockedInCount} clocked in / {pulse.length} team members
                </p>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
                {pulseQuery.isLoading ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading pulse
                    </div>
                ) : pulse.length ? (
                    <div className="space-y-1">
                        {pulse.map((item) => (
                            <TeamPulseRow key={item.user?.id ?? item.attendanceId} item={item} now={now} />
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">No team members found.</div>
                )}
            </div>
        </div>
    );
}

function TeamPulseRow({ item, now }: { item: TeamPulseItem; now: number }) {
    const name = item.user?.name ?? "Someone";
    const elapsed = useMemo(() => formatElapsedTime(elapsedSecondsSince(item.timerStartedAt, now)), [item.timerStartedAt, now]);
    const message = item.activeTaskTitle ? `${name} is working on ${item.activeTaskTitle} (${elapsed})` : item.status === "clocked_in" ? `${name} is clocked in but idle` : `${name} is idle`;

    return (
        <div className="rounded-md px-3 py-2 hover:bg-muted/50">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-5">{message}</p>
                <span className={item.status === "clocked_in" ? "mt-1 size-2 rounded-full bg-emerald-500" : "mt-1 size-2 rounded-full bg-slate-300"} />
            </div>
            {item.activeProjectTitle && <p className="mt-0.5 text-xs text-muted-foreground">{item.activeProjectTitle}</p>}
        </div>
    );
}
