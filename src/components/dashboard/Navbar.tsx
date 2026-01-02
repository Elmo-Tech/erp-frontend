"use client";

import { Bell, Search, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { CompactTimerWidget } from "@/components/TimerWidget";
import Link from "next/link";

export function Navbar() {
	const { user, role } = useAuthStore();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();

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
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
			{/* Search */}
			<div className="flex items-center gap-4">
				<div className="relative hidden md:block">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search..."
						className="w-64 pl-9 lg:w-80"
					/>
				</div>
			</div>

			{/* Right side */}
			<div className="flex items-center gap-3">
				{/* Timer Widget - Compact version for navbar */}
				<CompactTimerWidget />

				{/* Theme Toggle */}
				<ThemeToggle />

				{/* Notifications */}
				<Button
					variant="ghost"
					size="icon"
					className="relative h-9 w-9"
				>
					<Bell className="h-4 w-4" />
					<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">3</span>
					<span className="sr-only">Notifications</span>
				</Button>

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
								<span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(role)}`}>{role || "guest"}</span>
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
