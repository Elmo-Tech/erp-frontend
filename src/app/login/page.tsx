"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { LoginWidget } from "@/widgets/auth/ui/LoginWidget";

export default function LoginPage() {
	const router = useRouter();
	const { isAuthenticated, tokenExpiresAt, logout, hasPermission } = useAuthStore();

	useEffect(() => {
		// Check if token is expired
		if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
			logout();
			return;
		}

		if (isAuthenticated) {
			if (hasPermission("access_client_portal")) {
				router.push("/client");
			} else {
				router.push("/dashboard");
			}
		}
	}, [isAuthenticated, hasPermission, tokenExpiresAt, logout, router]);

	return (
		<div className="flex min-h-screen items-center justify-center w-full bg-linear-to-br from-background to-muted p-4">
			<LoginWidget />
		</div>
	);
}
