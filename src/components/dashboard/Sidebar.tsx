"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, Settings, ChevronLeft, ChevronRight, Clock, Shield, BookOpen, BarChart3, Building2, X, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TABLES_APP_NAME, canShowNavigationItem, dashboardNavGroups } from "@/config/simplification";

const navIcons: Record<string, React.ElementType> = {
	dashboard: LayoutDashboard,
	clients: Building2,
	projects: FolderKanban,
	"my-tasks": ListTodo,
	wiki: BookOpen,
	employees: Users,
	"my-attendance": Clock,
	"attendance-management": Clock,
	reports: BarChart3,
	roles: Shield,
	settings: Settings,
};

export function Sidebar() {
	const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebarStore();
	const pathname = usePathname();
	const { role, hasPermission } = useAuthStore();

	useEffect(() => {
		closeMobile();
	}, [pathname, closeMobile]);

	// Check if a nav item is active
	const isItemActive = (href: string) => {
		// Exact match for dashboard home
		if (href === "/dashboard") {
			return pathname === "/dashboard";
		}

		// Special handling for admin routes to avoid conflicts
		if (href === "/dashboard/admin") {
			// Only active if exactly on admin page or admin sub-pages (but not employees)
			return pathname === "/dashboard/admin" || (pathname.startsWith("/dashboard/admin/") && !pathname.startsWith("/dashboard/employees"));
		}

		// For other routes, check if pathname starts with href
		return pathname === href || pathname.startsWith(`${href}/`);
	};

	// Filter items based on permissions
	const filterItems = (items: (typeof dashboardNavGroups)[number]["items"]) => {
		return items.filter((item) => canShowNavigationItem(item, { role, hasPermission }));
	};

	const showCollapsed = isCollapsed && !isMobileOpen;

	return (
		<TooltipProvider delayDuration={0}>
			{/* Mobile Overlay */}
			{isMobileOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={closeMobile}
				/>
			)}

			<aside
				className={cn("fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-sidebar transition-all duration-300", "lg:translate-x-0", isCollapsed ? "lg:w-[70px]" : "lg:w-64", isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full")}
			>
				{/* Logo */}
				<div className="flex h-16 items-center justify-between border-b px-4">
					{(!isCollapsed || isMobileOpen) && (
						<Link
							href="/dashboard"
							className="flex items-center gap-2"
						>
							<Image
								src="/logo.webp"
								alt={TABLES_APP_NAME}
								width={32}
								height={32}
								className="rounded-lg"
							/>
							<span className="text-lg font-semibold">{TABLES_APP_NAME}</span>
						</Link>
					)}
					{isCollapsed && !isMobileOpen && (
						<Link
							href="/dashboard"
							className="mx-auto"
						>
							<Image
								src="/logo.webp"
								alt={TABLES_APP_NAME}
								width={32}
								height={32}
								className="rounded-lg"
							/>
						</Link>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={closeMobile}
						className="h-8 w-8 lg:hidden"
					>
						<X className="h-4 w-4" />
					</Button>
					{!isCollapsed && (
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleCollapsed}
							className="hidden h-8 w-8 lg:flex"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Expand button when collapsed */}
				{isCollapsed && (
					<div className="hidden lg:flex justify-center py-2 border-b">
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleCollapsed}
							className="h-8 w-8"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}

				{/* Navigation */}
				<nav className="flex-1 overflow-y-auto py-4">
					{dashboardNavGroups.map((group) => {
						const filteredItems = filterItems(group.items);
						if (filteredItems.length === 0) return null;

						return (
							<div
								key={group.title}
								className="mb-6"
							>
								{/* Group Header */}
								{!showCollapsed && <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</h3>}
								{showCollapsed && <div className="h-px bg-border mx-3 mb-2" />}

								{/* Group Items */}
								<div className="space-y-1 px-3">
									{filteredItems.map((item) => {
										const isActive = isItemActive(item.href);
										const Icon = navIcons[item.id] ?? LayoutDashboard;

										const linkContent = (
											<Link
												href={item.href}
												className={cn(
													"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
													isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
													showCollapsed && "justify-center px-2",
												)}
											>
												<Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary-foreground")} />
												{!showCollapsed && <span>{item.title}</span>}
											</Link>
										);

										if (showCollapsed) {
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
								</div>
							</div>
						);
					})}
				</nav>

				{/* Footer */}
				<div className="border-t p-4">{(!isCollapsed || isMobileOpen) && <p className="text-xs text-muted-foreground text-center">© 2026 {TABLES_APP_NAME}</p>}</div>
			</aside>
		</TooltipProvider>
	);
}
