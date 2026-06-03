"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/entities/user/model/auth.store";

interface ProtectedDashboardRouteProps {
	children: React.ReactNode;
	allowedRoles?: string[];
	requiredPermission?: string;
}

export function ProtectedDashboardRoute({ children, allowedRoles, requiredPermission }: ProtectedDashboardRouteProps) {
	const router = useRouter();
	const { isAuthenticated, role, hasPermission, tokenExpiresAt, logout } = useAuthStore();
	const [hasHydrated, setHasHydrated] = useState(() => useAuthStore.persist?.hasHydrated?.() ?? false);

	useEffect(() => {
		if (hasHydrated) return;
		const persist = useAuthStore.persist;

		if (!persist) {
			return;
		}

		if (persist.hasHydrated()) {
			queueMicrotask(() => setHasHydrated(true));
			return;
		}

		const unsubscribe = persist.onFinishHydration(() => {
			setHasHydrated(true);
		});

		return unsubscribe;
	}, [hasHydrated]);

	useEffect(() => {
		if (!hasHydrated) return;
		const hasCookie = hasAuthCookie();

		if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date() && !hasCookie) {
			logout();
			router.replace("/login");
			return;
		}

		if (!isAuthenticated && !hasCookie) {
			router.replace("/login");
			return;
		}

		if (allowedRoles && role && !allowedRoles.includes(role)) {
			router.replace("/unauthorized");
			return;
		}

		if (requiredPermission && !hasPermission(requiredPermission)) {
			router.replace("/unauthorized");
			return;
		}
	}, [allowedRoles, hasHydrated, hasPermission, isAuthenticated, logout, requiredPermission, role, router, tokenExpiresAt]);

	const isExpiredWithoutCookie = Boolean(tokenExpiresAt && new Date(tokenExpiresAt) < new Date() && !hasAuthCookie());
	const isRoleDenied = Boolean(allowedRoles && role && !allowedRoles.includes(role));
	const isPermissionDenied = Boolean(requiredPermission && !hasPermission(requiredPermission));
	const canRender = hasHydrated && isAuthenticated && !isExpiredWithoutCookie && !isRoleDenied && !isPermissionDenied;

	if (!canRender) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	return <>{children}</>;
}

function hasAuthCookie() {
	if (typeof document === "undefined") return false;
	return document.cookie.split(";").some((cookie) => cookie.trim().startsWith("csrf_token="));
}
