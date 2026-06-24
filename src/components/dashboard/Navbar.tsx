"use client";

import { LogOut, User, Settings, Menu, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { NavbarTimer } from "@/components/NavbarTimer";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { ActiveTimersSheet } from "@/features/admin/components/ActiveTimersSheet";
import { useActiveTimers } from "@/features/sales/hooks/useTimeEntries";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getRoleLabel } from "@/config/simplification";

export function Navbar() {
	const { user, role } = useAuthStore();
	const { toggleMobileOpen } = useSidebarStore();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();

	// Only fetch active timers for admin/super-admin
	const isAdmin = role === "admin" || role === "super-admin";
	const { data: activeTimers = [] } = useActiveTimers();

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getRoleBadgeColor = (role: string | null) => {
		switch (role) {
			case "super-admin":
				return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
			case "admin":
				return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
			case "manager":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
			case "developer":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
			default:
				return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
		}
	};

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 lg:px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
			{/* Left side - Mobile menu + Search */}
			<div className="flex items-center gap-3">
				{/* Mobile menu button */}
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleMobileOpen}
					className="h-9 w-9 lg:hidden"
				>
					<Menu className="h-5 w-5" />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</div>

			{/* Right side */}
			<div className="flex items-center gap-3">
				{/* Timer Widget - Compact version for navbar */}
				<NavbarTimer />

				{/* Active Timers - Admin/Super Admin only */}
				{isAdmin && (
					<ActiveTimersSheet>
						<Button
							variant="ghost"
							size="sm"
							className="relative gap-2"
						>
							<Timer className="h-4 w-4" />
							<span className="hidden sm:inline">Active Timers</span>
							{activeTimers.length > 0 && (
								<Badge
									variant="destructive"
									className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
								>
									{activeTimers.length}
								</Badge>
							)}
						</Button>
					</ActiveTimersSheet>
				)}

				{/* Theme Toggle */}
				<ThemeToggle />

				{/* Notifications */}
				<NotificationDropdown />

				{/* User Menu */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="flex items-center gap-2 px-2"
						>
							<Avatar className="h-8 w-8">
								<AvatarImage
									src={user?.avatar}
									alt={user?.name}
								/>
								<AvatarFallback className="bg-primary/10 text-primary text-xs">{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
							</Avatar>
							<div className="hidden flex-col items-start text-left md:flex">
								<span className="text-sm font-medium">{user?.name || "User"}</span>
								<span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(role)}`}>{getRoleLabel(role)}</span>
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
								<User className="mr-2 h-4 w-4" />
								Profile
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/dashboard/settings">
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => logout()}
							disabled={isLoggingOut}
							className="text-destructive focus:text-destructive"
						>
							<LogOut className="mr-2 h-4 w-4" />
							{isLoggingOut ? "Signing out..." : "Sign Out"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
