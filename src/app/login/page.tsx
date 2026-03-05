"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoginForm } from "@/features/auth";
import { useAuthStore } from "@/store/authStore";

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
		<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted p-4">
			<div className="w-full max-w-md">
				<div className="mb-8 flex flex-col items-center text-center">
					<Image
						src="/logo.webp"
						alt="Elmo ERP"
						width={80}
						height={80}
						className="mb-4 rounded-xl"
						priority
					/>
					<h1 className="text-3xl font-bold text-primary">Elmo ERP</h1>
					<p className="mt-2 text-muted-foreground">Enterprise Resource Planning System</p>
				</div>
				<LoginForm />
			</div>
		</div>
	);
}
