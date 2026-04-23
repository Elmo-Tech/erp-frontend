"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/_old/store/authStore";
import { Loader2 } from "lucide-react";

// TODO: Add splash screen

export default function Home() {
	const router = useRouter();
	const { isAuthenticated, role } = useAuthStore();

	useEffect(() => {
		if (isAuthenticated) {
			if (role === "client") {
				router.push("/client");
			} else {
				router.push("/dashboard");
			}
		} else {
			router.push("/login");
		}
	}, [isAuthenticated, role, router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
		</div>
	);
}
