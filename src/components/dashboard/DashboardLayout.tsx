"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
	children: ReactNode;
	allowedRoles?: string[];
	requiredPermission?: string;
}

export function DashboardLayout({ children, allowedRoles, requiredPermission }: DashboardLayoutProps) {
	return (
		<ProtectedRoute
			allowedRoles={allowedRoles}
			requiredPermission={requiredPermission}
		>
			<div className="min-h-screen bg-background">
				{/* Sidebar */}
				<Sidebar />

				{/* Main Content */}
				<div className="ml-64 transition-all duration-300">
					{/* Navbar */}
					<Navbar />

					{/* Page Content */}
					<main className="p-6">{children}</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
