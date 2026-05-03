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
	// نبدأ بـ true عشان ننتظر الـ hydration من localStorage
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		// ننتظر الـ Zustand persist hydration من localStorage
		// useAuthStore.persist.hasHydrated() بيرجع true لما يخلص
		const unsubscribe = useAuthStore.persist.onHydrate(() => {
			// لو الـ hydration بدأت، مش محتاجين نعمل حاجة هنا
		});

		const checkAuth = () => {
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
		};

		// لو الـ hydration خلصت بالفعل، نعمل الـ check فوراً
		if (useAuthStore.persist.hasHydrated()) {
			checkAuth();
		} else {
			// ننتظر الـ hydration تخلص
			const finishUnsubscribe = useAuthStore.persist.onFinishHydration(() => {
				checkAuth();
			});
			return () => {
				unsubscribe();
				finishUnsubscribe();
			};
		}

		return () => {
			unsubscribe();
		};
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
