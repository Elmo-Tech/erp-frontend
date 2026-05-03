"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { LoginWidget } from "@/widgets/auth/ui/LoginWidget";

export default function LoginPage() {
	const router = useRouter();
	const { isAuthenticated, role, tokenExpiresAt, logout } = useAuthStore();

	useEffect(() => {
		// Check if token is expired
		if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
			logout();
			return;
		}

		if (isAuthenticated) {
			if (role === "client") {
				router.push("/client");
			} else {
				router.push("/dashboard");
			}
		}
	}, [isAuthenticated, role, tokenExpiresAt, logout, router]);

	return (
		<div className="flex min-h-screen items-center justify-center w-full bg-linear-to-br from-background to-muted p-4">
			<LoginWidget />
		</div>
	);
}
