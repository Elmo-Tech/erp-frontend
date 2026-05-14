'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Activity, Loader2, LogIn, LogOut, Menu, Moon, Pause, Search, Settings, Square, Sun, Timer, User } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/entities/user/model/auth.store';
import { useActiveTimeEntryStore } from '@/features/time-tracking/model/active-time-entry.store';
import { elapsedSecondsSince, formatElapsedTime } from '@/features/time-tracking/model/timer-format';
import { useActiveProjectTimeEntry, useToggleTaskTimer } from '@/features/projects/api/execution.api';
import { useCheckInMutation, useTeamPulse, useTodayAttendance } from '@/features/hr/model/use-hr-actions';
import type { TeamPulseItem } from '@/entities/hr/model/types';
import { useSidebarStore } from '@/widgets/layout/model/sidebar.store';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { SystemNotificationsDropdown } from '@/widgets/system-notifications/ui/SystemNotificationsDropdown';
import { Can } from '@/shared/ui/Can';

export function DashboardNavbar() {
	const router = useRouter();
	const { resolvedTheme, setTheme } = useTheme();
	const { user, role, logout } = useAuthStore();
	const { toggleMobileOpen } = useSidebarStore();
	const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "U";

	const logoutMutation = useMutation({
		mutationFn: () => authApi.logout(),
		onSettled: () => {
			logout();
			router.push('/login');
			router.refresh();
		},
	});

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-background/70 px-4 backdrop-blur-lg lg:px-6">
			<div className="flex items-center gap-3">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={toggleMobileOpen}
					className="lg:hidden"
					aria-label="Toggle menu"
				>
					<Menu />
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="hidden w-64 justify-start text-muted-foreground md:flex"
					disabled
				>
					<Search data-icon="inline-start" />
					Search
				</Button>
			</div>

			<div className="flex items-center gap-2">
				<AttendanceStatusPill />
				<ActiveTimerPill />
				<Can permission={['manage_all_projects', 'manage_users']}>
					<TeamPulsePopover />
				</Can>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
					aria-label="Toggle theme"
				>
					{resolvedTheme === 'dark' ? <Sun /> : <Moon />}
				</Button>

				<SystemNotificationsDropdown />

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							className="gap-2 px-2"
						>
							<Avatar className="size-8">
								<AvatarImage
									src={user?.avatar}
									alt={user?.name}
								/>
								<AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback>
							</Avatar>
							<div className="hidden flex-col items-start text-left md:flex">
								<span className="text-sm font-medium">{user?.name || 'User'}</span>
								<span className="text-xs text-muted-foreground">{role || 'guest'}</span>
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-56"
					>
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
						<DropdownMenuItem asChild>
							<Link href="/dashboard/settings">
								<Settings data-icon="inline-start" />
								Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => logoutMutation.mutate()}
							disabled={logoutMutation.isPending}
						>
							<LogOut data-icon="inline-start" />
							{logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}

function ActiveTimerPill() {
	const activeQuery = useActiveProjectTimeEntry();
	const setActiveTimeEntry = useActiveTimeEntryStore((s) => s.setActiveTimeEntry);
	const activeTimeEntry = useActiveTimeEntryStore((s) => s.activeTimeEntry);
	const toggleTimer = useToggleTaskTimer();
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		setActiveTimeEntry(activeQuery.data ?? null);
	}, [activeQuery.data, setActiveTimeEntry]);

	useEffect(() => {
		if (!activeTimeEntry?.startTime) return;

		const id = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(id);
	}, [activeTimeEntry?.startTime]);

	const projectId = activeTimeEntry?.projectId ?? activeTimeEntry?.project?.projectId ?? activeTimeEntry?.task?.projectId;
	const taskId = activeTimeEntry?.taskId;
	const taskName = activeTimeEntry?.task?.title ?? 'Active task';
	const elapsed = formatElapsedTime(elapsedSecondsSince(activeTimeEntry?.startTime, now));

	if (!activeTimeEntry || !taskId || !projectId) {
		return null;
	}

	const stopTimer = () => {
		toggleTimer.mutate({ projectId, taskId });
	};

	return (
		<div className="flex max-w-[46vw] items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.24)] dark:text-emerald-300 sm:max-w-[520px]">
			<Timer className="size-4 shrink-0 animate-pulse" />
			<span className="min-w-0 truncate text-sm font-semibold tabular-nums">
				{elapsed} - {taskName}
			</span>
			<div className="ml-1 flex shrink-0 items-center gap-1">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-7 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
					onClick={stopTimer}
					disabled={toggleTimer.isPending}
					aria-label="Pause active timer"
				>
					{toggleTimer.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Pause className="size-3.5" />}
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-7 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
					onClick={stopTimer}
					disabled={toggleTimer.isPending}
					aria-label="Stop active timer"
				>
					<Square className="size-3.5" />
				</Button>
			</div>
		</div>
	);
}

function formatAttendanceTime(value: string | null | undefined) {
	if (!value) return '--:--';

	return new Intl.DateTimeFormat(undefined, {
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(value));
}

function AttendanceStatusPill() {
	const todayQuery = useTodayAttendance();
	const checkIn = useCheckInMutation();
	const checkedInAt = todayQuery.data?.clockIn;

	if (todayQuery.isLoading) {
		return null;
	}

	if (checkedInAt) {
		return (
			<div className="hidden items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 sm:flex">
				Checked in at {formatAttendanceTime(checkedInAt)}
			</div>
		);
	}

	return (
		<Button
			type="button"
			size="sm"
			className="hidden gap-2 sm:inline-flex"
			onClick={() => checkIn.mutate()}
			disabled={checkIn.isPending}
		>
			{checkIn.isPending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
			Check-In
		</Button>
	);
}

function TeamPulsePopover() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label="Team pulse"
				>
					<Activity />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="z-50 w-96 border bg-popover p-0 text-popover-foreground shadow-xl"
			>
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
	const clockedInCount = pulse.filter((item) => item.status === 'clocked_in').length;

	return (
		<div>
			<div className="border-b px-4 py-3">
				<p className="text-sm font-medium">Team Pulse</p>
				<p className="text-xs text-muted-foreground">{clockedInCount} clocked in / {pulse.length} team members</p>
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
							<TeamPulseRow
								key={item.user?.id ?? item.attendanceId}
								item={item}
								now={now}
							/>
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
	const name = item.user?.name ?? 'Someone';
	const elapsed = useMemo(() => formatElapsedTime(elapsedSecondsSince(item.timerStartedAt, now)), [item.timerStartedAt, now]);
	const message = item.activeTaskTitle
		? `${name} is working on ${item.activeTaskTitle} (${elapsed})`
		: item.status === 'clocked_in'
			? `${name} is clocked in but idle`
			: `${name} is idle`;

	return (
		<div className="rounded-md px-3 py-2 hover:bg-muted/50">
			<div className="flex items-start justify-between gap-3">
				<p className="text-sm leading-5">{message}</p>
				<span className={item.status === 'clocked_in' ? 'mt-1 size-2 rounded-full bg-emerald-500' : 'mt-1 size-2 rounded-full bg-slate-300'} />
			</div>
			{item.activeProjectTitle && <p className="mt-0.5 text-xs text-muted-foreground">{item.activeProjectTitle}</p>}
		</div>
	);
}
