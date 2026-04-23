"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/_old/store/authStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: string[];
	requiredPermission?: string;
}

export function ProtectedRoute({ children, allowedRoles, requiredPermission }: ProtectedRouteProps) {
	const router = useRouter();
	const { isAuthenticated, role, hasPermission, tokenExpiresAt, logout } = useAuthStore();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		// Wait for hydration
		const timer = setTimeout(() => {
			// Check if token is expired
			if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
				logout();
				router.push("/login");
				return;
			}

			if (!isAuthenticated) {
				router.push("/login");
				return;
			}

			// Check role access
			if (allowedRoles && role && !allowedRoles.includes(role)) {
				router.push("/unauthorized");
				return;
			}

			// Check permission access
			if (requiredPermission && !hasPermission(requiredPermission)) {
				router.push("/unauthorized");
				return;
			}

			setIsChecking(false);
		}, 100);

		return () => clearTimeout(timer);
	}, [isAuthenticated, role, allowedRoles, requiredPermission, hasPermission, tokenExpiresAt, logout, router]);

	if (isChecking) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return <>{children}</>;
}
