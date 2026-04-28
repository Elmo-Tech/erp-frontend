"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Menu, Moon, Search, Settings, Sun, Timer, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import api from "@/shared/api/base";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useSidebarStore } from "@/_old/store/sidebarStore";
import { useActiveTimers } from "@/features/time-entries/model/use-time-entry-actions";
import { useRealtimeTimer } from "@/features/time-entries/model/use-timer-realtime";
import { ActiveTimersSheet } from "@/widgets/time-tracking/ui/ActiveTimersSheet";
import { SystemNotificationsDropdown } from "@/widgets/system-notifications/ui/SystemNotificationsDropdown";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { formatSecondsClock, getElapsedSeconds } from "@/shared/lib/time";
import { useEffect, useState } from "react";

export function DashboardNavbar() {
	const router = useRouter();
	const { resolvedTheme, setTheme } = useTheme();
	const { user, role, logout } = useAuthStore();
	const { toggleMobileOpen } = useSidebarStore();
	const { activeTimer, isLoading } = useRealtimeTimer();
	const activeTimersQuery = useActiveTimers();
	const [now, setNow] = useState(() => Date.now());
	const isAdmin = role === "admin" || role === "super-admin";
	const elapsedSeconds = activeTimer ? getElapsedSeconds(activeTimer.startTime, now) : 0;

	const logoutMutation = useMutation({
		mutationFn: () => api.post("/auth/logout"),
		onSettled: () => {
			logout();
			router.push("/login");
		},
	});

	useEffect(() => {
		if (!activeTimer) {
			return;
		}

		const interval = window.setInterval(() => setNow(Date.now()), 1000);

		return () => window.clearInterval(interval);
	}, [activeTimer]);

	const initials = user?.name
		? user.name
				.split(" ")
				.map((part) => part[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "U";

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 lg:px-6">
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
				<div className="hidden items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5 md:flex">
					{isLoading ? (
						<span className="text-xs text-muted-foreground">Timer loading</span>
					) : activeTimer ? (
						<>
							<span className="size-2 rounded-full bg-green-500" />
							<span className="max-w-36 truncate text-xs text-muted-foreground">{activeTimer.trackableDisplayName}</span>
							<span className="font-mono text-sm tabular-nums">{formatSecondsClock(elapsedSeconds)}</span>
						</>
					) : (
						<span className="text-xs text-muted-foreground">No timer</span>
					)}
				</div>

				{isAdmin && (
					<ActiveTimersSheet>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="relative"
						>
							<Timer data-icon="inline-start" />
							<span className="hidden sm:inline">Active timers</span>
							{Boolean(activeTimersQuery.data?.length) && (
								<Badge
									variant="destructive"
									className="absolute -right-1 -top-1 flex size-5 items-center justify-center p-0 text-xs"
								>
									{activeTimersQuery.data?.length}
								</Badge>
							)}
						</Button>
					</ActiveTimersSheet>
				)}

				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
					aria-label="Toggle theme"
				>
					{resolvedTheme === "dark" ? <Sun /> : <Moon />}
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
							{logoutMutation.isPending ? "Signing out..." : "Sign out"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
