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
			<div className="relative min-h-screen bg-transparent">
				<AppSidebar />
				<div className={cn("flex min-h-screen flex-col transition-[margin] duration-300 ease-out", isCollapsed ? "lg:ml-[5.5rem]" : "lg:ml-[17rem]")}>
					<DashboardNavbar />
					<main className="flex-1 px-4 pt-4 pb-8 lg:px-6 lg:pt-5">{children}</main>
				</div>
            </div>
        </ProtectedDashboardRoute>
    );
}
