"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, Settings, ChevronLeft, ChevronRight, Building2, X, Shield } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useSidebarStore } from "@/widgets/layout/model/sidebar.store";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

interface NavItem {
	title: string;
	href: string;
	icon: React.ElementType;
	permission?: string;
	roles?: string[];
}

interface NavGroup {
	title: string;
	items: NavItem[];
}

const navGroups: NavGroup[] = [
	{
		title: "Overview",
		items: [
			{
				title: "Dashboard",
				href: "/dashboard",
				icon: LayoutDashboard,
			},
		],
	},
	{
		title: "CRM",
		items: [
			{
				title: "Clients",
				href: "/dashboard/clients",
				icon: Building2,
				permission: "view_clients",
			},
		],
	},
	{
		title: "Project Management",
		items: [
			{
				title: "Projects",
				href: "/dashboard/projects",
				icon: FolderKanban,
				permission: "view_projects",
			},
		],
	},
	{
		title: "Administration",
		items: [
			{
				title: "Roles & Permissions",
				href: "/dashboard/roles",
				icon: Shield,
				permission: "manage_roles",
			},
			{
				title: "Settings",
				href: "/settings",
				icon: Settings,
			},
		],
	},
];

export function Sidebar() {
	const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebarStore();
	const pathname = usePathname();
	const { role, hasPermission } = useAuthStore();

	useEffect(() => {
		closeMobile();
	}, [pathname, closeMobile]);

	const isItemActive = (href: string) => {
		if (href === "/dashboard") {
			return pathname === "/dashboard";
		}

		return pathname === href || pathname.startsWith(`${href}/`);
	};

	const filterItems = (items: NavItem[]) => {
		return items.filter((item) => {
			if (item.permission && !hasPermission(item.permission)) return false;
			if (item.roles && role && !item.roles.includes(role)) return false;
			return true;
		});
	};

	const showCollapsed = isCollapsed && !isMobileOpen;

	return (
		<TooltipProvider delayDuration={0}>
			{isMobileOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={closeMobile}
				/>
			)}

			<aside
				className={cn("fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/10 bg-sidebar/70 backdrop-blur-lg transition-all duration-300", "lg:translate-x-0", isCollapsed ? "lg:w-17.5" : "lg:w-64", isMobileOpen ? "translate-x-0 w-264" : "-translate-x-full")}
			>
				<div className="flex h-16 items-center justify-between border-b px-4">
					{(!isCollapsed || isMobileOpen) && (
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
					{isCollapsed && !isMobileOpen && (
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

				<nav className="flex-1 overflow-y-auto py-4">
					{navGroups.map((group) => {
						const filteredItems = filterItems(group.items);
						if (filteredItems.length === 0) return null;

						return (
							<div
								key={group.title}
								className="mb-6"
							>
								{!showCollapsed && <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</h3>}
								{showCollapsed && <div className="h-px bg-border mx-3 mb-2" />}

								<div className="space-y-1 px-3">
									{filteredItems.map((item) => {
										const isActive = isItemActive(item.href);
										const Icon = item.icon;

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

				<div className="border-t p-4">{(!isCollapsed || isMobileOpen) && <p className="text-xs text-muted-foreground text-center">© 2026 Elmo ERP</p>}</div>
			</aside>
		</TooltipProvider>
	);
}
