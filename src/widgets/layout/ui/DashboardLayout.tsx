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
	requiredPermission?: string;
}

export function DashboardLayout({ children, allowedRoles, requiredPermission }: DashboardLayoutProps) {
	const { isCollapsed } = useSidebarStore();

	return (
		<ProtectedDashboardRoute
			allowedRoles={allowedRoles}
			requiredPermission={requiredPermission}
		>
			<div className="min-h-screen bg-background">
				<AppSidebar />
				{/* Content shifts right by exactly the sidebar width.
				    The sidebar is `fixed` so it's out of flow — we use
				    margin-left (not flex) to create the offset. */}
				<div className={cn("flex flex-col min-h-screen transition-all duration-300", isCollapsed ? "lg:ml-[70px]" : "lg:ml-64")}>
					<DashboardNavbar />
					<main className="flex-1 p-4 lg:p-6">{children}</main>
				</div>
			</div>
		</ProtectedDashboardRoute>
	);
}
