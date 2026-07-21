"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isPermissionGranted, useAuthStore } from "@/entities/user/model/auth.store";
import { useAuthProfileSync } from "@/features/auth/model/use-auth-profile-sync";

interface ProtectedDashboardRouteProps {
	children: React.ReactNode;
	allowedRoles?: string[];
	requiredPermission?: string | string[];
}

export function ProtectedDashboardRoute({ children, allowedRoles, requiredPermission }: ProtectedDashboardRouteProps) {
	const router = useRouter();
	const { isAuthenticated, role, permissions, tokenExpiresAt, logout } = useAuthStore();
	const hasRequiredPermission = !requiredPermission || (typeof requiredPermission === "string"
		? isPermissionGranted(permissions, requiredPermission)
		: requiredPermission.some((permission) => isPermissionGranted(permissions, permission)));
	const [hasHydrated, setHasHydrated] = useState(() => useAuthStore.persist?.hasHydrated?.() ?? false);
	const profileQuery = useAuthProfileSync(hasHydrated && isAuthenticated);

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
		if (!hasHydrated || profileQuery.isPending) return;
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

		if (!hasRequiredPermission) {
			router.replace("/unauthorized");
			return;
		}
	}, [allowedRoles, hasHydrated, hasRequiredPermission, isAuthenticated, logout, profileQuery.isPending, role, router, tokenExpiresAt]);

	const isExpiredWithoutCookie = Boolean(tokenExpiresAt && new Date(tokenExpiresAt) < new Date() && !hasAuthCookie());
	const isRoleDenied = Boolean(allowedRoles && role && !allowedRoles.includes(role));
	const isPermissionDenied = !hasRequiredPermission;
	const canRender = hasHydrated && !profileQuery.isPending && isAuthenticated && !isExpiredWithoutCookie && !isRoleDenied && !isPermissionDenied;

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
