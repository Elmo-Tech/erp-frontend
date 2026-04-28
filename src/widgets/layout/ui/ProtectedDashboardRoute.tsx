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
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
				logout();
				router.push("/login");
				return;
			}

			if (!isAuthenticated) {
				router.push("/login");
				return;
			}

			if (allowedRoles && role && !allowedRoles.includes(role)) {
				router.push("/unauthorized");
				return;
			}

			if (requiredPermission && !hasPermission(requiredPermission)) {
				router.push("/unauthorized");
				return;
			}

			setIsChecking(false);
		}, 100);

		return () => window.clearTimeout(timer);
	}, [allowedRoles, hasPermission, isAuthenticated, logout, requiredPermission, role, router, tokenExpiresAt]);

	if (isChecking) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	return <>{children}</>;
}

