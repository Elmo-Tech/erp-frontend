"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/_old/components/dashboard/Sidebar";
import { useSidebarStore } from "@/_old/store/sidebarStore";
import { useNotificationRealtimeInit } from "@/features/notifications/model/use-notification-realtime";
import { useTimerRealtimeInit } from "@/features/time-entries/model/use-timer-realtime";
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

	useTimerRealtimeInit();
	useNotificationRealtimeInit();

	return (
		<ProtectedDashboardRoute
			allowedRoles={allowedRoles}
			requiredPermission={requiredPermission}
		>
			<div className="min-h-screen bg-background">
				<Sidebar />
				<div className={cn("ml-0 transition-all duration-300", isCollapsed ? "lg:ml-16" : "lg:ml-64")}>
					<DashboardNavbar />
					<main className="p-4 lg:p-6">{children}</main>
				</div>
			</div>
		</ProtectedDashboardRoute>
	);
}

