"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { isPermissionGranted, useAuthStore } from "@/entities/user/model/auth.store";
import { useSidebarStore } from "@/widgets/layout/model/sidebar.store";
import { useMediaQuery } from "@/widgets/layout/model/use-media-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { SidebarConfig } from "@/shared/config/sidebar";

interface NavItem {
	title: string;
	href: string;
	icon: React.ElementType;
	permission?: string | string[];
}

interface NavGroup {
	title: string;
	items: NavItem[];
}

const navGroups: NavGroup[] = SidebarConfig;

export function BrandLogo({ className }: { className?: string }) {
	return (
		<span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-[0_1px_2px_rgb(0_0_0/0.25)] ring-1 ring-white/10", className)}>
			<Image src="/logo.webp" alt="Elmo ERP" width={96} height={133} priority className="h-6.5 w-auto" />
		</span>
	);
}

export function Sidebar() {
	const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebarStore();
	const pathname = usePathname();
	const permissions = useAuthStore((state) => state.permissions);
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isTablet = useMediaQuery("(min-width: 768px)");

	useEffect(() => {
		closeMobile();
	}, [pathname, closeMobile]);

	useEffect(() => {
		if (!isMobileOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeMobile();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isMobileOpen, closeMobile]);

	const isItemActive = (href: string) => {
		if (href === "/dashboard/my-workspace") return pathname === href || pathname === "/dashboard";
		return pathname === href || pathname.startsWith(`${href}/`);
	};

	const filterItems = (items: NavItem[]) =>
		items.filter((item) => {
			if (typeof item.permission === "string" && !isPermissionGranted(permissions, item.permission)) return false;
			if (Array.isArray(item.permission) && !item.permission.some((permission) => isPermissionGranted(permissions, permission))) return false;
			return true;
		});

	// Desktop honours the user's collapse preference; tablet shows an icon rail; mobile uses a drawer.
	const showCollapsed = !isMobileOpen && (isDesktop ? isCollapsed : isTablet);
	const isOverlay = isMobileOpen && !isDesktop;

	return (
		<TooltipProvider delayDuration={150}>
			{isOverlay && <div className="fixed inset-0 z-40 bg-navy/45 backdrop-blur-[2px] lg:hidden" onClick={closeMobile} aria-hidden="true" />}

			<aside
				aria-label="Main navigation"
				data-collapsed={showCollapsed || undefined}
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,transform] duration-300 ease-out",
					showCollapsed ? "w-(--sidebar-width-collapsed)" : "w-(--sidebar-width)",
					isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0",
				)}
			>
				{/* Brand */}
				<div className={cn("flex h-(--topbar-height) shrink-0 items-center gap-3 px-4", showCollapsed && "justify-center px-0")}>
					<Link href="/dashboard" className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring" aria-label="Elmo ERP home">
						<BrandLogo />
						{!showCollapsed && <span className="truncate text-[0.9375rem] font-semibold tracking-tight text-white">Elmo ERP</span>}
					</Link>
					{isOverlay && (
						<button type="button" onClick={closeMobile} className="ml-auto flex size-8 items-center justify-center rounded-md text-sidebar-muted hover:bg-sidebar-accent hover:text-white" aria-label="Close navigation">
							<X className="size-4" />
						</button>
					)}
				</div>

				<div className="mx-4 h-px shrink-0 bg-sidebar-border" />

				<nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 [scrollbar-color:rgb(255_255_255/0.12)_transparent]">
					{navGroups.map((group, groupIndex) => {
						const filteredItems = filterItems(group.items);
						if (filteredItems.length === 0) return null;

						return (
							<div key={group.title} className={cn(groupIndex > 0 && "mt-5")}>
								{showCollapsed ? (
									groupIndex > 0 && <div className="mx-2 mb-3 h-px bg-sidebar-border" aria-hidden="true" />
								) : (
									<h3 className="mb-1.5 px-2.5 text-[0.6875rem] font-medium tracking-[0.08em] text-sidebar-muted uppercase">{group.title}</h3>
								)}

								<ul className="space-y-0.5">
									{filteredItems.map((item) => {
										const isActive = isItemActive(item.href);
										const Icon = item.icon;

										const link = (
											<Link
												href={item.href}
												aria-current={isActive ? "page" : undefined}
												aria-label={showCollapsed ? item.title : undefined}
												className={cn(
													"group/nav relative flex h-9 items-center gap-3 rounded-md px-2.5 text-[0.8125rem] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
													isActive ? "bg-white/[0.09] text-white" : "text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-white",
													showCollapsed && "mx-auto w-10 justify-center px-0",
												)}
											>
												{isActive && <span className="absolute top-1.5 bottom-1.5 -left-3 w-[3px] rounded-r-full bg-[#7d9af0]" aria-hidden="true" />}
												<Icon className={cn("size-4 shrink-0", isActive ? "text-[#a9bcf7]" : "text-sidebar-muted group-hover/nav:text-sidebar-foreground")} strokeWidth={1.85} />
												{!showCollapsed && <span className="truncate">{item.title}</span>}
											</Link>
										);

										return (
											<li key={item.href}>
												{showCollapsed ? (
													<Tooltip>
														<TooltipTrigger asChild>{link}</TooltipTrigger>
														<TooltipContent side="right" sideOffset={10} className="font-medium">
															{item.title}
														</TooltipContent>
													</Tooltip>
												) : (
													link
												)}
											</li>
										);
									})}
								</ul>
							</div>
						);
					})}
				</nav>

				{/* Footer: collapse control (desktop only). */}
				<div className="relative shrink-0 border-t border-sidebar-border p-3">
					<span className="brand-arc -top-16 -right-20 size-44 text-white/[0.05]" aria-hidden="true" />
					{isDesktop ? (
						<CollapseButton collapsed={showCollapsed} onToggle={toggleCollapsed} />
					) : (
						!showCollapsed && <p className="px-2.5 text-[0.6875rem] text-sidebar-muted">© {new Date().getFullYear()} Elmo ERP</p>
					)}
				</div>
			</aside>
		</TooltipProvider>
	);
}

function CollapseButton({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
	const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
	const label = collapsed ? "Expand sidebar" : "Collapse sidebar";

	const button = (
		<button
			type="button"
			onClick={onToggle}
			aria-label={label}
			aria-expanded={!collapsed}
			className={cn(
				"relative flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-[0.8125rem] font-medium text-sidebar-muted outline-none transition-colors hover:bg-sidebar-accent hover:text-white focus-visible:ring-2 focus-visible:ring-sidebar-ring",
				collapsed && "mx-auto w-10 justify-center px-0",
			)}
		>
			<Icon className="size-4 shrink-0" strokeWidth={1.85} />
			{!collapsed && <span>Collapse</span>}
		</button>
	);

	if (!collapsed) return button;

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent side="right" sideOffset={10}>
				{label}
			</TooltipContent>
		</Tooltip>
	);
}
