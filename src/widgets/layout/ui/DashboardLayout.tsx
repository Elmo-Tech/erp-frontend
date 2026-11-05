"use client";

import { ReactNode } from "react";
import { Sidebar as AppSidebar } from "./AppSidebar";
import { useSidebarStore } from "../model/sidebar.store";
import { cn } from "@/shared/lib/utils";
import { DashboardNavbar } from "./DashboardNavbar";
import { ProtectedDashboardRoute } from "./ProtectedDashboardRoute";

interface DashboardLayoutProps {
	children: ReactNode;
	allowedRoles?: string[];
	requiredPermission?: string | string[];
}

export function DashboardLayout({ children, allowedRoles, requiredPermission }: DashboardLayoutProps) {
	const { isCollapsed } = useSidebarStore();

	return (
		<ProtectedDashboardRoute allowedRoles={allowedRoles} requiredPermission={requiredPermission}>
			<div className="relative min-h-screen bg-background">
				<a href="#main-content" className="sr-only z-[100] rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
					Skip to content
				</a>
				<AppSidebar />
				<div
					className={cn(
						"flex min-h-screen min-w-0 flex-col transition-[margin] duration-300 ease-out md:ml-(--sidebar-width-collapsed)",
						isCollapsed ? "lg:ml-(--sidebar-width-collapsed)" : "lg:ml-(--sidebar-width)",
					)}
				>
					<DashboardNavbar />
					<main id="main-content" className="mx-auto w-full max-w-(--content-max) flex-1 px-4 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-7">
						{children}
					</main>
				</div>
			</div>
		</ProtectedDashboardRoute>
	);
}
