"use client";

import { useAuthStore } from "@/store/authStore";
import { ClientDashboard } from "@/features/client-portal/components/ClientDashboard";

/**
 * Client Dashboard Page
 * Route: /client
 * Uses ClientDashboard component to display project visibility.
 *
 * Requirements: 13.1 - Display client dashboard with projects
 */
export default function ClientDashboardPage() {
	const { user } = useAuthStore();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Welcome, {user?.name || "Client"} 👋</h1>
				<p className="text-muted-foreground">Here&apos;s an overview of your projects</p>
			</div>

			<ClientDashboard />
		</div>
	);
}
