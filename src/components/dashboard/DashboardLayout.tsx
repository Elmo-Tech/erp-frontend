"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useSidebarStore } from "@/store/sidebarStore";
import { useTimerSocketInit } from "@/hooks/useTimerSocket";
import { useNotificationSocketInit } from "@/hooks/useNotificationSocket";
import { cn } from "@/lib/utils";
import { TimerReminderDialog } from "@/components/TimerReminderDialog";
import { usePathname } from "next/navigation";
import { pagePermissions } from "@/config/access";
import { useAuthStore } from "@/store/authStore";
import { usePermissionSync } from "@/hooks/usePermissionSync";

interface DashboardLayoutProps {
	children: ReactNode;
	allowedRoles?: string[];
	requiredPermission?: string;
}

export function DashboardLayout({ children, allowedRoles, requiredPermission }: DashboardLayoutProps) {
	const { isCollapsed } = useSidebarStore();
	const pathname = usePathname();
	const { hasPermission } = useAuthStore((state) => state);
	const required = pagePermissions(pathname);
	const allowed = required.length === 0 || required.some(hasPermission);

	// Initialize WebSocket connections
	useTimerSocketInit();
	useNotificationSocketInit();
	usePermissionSync();

	return (
		<ProtectedRoute
			allowedRoles={allowedRoles}
			requiredPermission={requiredPermission}
		>
			<div className="min-h-screen bg-background">
				<TimerReminderDialog />
				{/* Sidebar */}
				<Sidebar />

				{/* Main Content */}
				<div
					className={cn(
						"transition-all duration-300",
						// Desktop: margin based on sidebar state
						isCollapsed ? "lg:ml-16" : "lg:ml-64",
						// Mobile: no margin (sidebar is overlay)
						"ml-0"
					)}
				>
					{/* Navbar */}
					<Navbar />

					{/* Page Content */}
					<main className="p-4 lg:p-6">{allowed ? children : <div role="alert" className="rounded-xl border p-6">You do not have permission to access this page.</div>}</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
