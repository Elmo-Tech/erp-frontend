"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeWithFallback } from "@/lib/realtimeSubscription";
import { useAuthStore } from "@/store/authStore";

/** Initialize once in DashboardLayout, independent of which monitoring view is open. */
export function useWorkMonitoringSocketInit() {
	const queryClient = useQueryClient();
	const { user, role, hasPermission } = useAuthStore();
	const canMonitor = hasPermission("view_all_time_entries") || (
		(role === "admin" || role === "super-admin")
		&& (hasPermission("view_dashboard") || hasPermission("view_dashboard_overview"))
	);

	useEffect(() => {
		if (!user?.userId || !canMonitor) return;
		let refreshTimeout: ReturnType<typeof setTimeout> | undefined;
		const refresh = () => {
			void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			void queryClient.invalidateQueries({ queryKey: ["timeEntries", "activeTimers"] });
		};
		const cleanup = subscribeWithFallback({
			channelName: "work-monitoring",
			event: ".work.activity.changed",
			onRefresh: refresh,
			onEvent: () => {
				// A transaction can change a task and multiple timers together.
				if (refreshTimeout !== undefined) return;
				refreshTimeout = setTimeout(() => {
					refreshTimeout = undefined;
					if (document.visibilityState === "visible" && navigator.onLine) refresh();
				}, 150);
			},
		});
		return () => { cleanup(); clearTimeout(refreshTimeout); };
	}, [user?.userId, canMonitor, queryClient]);
}
