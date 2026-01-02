"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, FileText, Settings, ChevronLeft, ChevronRight, TrendingUp, Clock, Shield, BookOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
	title: string;
	href: string;
	icon: React.ElementType;
	permission?: string;
	roles?: string[];
}

const navItems: NavItem[] = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Sales",
		href: "/dashboard/sales",
		icon: TrendingUp,
	},
	{
		title: "Projects",
		href: "/dashboard/projects",
		icon: FolderKanban,
	},
	{
		title: "Tasks",
		href: "/dashboard/tasks",
		icon: FileText,
	},
	{
		title: "Attendance",
		href: "/dashboard/attendance",
		icon: Clock,
	},
	{
		title: "Wiki",
		href: "/dashboard/wiki",
		icon: BookOpen,
	},
	{
		title: "Users",
		href: "/dashboard/users",
		icon: Users,
		permission: "manage_users",
	},
	{
		title: "Admin",
		href: "/dashboard/admin",
		icon: BarChart3,
		permission: "view_admin_stats",
	},
	{
		title: "Roles & Permissions",
		href: "/dashboard/admin/roles",
		icon: Shield,
		permission: "manage_roles",
	},
	{
		title: "Settings",
		href: "/dashboard/settings",
		icon: Settings,
	},
];

export function Sidebar() {
	const [collapsed, setCollapsed] = useState(false);
	const pathname = usePathname();
	const { role, hasPermission } = useAuthStore();

	const filteredNavItems = navItems.filter((item) => {
		if (item.permission && !hasPermission(item.permission)) return false;
		if (item.roles && role && !item.roles.includes(role)) return false;
		return true;
	});

	return (
		<TooltipProvider delayDuration={0}>
			<aside className={cn("fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar transition-all duration-300", collapsed ? "w-16" : "w-64")}>
				{/* Logo */}
				<div className="flex h-16 items-center justify-between border-b px-4">
					{!collapsed && (
						<Link
							href="/dashboard"
							className="flex items-center gap-2"
						>
							<Image
								src="/logo.webp"
								alt="Elmo ERP"
								width={32}
								height={32}
								className="rounded-lg"
							/>
							<span className="text-lg font-semibold">Elmo ERP</span>
						</Link>
					)}
					{collapsed && (
						<Link
							href="/dashboard"
							className="mx-auto"
						>
							<Image
								src="/logo.webp"
								alt="Elmo ERP"
								width={32}
								height={32}
								className="rounded-lg"
							/>
						</Link>
					)}
					{!collapsed && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setCollapsed(!collapsed)}
							className="h-8 w-8"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Expand button when collapsed */}
				{collapsed && (
					<div className="flex justify-center py-2 border-b">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setCollapsed(false)}
							className="h-8 w-8"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}

				{/* Navigation */}
				<nav className="flex-1 space-y-1 overflow-y-auto p-2">
					{filteredNavItems.map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
						const Icon = item.icon;

						const linkContent = (
							<Link
								href={item.href}
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
									isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50",
									collapsed && "justify-center px-2"
								)}
							>
								<Icon className="h-5 w-5 shrink-0" />
								{!collapsed && <span>{item.title}</span>}
							</Link>
						);

						if (collapsed) {
							return (
								<Tooltip key={item.href}>
									<TooltipTrigger asChild>{linkContent}</TooltipTrigger>
									<TooltipContent
										side="right"
										className="font-medium"
									>
										{item.title}
									</TooltipContent>
								</Tooltip>
							);
						}

						return <div key={item.href}>{linkContent}</div>;
					})}
				</nav>

				{/* Footer */}
				<div className="border-t p-4">{!collapsed && <p className="text-xs text-muted-foreground text-center">© 2024 Elmo ERP</p>}</div>
			</aside>
		</TooltipProvider>
	);
}
