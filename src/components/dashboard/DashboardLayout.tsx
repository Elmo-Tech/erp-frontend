"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
	children: ReactNode;
	allowedRoles?: string[];
	requiredPermission?: string;
}

export function DashboardLayout({ children, allowedRoles, requiredPermission }: DashboardLayoutProps) {
	const { isCollapsed } = useSidebarStore();

	return (
		<ProtectedRoute
			allowedRoles={allowedRoles}
			requiredPermission={requiredPermission}
		>
			<div className="min-h-screen bg-background">
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
					<main className="p-4 lg:p-6">{children}</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
